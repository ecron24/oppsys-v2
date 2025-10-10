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

    if (!result.success) {
      ctx.logger.error("[getProfileUseCase] failed", result.error, {
        userId: input.userId,
      });
      return {
        success: false,
        kind: "PROFILE_NOT_FOUND",
        error: new Error("Profile not found"),
      } as const;
    }

    return { success: true, data: result.data } as const;
  });
