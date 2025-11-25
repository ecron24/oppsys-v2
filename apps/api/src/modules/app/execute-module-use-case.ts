import { buildUseCase } from "src/lib/use-case-builder";
import { ModuleParamsSchema, type ModuleUsage } from "../domain/module";
import { z } from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { createNotificationUseCase } from "src/notification/app/create-notification-use-case";
import { InsufficientCreditError } from "../domain/exception";
import { toCamelCase } from "@oppsys/shared";
import { ContentTypeSchema } from "src/content/domain/content";

export const ExecuteModuleBodySchema = z.object({
  input: z.record(z.string(), z.any()),
  saveOutput: z.boolean().default(true),
  timeout: z.number().int().min(5000).max(300000).default(30000),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});
export type ExecuteModuleBody = z.infer<typeof ExecuteModuleBodySchema>;

const ExecuteModuleInputSchema = z.object({
  params: ModuleParamsSchema,
  body: ExecuteModuleBodySchema,
  user: UserInContextSchema,
  metadata: z
    .object({
      userAgent: z.string().optional(),
      ipAddress: z.string().optional(),
    })
    .optional(),
});

export const executeModuleUseCase = buildUseCase()
  .input(ExecuteModuleInputSchema)
  .handle(async (ctx, { body, params, user, metadata }) => {
    // 1. Get module
    const moduleResult = await ctx.moduleRepo.findByIdOrSlug(params.id);
    if (!moduleResult.success) return moduleResult;

    const module = moduleResult.data;

    // 2. Check credits
    const creditCheckResult = await ctx.profileRepo.checkCredits(
      user.id,
      module.creditCost
    );
    if (!creditCheckResult.success) return creditCheckResult;
    if (!creditCheckResult.data.hasEnoughCredits) {
      await createNotificationUseCase(ctx, {
        userId: user.id,
        type: "warning",
        title: "Crédits insuffisants",
        message: `Tentative d'utilisation de ${module.name} échouée. Vous avez besoin de ${module.creditCost} crédits mais n'en avez que ${creditCheckResult.data.currentBalance}.`,
        data: {
          module_id: module.id,
          module_name: module.name,
          required_credits: module.category,
          available_credits: creditCheckResult.data.currentBalance,
        },
      });

      return {
        success: false,
        error: new InsufficientCreditError({
          required: module.creditCost,
          available: creditCheckResult.data.currentBalance,
          shortfall: creditCheckResult.data.shortfall,
        }),
        kind: "INSUFFICIENT_CREDITS",
      } as const;
    }

    // 3. Deduct credits
    if (module.creditCost > 0) {
      const deductResult = await ctx.profileRepo.deductCredits(
        user.id,
        module.creditCost
      );
      if (!deductResult.success) {
        await createNotificationUseCase(ctx, {
          userId: user.id,
          type: "warning",
          title: "Échec déduction crédits",
          message: `Impossible de débiter ${module.creditCost} crédits pour ${module.name}`,
          data: { module_id: module.id, error: deductResult.error.message },
        });
        return deductResult;
      }
    }

    // 4. Create usage record
    const usageData: Omit<ModuleUsage, "id" | "usedAt"> = {
      userId: user.id,
      moduleId: module.id,
      moduleSlug: module.slug,
      creditsUsed: module.creditCost,
      input: body.input,
      status: "pending" as const,
      errorMessage: null,
      executionTime: null,
      metadata: {
        user_email: user.email,
        module_name: module.name,
        request_timestamp: new Date().toISOString(),
        timeout_ms: body.timeout,
        user_agent: metadata?.userAgent || "unknown",
        ip_address: metadata?.ipAddress || "unknown",
        credits_already_deducted: module.creditCost > 0,
      },
    };
    const createUsageResult = await ctx.moduleRepo.createUsage(usageData);
    if (!createUsageResult.success) {
      ctx.logger.error(
        "Error creating usage record AFTER credit deduction:",
        new Error("Error creating usage"),
        {
          error_message: createUsageResult.error.message,
          user_id: user.id,
          module_slug: module.slug,
          credits_already_deducted: module.creditCost,
        }
      );
      // Rollback credit deduction
      if (module.creditCost > 0) {
        await ctx.profileRepo.addCredits(user.id, module.creditCost);
        ctx.logger.warn(
          `Crédits reversés: ${module.creditCost} pour ${user.id} pour le module ${module.slug} après échec de la création de l'usage.`
        );
      }
      return createUsageResult;
    }

    if (!user.email) {
      return {
        success: false,
        error: new Error("User email is missing"),
        kind: "MODULE_INVALID",
      } as const;
    }

    const n8nModule = {
      id: module.id,
      name: module.name,
      slug: module.slug,
      endpoint: module.endpoint,
      // endpoint:
      //   "https://n8n.oppsys.io/webhook/b918023a-dd7c-47ec-b8f4-dcd076e8a466",
      // endpoint:
      //   "https://n8n.oppsys.io/webhook/bfea41bf-fb6d-40f2-8cd4-3194bea1899c/chat",
      n8n_trigger_type: "CHAT" as const,
    };

    // 5. Execute module
    const executionResult = await ctx.n8n.executeWorkflow({
      module: n8nModule,
      input: body.input,
      userId: user.id,
      userEmail: user.email,
    });

    const usageRecord = createUsageResult.data;
    // 6. Update usage record
    const startTime = Date.parse(
      usageRecord.usedAt ?? new Date().toISOString()
    );
    const executionTime = Date.now() - startTime;

    if (!executionResult.success) {
      ctx.logger.error(
        `Exécution échouée pour ${module.name}:`,
        new Error("Failed run n8n"),
        {
          error: executionResult.error.message,
          user: user.id,
          execution_time: executionTime,
        }
      );

      await createNotificationUseCase(ctx, {
        userId: user.id,
        type: "error",
        title: "Échec d'exécution du module",
        message: `${module.name} n'a pas pu être exécuté: ${executionResult.error.message}`,
        data: {
          module_id: module.id,
          error_message: executionResult.error.message,
          usage_id: createUsageResult.data.id,
          execution_time: executionTime,
        },
      });

      await ctx.moduleRepo.updateUsage(usageRecord.id, {
        status: "failed",
        errorMessage: executionResult.error.message,
        executionTime,
        output: {
          error: "Échec d'exécution du module",
          details: executionResult.error.message,
          execution_time: executionTime,
        },
        metadata: {
          ...usageData.metadata,
          execution_time_ms: executionTime,
          completed_at: new Date().toISOString(),
          success: false,
        },
      });
      // Not refunding here as per original logic, but could be considered.
      return executionResult;
    }

    await ctx.moduleRepo.updateUsage(usageRecord.id, {
      status: "success",
      output: executionResult.data,
      executionTime,
      metadata: {
        ...usageData.metadata,
        execution_time_ms: executionTime,
        completed_at: new Date().toISOString(),
        success: true,
      },
    });

    await createNotificationUseCase(ctx, {
      userId: user.id,
      type: "success",
      title: "Module exécuté avec succès",
      message: `${module.name} a été exécuté en ${Math.round(executionTime / 1000)}s. ${module.creditCost} crédits utilisés.`,
      data: {
        module_id: module.id,
        usage_id: createUsageResult.data.id,
        execution_time: executionTime,
      },
    });

    // 7. Save content
    // shouldSaveContent(executionResult.data)
    const output = executionResult.data;
    if (body.saveOutput) {
      const content = (output?.content ||
        output?.text ||
        output?.result ||
        output?.generated_content ||
        (typeof output?.data === "string"
          ? output.data
          : JSON.stringify(output?.data || output))) as string;

      const title = (output?.title ||
        output?.name ||
        output?.subject ||
        `Contenu généré par ${module.name}`) as string;

      // Détection intelligente du type
      const rawtype = (output?.type ||
        output?.content_type ||
        (module.name.toLowerCase().includes("article")
          ? "article"
          : module.name.toLowerCase().includes("social")
            ? "social-post"
            : module.name.toLowerCase().includes("video")
              ? "video"
              : module.name.toLowerCase().includes("document")
                ? "document"
                : "other")) as string;
      const type = ContentTypeSchema.safeParse(rawtype).data || "other";

      // Métadonnées enrichies
      const metadata = {
        module_name: module.name,
        module_slug: module.slug,
        created_at: new Date().toISOString(),
        output_keys: Object.keys(output || {}),
        content_length: content?.length || 0,
        word_count: content ? content.split(/\s+/).length : 0,
        has_url: !!(output?.url || output?.link),
        generation_source: "api",
        content: content,
        ...output?.metadata,
        original_output: output,
      };
      const url = (output?.url || output?.link) as string | undefined;
      if (content) {
        await ctx.contentRepo.create({
          userId: user.id,
          contentData: {
            moduleId: module.id,
            moduleSlug: module.slug,
            title: title?.substring(0, 200),
            type,
            status: "draft",
            metadata,
            url,
          },
        });
      }
    }

    const updatedUserResult = await ctx.profileRepo.getByIdWithPlan(user.id);
    if (!updatedUserResult.success) return updatedUserResult;
    const responseData = toCamelCase({
      usage_id: createUsageResult.data.id,
      output: output,
      credits_used: module.creditCost,
      remaining_credits:
        updatedUserResult.data?.creditBalance ||
        creditCheckResult.data.currentBalance - module.creditCost,
      module_name: module.name,
      module_slug: module.slug,
      execution_time_ms: executionTime,
      total_time_ms: executionTime,
    });

    return { success: true, data: responseData } as const;
  });
