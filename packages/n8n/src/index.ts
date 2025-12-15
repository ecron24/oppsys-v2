import { createLoggerPino } from "@oppsys/logger";
import {
  getUserProfileForService,
  type OppSysSupabaseClient,
} from "@oppsys/supabase";
import type { N8nInput, N8nModule, N8nResult } from "./n8n-type";
import { extractMessageFromN8n } from "./utilis";
import { toSnakeCase } from "@oppsys/shared";

const logger = createLoggerPino("execute-workflow-n8n");

type ExecuteParams = {
  module: N8nModule;
  input: N8nInput;
  userId: string;
  userEmail: string;
};

export function createN8nInstance({
  supabase,
  N8N_WEBHOOK_AUTH_PASS,
  N8N_WEBHOOK_AUTH_USER,
}: N8nInstanceParams) {
  async function executeWorkflow({
    module,
    input,
    userId,
    userEmail,
  }: ExecuteParams) {
    if (!module.endpoint) {
      throw new Error(
        `Webhook URL (endpoint) manquant pour le module ${module.name}`
      );
    }

    const profileResult = await getUserProfileForService(
      { supabase },
      { userId }
    );

    if (!profileResult.success) {
      logger.error(
        profileResult.error,
        `Impossible de récupérer le profil utilisateur ${userId} via RPC:`
      );
      return {
        success: false,
        kind: "PROFILE_NOT_FOUND",
        error: new Error("Profil utilisateur introuvable"),
      } as const;
    }

    const userProfile = profileResult.data;
    const userPlan = userProfile.plan_name?.toLowerCase() || "free";
    const userStatus = "active";

    const authData = {
      user_id: userId,
      email: userEmail,
      plan: userPlan,
      credit_balance: userProfile.credit_balance || 0,
      status: userStatus,
      full_name: userProfile.full_name,
      role: userProfile.role || "client",
      is_premium: ["solo", "standard", "premium"].includes(userPlan),
      account_created: userProfile.created_at,
      session_timestamp: new Date().toISOString(),
      module_info: {
        id: module.id,
        name: module.name,
        slug: module.slug,
        trigger_type: module.n8nTriggerType,
      },
    };

    let payload = {
      sessionId: input.sessionId,
      input: {
        message: input.message,
        context: input.context || {},
        module_slug: module.slug,
        module_name: module.name,
        module_id: module.id,
        timestamp: new Date().toISOString(),
      },
      metadata: {
        worker_result_id: input.sessionId,
        client_id: userEmail,
        module: {
          id: module.id,
          name: module.name,
          slug: module.slug,
        },
      },
      auth: authData,
    };

    // CONFIGURATION DES HEADERS
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "OppsYs-Backend/1.0",
      "X-OppsYs-User-ID": userId,
      "X-OppsYs-User-Plan": userPlan,
      "X-OppsYs-Module": module.slug,
    };

    // ===== AUTHENTIFICATION BASIC AUTH (VALIDÉE PAR CURL TEST) =====
    const username = N8N_WEBHOOK_AUTH_USER || "oppsys";
    const password = N8N_WEBHOOK_AUTH_PASS || "default-secret";
    const basicAuth = Buffer.from(`${username}:${password}`).toString("base64");
    headers["Authorization"] = `Basic ${basicAuth}`;

    // Logging de l'exécution
    logger.info(
      toSnakeCase({
        payload,
      }),
      `Executing n8n workflow`
    );

    try {
      // Configuration des timeouts par module
      const moduleTimeouts: Record<string, number> = {
        "social-factory": 240000,
        "ai-writer": 180000,
        "document-generator": 300000,
        "real-estate-lease-generator": 240000,
        "email-campaign": 240000,
        "article-writer": 240000, // ✅ AJOUTÉ
        default: 180000,
      };
      const timeoutMs =
        moduleTimeouts[module.slug] || moduleTimeouts["default"];
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        logger.warn(`Timeout après ${timeoutMs / 1000}s pour ${module.name}`);
      }, timeoutMs);

      // Exécution de la requête vers N8N
      const response = await fetch(module.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(toSnakeCase(payload)),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Erreur inconnue");
        logger.error(
          {
            user: userEmail,
            plan: userPlan,
            error: errorText,
            payload_sent: payload,
          },
          `N8N Error ${response.status} for ${module.name}:`
        );
        throw new Error(
          `Module ${module.name} error: ${response.status} - ${errorText}`
        );
      }

      const result: N8nResult = (await response.json()) || {};

      logger.info(
        {
          user: userEmail,
          has_result: !!result,
        },
        `N8N Success for ${module.name}`
      );
      const outputMessage = extractMessageFromN8n(result);

      return { success: true, data: { ...result, outputMessage } } as const;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        logger.warn(
          `Timeout pour ${module.name} - Le workflow continue en arrière-plan`
        );
        return {
          success: false,
          kind: "TIMEOUT",
          error: new Error(
            "Le workflow prend plus de temps que prévu - Vérifiez votre contenu généré dans quelques minutes"
          ),
        } as const;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(
        {
          user: userEmail,
          error: errorMessage,
          payload_sent: payload,
        },
        `N8N Execution failed for ${module.name}:`
      );
      return {
        success: false,
        kind: "EXECUTION_ERROR",
        error: new Error(
          `Échec d'exécution du module ${module.name}: ${errorMessage}`
        ),
      } as const;
    }
  }

  return { executeWorkflow };
}
type N8nInstanceParams = {
  supabase: OppSysSupabaseClient;
  N8N_WEBHOOK_AUTH_USER: string;
  N8N_WEBHOOK_AUTH_PASS: string;
};

export * from "./n8n-type";
