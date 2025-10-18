import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";

export const GetYoutubeStatsQuery = z.object({
  period: z.number().int().min(1).default(30),
});

const GetYouTubeStatsInputSchema = z.object({
  query: GetYoutubeStatsQuery,
  user: UserInContextSchema,
});

export const getYouTubeStatsUseCase = buildUseCase()
  .input(GetYouTubeStatsInputSchema)
  .handle(async (ctx, input) => {
    const { user } = input;

    const result = await ctx.youtubeRepo.getYouTubeStats(
      user.id,
      input.query.period
    );

    return result;
  });
