import { buildUseCase } from "../../lib/use-case-builder";
import z from "zod";

export const DeleteScheduledTaskUseCaseInput = z.object({
  userId: z.string(),
  taskId: z.string(),
});

export const deleteScheduledTaskUseCase = buildUseCase()
  .input(DeleteScheduledTaskUseCaseInput)
  .handle(async (ctx, input) => {
    const { userId, taskId } = input;

    // Check if task exists and belongs to user
    const taskResult = await ctx.scheduledTaskRepo.getById(taskId, userId);
    if (!taskResult.success) return taskResult;

    // Delete task
    const deleteResult = await ctx.scheduledTaskRepo.delete(taskId, userId);
    if (!deleteResult.success) return deleteResult;

    return { success: true, data: { message: "Task deleted successfully" } };
  });
