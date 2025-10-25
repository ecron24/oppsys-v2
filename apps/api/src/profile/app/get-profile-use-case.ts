import { buildUseCase } from "src/lib/use-case-builder";
import type { OppSysContext } from "src/get-context";
import z from "zod";

export const GetProfileUseCaseInput = z.object({
  userId: z.string(),
});

export const getProfileUseCase = buildUseCase()
  .input(GetProfileUseCaseInput)
  .handle(async (ctx: OppSysContext, input) => {
    const result = await ctx.profileRepo.getByIdWithPlan(input.userId);

    if (!result.success) return result;

    return { success: true, data: result.data } as const;
  });
