import { buildUseCase } from "../../lib/use-case-builder";
import z from "zod";

export const GetUserTasksUseCaseInput = z.object({
  userId: z.string(),
});

export const getUserTasksUseCase = buildUseCase()
  .input(GetUserTasksUseCaseInput)
  .handle(async (ctx, input) => {
    const { userId } = input;

    const tasksResult = await ctx.scheduledTaskRepo.getByUserId(userId, [
      "scheduled",
      "running",
    ]);
    if (!tasksResult.success) return tasksResult;

    return { success: true, data: tasksResult.data };
  });
