import { z } from "zod";
import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const GetContentStatsUseCaseQuery = z.object({
  period: z.enum(["week", "month", "year"]).default("month"),
});

export const GetContentStatsUseCaseInput = z.object({
  query: GetContentStatsUseCaseQuery,
  user: UserInContextSchema,
});

export const getContentStatsUseCase = buildUseCase()
  .input(GetContentStatsUseCaseInput)
  .handle(async (ctx, input) => {
    const { query, user } = input;
    const stats = await ctx.contentRepo.getStats({ userId: user.id, ...query });

    if (!stats.success) {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("unknown error"),
      } as const;
    }

    return stats;
  });
