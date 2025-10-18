import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

export const GetTrendingTopicsInputSchema = z.object({
  category: z.string(),
});

export const getTrendingTopicsUseCase = buildUseCase()
  .input(GetTrendingTopicsInputSchema)
  .handle(async (ctx, input) => {
    const { category } = input;

    const result = await ctx.youtubeRepo.getTrendingTopics(category);
    if (!result.success) return result;

    return {
      success: true,
      data: {
        category,
        trendingTopics: result.data,
        generatedAt: new Date().toISOString(),
      },
    };
  });
