import type { ContentStats, Credit } from "./dashboard";
import type { Result } from "@oppsys/utils";

export type GetCreditsResult = Result<Credit[], Error, "UNKNOWN_ERROR">;
export type GetDashboardContentStatsResult = Result<
  ContentStats,
  Error,
  "UNKNOWN_ERROR" | "CONTENT_STATS_NOT_FOUND"
>;

export interface DashboardRepo {
  getCredits(params: {
    userId: string;
    createdAt: string;
  }): Promise<GetCreditsResult>;

  getContentStats(userId: string): Promise<GetDashboardContentStatsResult>;
}
