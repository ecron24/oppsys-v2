import type {
  DashboardOverview,
  Activity,
  ModuleStat,
  CreditsAnalytics,
  ContentStats,
} from "./dashboard";
import type { Result } from "@oppsys/types";

export type GetDashboardOverviewResult = Result<
  DashboardOverview,
  Error,
  "UNKNOWN_ERROR"
>;
export type GetDashboardActivityResult = Result<
  Activity[],
  Error,
  "UNKNOWN_ERROR"
>;
export type GetDashboardModulesStatsResult = Result<
  ModuleStat[],
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
  getOverview(
    userId: string,
    period: string
  ): Promise<GetDashboardOverviewResult>;

  getActivity(
    userId: string,
    limit: number
  ): Promise<GetDashboardActivityResult>;

  getModulesStats(
    userId: string,
    period: string
  ): Promise<GetDashboardModulesStatsResult>;

  getCreditsAnalytics(
    userId: string,
    period: string
  ): Promise<GetDashboardCreditsAnalyticsResult>;

  getContentStats(userId: string): Promise<GetDashboardContentStatsResult>;
}
