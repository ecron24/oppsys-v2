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
      const { data: creditHistory, error } = await this.supabase
        .from("credits")
        .select("amount, created_at, origin")
        .eq("user_id", params.userId)
        .gte("created_at", params.createdAt)
        .order("created_at", { ascending: true });

      if (error) {
        this.logger.error("[getCredits] :", error, { params });
        throw error;
      }

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
        .maybeSingle();

      if (error) {
        this.logger.error("[getContentStats] :", error, { userId });
        throw error;
      }

      if (!contentStats) {
        return {
          success: false,
          kind: "CONTENT_STATS_NOT_FOUND",
          error: new Error("contentStats not found : userId=" + userId),
        } as const;
      }

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
