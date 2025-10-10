import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

const GetPlanHistoryUseCaseSchema = z.object({
  userId: z.string(),
});

export const getPlanHistoryUseCase = buildUseCase()
  .input(GetPlanHistoryUseCaseSchema)
  .handle(async (ctx, input) => {
    const history = await ctx.planRepo.getHistoryByUserId(input.userId);
    return history;
  });
