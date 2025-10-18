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

    // TODO: make me in repo
    if (analyticsData.detailed) {
      const { error: analyticsError } = await ctx.supabase
        .from("youtube_analytics")
        .insert({
          youtube_upload_id: id,
          views_count: analyticsData.viewCount || 0,
          likes_count: analyticsData.likeCount || 0,
          comments_count: analyticsData.commentCount || 0,
          watch_time_minutes: analyticsData.watchTimeMinutes || 0,
          average_view_duration: analyticsData.averageViewDuration || 0,
          top_countries: analyticsData.topCountries || {},
          traffic_sources: analyticsData.trafficSources || {},
          period_start:
            analyticsData.periodStart || new Date().toISOString().split("T")[0],
          period_end:
            analyticsData.periodEnd || new Date().toISOString().split("T")[0],
        });
      if (analyticsError) {
        ctx.logger.warn("Error inserting detailed analytics:", {
          analyticsError,
        });
      }
    }

    return { success: true, data: "Analytics mises à jour avec succès" };
  });
