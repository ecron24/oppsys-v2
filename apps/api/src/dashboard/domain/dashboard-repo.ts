import type { Activity, CreditsAnalytics, ContentStats } from "./dashboard";
import type { Result } from "@oppsys/types";

export type GetDashboardActivityResult = Result<
  Activity[],
  Error,
  "UNKNOWN_ERROR"
>;
export type GetDashboardCreditsAnalyticsResult = Result<
  CreditsAnalytics,
  Error,
  "UNKNOWN_ERROR"
>;
export type GetDashboardContentStatsResult = Result<
  ContentStats,
  Error,
  "UNKNOWN_ERROR"
>;

export interface DashboardRepo {
  getCreditsAnalytics(
    userId: string,
    period: string
  ): Promise<GetDashboardCreditsAnalyticsResult>;

  getContentStats(userId: string): Promise<GetDashboardContentStatsResult>;
}
