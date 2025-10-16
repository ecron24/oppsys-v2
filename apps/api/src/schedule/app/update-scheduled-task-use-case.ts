import { buildUseCase } from "../../lib/use-case-builder";
import z from "zod";

export const UpdateTaskBodySchema = z.object({
  executionTime: z.iso.datetime(),
});

export const UpdateScheduledTaskUseCaseInput = z.object({
  userId: z.string(),
  taskId: z.string(),
  body: UpdateTaskBodySchema,
});

export const updateScheduledTaskUseCase = buildUseCase()
  .input(UpdateScheduledTaskUseCaseInput)
  .handle(async (ctx, input) => {
    const { userId, taskId } = input;
    const { executionTime } = input.body;

    // Check if task exists and belongs to user
    const taskResult = await ctx.scheduledTaskRepo.getById(taskId, userId);
    if (!taskResult.success) return taskResult;

    // Update task
    const updateResult = await ctx.scheduledTaskRepo.update(taskId, {
      executionTime,
    });
    if (!updateResult.success) return updateResult;

    return { success: true, data: updateResult.data };
  });
