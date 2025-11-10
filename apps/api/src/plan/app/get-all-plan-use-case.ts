import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

const GetAllPlanUseCaseSchema = z.object({
  userId: z.string(),
});

export const getAllPlanUseCase = buildUseCase()
  .input(GetAllPlanUseCaseSchema)
  .handle(async (ctx) => {
    const plans = await ctx.planRepo.getAll();
    return plans;
  });
