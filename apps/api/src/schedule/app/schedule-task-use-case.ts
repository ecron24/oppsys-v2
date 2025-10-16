import {
  InsufficientCreditError,
  PremiumOnlyError,
} from "src/modules/domain/exception";
import { buildUseCase } from "../../lib/use-case-builder";
import z from "zod";

export const ScheduleTaskBodySchema = z.object({
  inputData: z.record(z.any(), z.unknown()),
  executionTime: z.iso
    .datetime()
    .refine((date) => new Date(date) > new Date(), {
      message: "Execution time must be in the future",
    }),
});

export const ScheduleTaskUseCaseInput = z.object({
  userId: z.string(),
  moduleSlug: z.string(),
  body: ScheduleTaskBodySchema,
});

export const scheduleTaskUseCase = buildUseCase()
  .input(ScheduleTaskUseCaseInput)
  .handle(async (ctx, input) => {
    const { userId, moduleSlug } = input;
    const { inputData, executionTime } = input.body;
    // Get module by slug
    const moduleResult = await ctx.moduleRepo.findByIdOrSlug(moduleSlug);
    if (!moduleResult.success) return moduleResult;

    const module = moduleResult.data;
    const moduleCreditCost = module.creditCost;

    // Get user profile with plan
    const profileResult = await ctx.profileRepo.getByIdWithPlan(userId);
    if (!profileResult.success) return profileResult;

    const user = profileResult.data;
    const plan = user.plans;

    // Check if plan allows scheduling
    if (!plan || plan.name.toLowerCase() === "free") {
      return {
        success: false,
        kind: "PREMIUM_FEATURE",
        error: new PremiumOnlyError("Scheduling is a premium feature"),
      };
    }

    // Check credits
    const creditBalance = user.creditBalance || 0;
    if (creditBalance < moduleCreditCost) {
      return {
        success: false,
        kind: "INSUFFICIENT_CREDITS",
        error: new InsufficientCreditError({
          required: moduleCreditCost,
          available: creditBalance,
        }),
      };
    }

    // Deduct credits
    const deductResult = await ctx.profileRepo.deductCredits(
      userId,
      moduleCreditCost
    );
    if (!deductResult.success) return deductResult;

    // Create scheduled task
    const taskResult = await ctx.scheduledTaskRepo.create({
      userId: userId,
      moduleId: module.id,
      executionTime: executionTime,
      payload: inputData,
    });

    if (!taskResult.success) {
      // Refund credits on failure
      await ctx.profileRepo.addCredits(userId, moduleCreditCost);
      return {
        success: false,
        kind: "TASK_CREATION_FAILED",
        error: new Error("Failed to create scheduled task"),
      };
    }

    return { success: true, data: taskResult.data };
  });
