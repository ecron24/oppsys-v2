import type {
  DashboardRepo,
  GetCreditsResult,
  GetDashboardContentStatsResult,
} from "../domain/dashboard-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type { Logger } from "src/logger/domain/logger";
import { tryCatch } from "src/lib/try-catch";
import type { ContentStats, Credit } from "../domain/dashboard";
import { toCamelCase } from "src/lib/to-camel-case";

export class DashboardRepoSupabase implements DashboardRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {
    void this.logger;
  }

  getCredits(params: {
    userId: string;
    createdAt: string;
  }): Promise<GetCreditsResult> {
    return tryCatch(async () => {
      const { data: creditHistory } = await this.supabase
        .from("credits")
        .select("amount, created_at, origin")
        .eq("user_id", params.userId)
        .gte("created_at", params.createdAt)
        .order("created_at", { ascending: true });
      const mapped = toCamelCase(creditHistory || []) as Credit[];

      return {
        success: true,
        data: mapped,
      };
    });
  }

  async getContentStats(
    userId: string
  ): Promise<GetDashboardContentStatsResult> {
    return await tryCatch(async () => {
      const { data: contentStats, error } = await this.supabase
        .from("content_stats")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code === "PGRST116") {
        return {
          success: true,
          data: {
            totalContent: 0,
            favoritesCount: 0,
            articlesCount: 0,
            audioCount: 0,
            videoCount: 0,
            imagesCount: 0,
            dataCount: 0,
            recentCount: 0,
            monthlyCount: 0,
            lastContentDate: null,
          },
        } as const;
      }
      if (error) throw error;
      const mapped: ContentStats = {
        totalContent: contentStats.total_content || 0,
        favoritesCount: contentStats.favorites_count || 0,
        articlesCount: contentStats.articles_count || 0,
        audioCount: contentStats.audio_count || 0,
        videoCount: contentStats.video_count || 0,
        imagesCount: contentStats.images_count || 0,
        dataCount: contentStats.data_count || 0,
        recentCount: contentStats.recent_count || 0,
        monthlyCount: contentStats.monthly_count || 0,
        lastContentDate: contentStats.last_content_date || null,
      };

      return { success: true, data: mapped } as const;
    });
  }
}
