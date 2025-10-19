import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

export const UpdateVideoAnalyticsBody = z.object({
  viewCount: z.number().optional(),
  likeCount: z.number().optional(),
  commentCount: z.number().optional(),
  watchTimeMinutes: z.number().optional(),
  averageViewDuration: z.number().optional(),
  topCountries: z.record(z.string(), z.any()).optional(),
  trafficSources: z.record(z.string(), z.any()).optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  detailed: z.boolean().optional(),
});

const UpdateVideoAnalyticsInputSchema = z.object({
  id: z.uuid(),
  body: UpdateVideoAnalyticsBody,
});

export const updateVideoAnalyticsUseCase = buildUseCase()
  .input(UpdateVideoAnalyticsInputSchema)
  .handle(async (ctx, input) => {
    const { id, body: analyticsData } = input;
    const updateResult = await ctx.youtubeRepo.updateYouTubeUploadById(id, {
      viewCount: analyticsData.viewCount || 0,
      likeCount: analyticsData.likeCount || 0,
      commentCount: analyticsData.commentCount || 0,
      updatedAt: new Date().toISOString(),
    });
    if (!updateResult) return updateResult;

    if (analyticsData.detailed) {
      const insertResult = await ctx.youtubeRepo.insertYouTubeAnalytics({
        uploadId: id,
        viewCount: analyticsData.viewCount,
        likeCount: analyticsData.likeCount,
        commentCount: analyticsData.commentCount,
        watchTimeMinutes: analyticsData.watchTimeMinutes,
        averageViewDuration: analyticsData.averageViewDuration,
        topCountries: analyticsData.topCountries,
        trafficSources: analyticsData.trafficSources,
        periodStart: analyticsData.periodStart,
        periodEnd: analyticsData.periodEnd,
        detailed: analyticsData.detailed,
      });

      if (!insertResult.success) {
        ctx.logger.warn("Error inserting detailed analytics:", {
          error: insertResult?.error || "unknown",
        });
      }
    }

    return { success: true, data: "Analytics mises à jour avec succès" };
  });
