import { buildUseCase } from "src/lib/use-case-builder";
import { ChatWithModuleBodySchema, ModuleParamsSchema } from "../domain/module";
import { z } from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

const ChatWithModuleInputSchema = z.object({
  params: ModuleParamsSchema,
  body: ChatWithModuleBodySchema,
  user: UserInContextSchema,
});

export const chatWithModuleUseCase = buildUseCase()
  .input(ChatWithModuleInputSchema)
  .handle(async (ctx, { body, params, user }) => {
    // Get module
    const moduleResult = await ctx.moduleRepo.findByIdOrSlug(params.id);
    if (!moduleResult.success) return moduleResult;
    if (!moduleResult.data)
      return {
        success: false,
        error: new Error("Module not found"),
        kind: "MODULE_NOT_FOUND",
      } as const;
    const module = moduleResult.data;

    if (module.creditCost > 0) {
      const creditCheckResult = await ctx.profileRepo.checkCredits(
        user.id,
        module.creditCost
      );
      if (!creditCheckResult.success) return creditCheckResult;
      if (!creditCheckResult.data.hasEnoughCredits) {
        return {
          success: false,
          error: new Error("Insufficient credits"),
          kind: "INSUFFICIENT_CREDITS",
        } as const;
      }
      // Deduct credits
      const deductResult = await ctx.profileRepo.deductCredits(
        user.id,
        module.creditCost
      );
      if (!deductResult.success) return deductResult;
    }

    const chatInput = {
      ...body,
      moduleType: params.id,
      timestamp: new Date().toISOString(),
      isChatMode: true,
    };

    // Create usage record
    const usageData = {
      userdId: user.id,
      moduleId: module.id,
      moduleSlug: module.slug,
      creditsUsed: module.creditCost,
      input: chatInput,
      status: "pending" as const,
      output: null,
      used_at: new Date().toISOString(),
      metadata: {
        type: "chat",
        user_email: user.id,
        session_id: user.email,
      },
    };

    const createUsageResult = await ctx.moduleRepo.createUsage(usageData);
    if (!createUsageResult.success) {
      // Reverser les crédits en cas d'erreur
      if (module.creditCost > 0)
        await ctx.profileRepo.addCredits(user.id, module.creditCost);
      return createUsageResult;
    }

    if (!module.name || !module.slug || !user.email) {
      return {
        success: false,
        error: new Error("Module name/slug is missing"),
        kind: "MODULE_INVALID",
      } as const;
    }
    // Execute chat workflow
    const chatModule = {
      id: module.id,
      name: module.name,
      slug: module.slug,
      endpoint: module.endpoint,
      n8nTriggerType: "CHAT" as const,
    };
    const executionResult = await ctx.n8n.executeWorkflow({
      module: chatModule,
      input: chatInput,
      userId: user.id,
      userEmail: user.email,
    });

    const usageRecord = createUsageResult.data;
    // Update usage record
    const startTime = Date.parse(
      usageRecord.usedAt ?? new Date().toISOString()
    );
    const executionTime = Date.now() - startTime;

    if (!executionResult.success) {
      await ctx.moduleRepo.updateUsage(usageRecord.id, {
        status: "failed",
        errorMessage: executionResult.error.message,
        executionTime,
      });
      return {
        success: false,
        kind: "EXECUTION_ERROR",
        error: new Error("execution error"),
      } as const;
    }

    const chatResponse = {
      message: executionResult.data?.message,
      nextStep:
        executionResult.data?.next_step ||
        executionResult.data?.nextStep ||
        null,
      options: executionResult.data?.options || [],
      type: executionResult.data?.type || "text",
      context: executionResult.data?.context || {},
      isComplete:
        executionResult.data?.is_complete ||
        executionResult.data?.isComplete ||
        false,
      data: executionResult.data?.data || null,
    };

    await ctx.moduleRepo.updateUsage(usageRecord.id, {
      status: "success",
      output: executionResult.data,
      executionTime,
    });

    return { success: true, data: chatResponse };
  });
