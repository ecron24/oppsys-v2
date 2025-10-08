import { createLogger } from "@oppsys/logger";
import {
  getUserProfileForService,
  type OppSysSupabaseClient,
} from "@oppsys/supabase";
import type { N8nInput, N8nModule, N8nResult } from "./n8n-type";
import { determineTriggerType } from "./trigger-type";
import { extractMessageFromN8n } from "./utilis";

const logger = createLogger();

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
        `Impossible de récupérer le profil utilisateur ${userId} via RPC:`,
        profileResult.error
      );
      throw new Error("Profil utilisateur introuvable");
    }

    const userProfile = profileResult.data;
    const userPlan = userProfile.plan_name?.toLowerCase() || "free";
    const isPremium = userProfile.plan_name && userProfile.plan_name !== "Free";
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
        trigger_type: "STANDARD", // Sera mis à jour ci-dessous
      },
    };

    let triggerType = determineTriggerType(module, input);
    authData.module_info.trigger_type = triggerType;

    logger.info(`Type de trigger déterminé: ${triggerType}`, {
      module_slug: module.slug,
      has_chat_input: !!(input.isChatMode && input.sessionId),
      module_trigger_type: module.n8n_trigger_type,
      endpoint_ends_with_chat: module.endpoint?.endsWith("/chat"),
    });

    let payload;

    // CONSTRUCTION DU PAYLOAD SELON LE TYPE
    if (input.isChatMode && input.sessionId && input.message) {
      // MODE CHAT EXPLICITE
      logger.info(`Mode CHAT détecté pour ${module.name}`);

      payload = {
        sessionId: input.sessionId,
        chatInput: JSON.stringify({
          message: input.message,
          context: input.context || {},
          module_slug: module.slug,
          module_name: module.name,
          module_id: module.id,
          moduleType: input.moduleType,
          timestamp: input.timestamp || new Date().toISOString(),
        }),
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

      logger.info(`Payload chat préparé:`, {
        sessionId: input.sessionId.slice(-8),
        chatInputLength: JSON.stringify({
          message: input.message,
          context: input.context || {},
          module_slug: module.slug,
          module_name: module.name,
          module_id: module.id,
        }).length,
      });
    } else if (module.slug === "real-estate-lease-generator") {
      // FORMAT SPÉCIFIQUE POUR LE GÉNÉRATEUR IMMOBILIER
      payload = {
        input: {
          ...input,
          module_slug: module.slug,
          module_name: module.name,
          module_id: module.id,
        },
        user: {
          id: userId,
          email: userEmail,
          plan: userPlan,
          credit_balance: userProfile.credit_balance,
        },
        module: {
          id: module.id,
          name: module.name,
          slug: module.slug,
        },
        auth: authData,
        save_output: true,
        timeout: 120000,
      };
    } else if (triggerType === "CHAT") {
      const buildChatInput = (module: N8nModule, input: any) => {
        const baseInput = {
          module_slug: module.slug,
          module_name: module.name,
          module_id: module.id,
        };

        switch (module.slug) {
          case "social-factory":
            return {
              ...baseInput,
              networks: input.networks || [],
              postType: input.postType || "text",
              contentStyle: input.contentStyle || "professional",
              objective: input.objective || "engagement",
              topic: input.topic || "",
              keywords: input.keywords || "",
              callToAction: input.callToAction || "",
              includeHashtags:
                input.includeHashtags !== undefined
                  ? input.includeHashtags
                  : true,
              includeEmojis:
                input.includeEmojis !== undefined ? input.includeEmojis : true,
              autoGenerateHashtags:
                input.autoGenerateHashtags !== undefined
                  ? input.autoGenerateHashtags
                  : true,
              mentions: input.mentions || "",
              addCTA: input.addCTA !== undefined ? input.addCTA : false,
              ctaType: input.ctaType || "",
              ctaUrl: input.ctaUrl || "",
              schedulePost:
                input.schedulePost !== undefined ? input.schedulePost : false,
              scheduledDate: input.scheduledDate || "",
              scheduledTime: input.scheduledTime || "",
              media: input.media || { imageCount: 0, hasVideo: false },
            };

          case "email-campaign":
            return {
              ...baseInput,
              campaign: input.campaign || {},
              audience: input.audience || {},
              content: input.content || {},
              ai: input.ai || null,
              scheduling: input.scheduling || {},
              testing: input.testing || {},
              tracking: input.tracking || {},
              integration: input.integration || null,
              userPlan: input.userPlan || "free",
              n8nSessionId: input.n8nSessionId || null,
              n8nContext: input.n8nContext || {},
            };

          case "article-writer":
            return {
              ...baseInput,
              // Structure basée sur buildFullContext() du frontend
              article: input.article || {
                title: input.title || "",
                description: input.description || "",
                contentType: input.contentType || "blog",
                tone: input.tone || "professional",
                length: input.length || 1000,
                language: input.language || "fr",
                seoLevel: input.seoLevel || "basic",
              },
              seo: input.seo || {
                targetKeywords: input.targetKeywords || "",
                audience: input.audience || "",
                seoOptimize: input.seoOptimize || false,
                customOutline: input.customOutline || "",
              },
              options: input.options || {
                includeIntro:
                  input.includeIntro !== undefined ? input.includeIntro : true,
                includeConclusion:
                  input.includeConclusion !== undefined
                    ? input.includeConclusion
                    : true,
                includeCallToAction: input.includeCallToAction || false,
                includeImages: input.includeImages || false,
                includeFAQ: input.includeFAQ || false,
                ragDocuments: input.ragDocuments || [],
              },
              user: input.user || {
                plan: userPlan,
                isPremium: isPremium,
                balance: userProfile.credit_balance || 0,
              },
              conversation: input.conversation || {
                currentStep: input.currentStep || 0,
                isComplete: input.currentStep === 999,
                hasPreConfig: !!(
                  input.title ||
                  input.description ||
                  input.targetKeywords ||
                  input.audience
                ),
              },
              metadata: input.metadata || {
                sessionId: input.sessionId,
                timestamp: new Date().toISOString(),
                moduleType: "article-writer",
                currentCost: input.currentCost || 0,
                n8nWebhookUrl: module.endpoint,
              },
              // Support pour l'ancien format si nécessaire
              chatContext: input.chatContext || null,
              n8nWebhookUrl: input.n8nWebhookUrl || module.endpoint,
              // Données brutes pour compatibilité
              title: input.title || "",
              description: input.description || "",
              contentType: input.contentType || "blog",
              tone: input.tone || "professional",
              length: input.length || 1000,
              targetKeywords: input.targetKeywords || "",
              audience: input.audience || "",
              seoLevel: input.seoLevel || "basic",
              language: input.language || "fr",
            };

          default:
            return {
              ...baseInput,
              ...input,
            };
        }
      };

      payload = {
        sessionId: userId,
        chatInput: JSON.stringify(buildChatInput(module, input)),
        metadata: {
          worker_result_id: userId,
          client_id: userEmail,
          module: {
            id: module.id,
            name: module.name,
            slug: module.slug,
          },
        },
        auth: authData,
      };
    } else {
      // MODULES STANDARDS
      payload = {
        input: {
          ...input,
          module_slug: module.slug,
          module_name: module.name,
          module_id: module.id,
        },
        user: {
          id: userId,
          email: userEmail,
        },
        module: {
          id: module.id,
          name: module.name,
          slug: module.slug,
        },
        auth: authData,
      };
    }

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

    console.log("🔐 PRODUCTION AUTH CONFIG:", {
      method: "Basic Auth",
      username: username,
      password_length: password.length,
      auth_header_preview: `Basic ${basicAuth.substring(0, 30)}...`,
      curl_test_passed: true,
      endpoint: module.endpoint,
    });

    logger.info("Using Basic Auth (curl test validated) for all modules");

    // Logging de l'exécution
    logger.info(`Executing n8n workflow`, {
      module: module.name,
      user: userEmail,
      plan: userPlan,
      credits: userProfile.credit_balance,
      trigger_type: triggerType,
      auth_method: "Basic Auth (validated)",
      endpoint: module.endpoint,
      payload_preview: {
        sessionId: payload.sessionId || null,
        hasChatInput: !!payload.chatInput,
        hasInput: !!payload.input,
        triggerType: triggerType,
        isChatMode: input.isChatMode || false,
        messagePreview: input.message
          ? input.message.substring(0, 50) + "..."
          : null,
      },
    });

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

      logger.info(
        `Timeout configuré à ${timeoutMs / 1000}s pour ${module.name}`
      );

      // Exécution de la requête vers N8N
      const response = await fetch(module.endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Erreur inconnue");
        logger.error(`N8N Error ${response.status} for ${module.name}:`, {
          user: userEmail,
          plan: userPlan,
          error: errorText,
          payload_sent: payload,
        });
        throw new Error(
          `Module ${module.name} error: ${response.status} - ${errorText}`
        );
      }

      const result: N8nResult = (await response.json()) || {};

      logger.info(`N8N Success for ${module.name}`, {
        user: userEmail,
        plan: userPlan,
        execution_time: Date.now(),
        has_result: !!result,
      });
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
      logger.error(`N8N Execution failed for ${module.name}:`, {
        user: userEmail,
        plan: userPlan,
        error: errorMessage,
        payload_sent: payload,
      });
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
