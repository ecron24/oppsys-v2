import { honoClient } from "@/lib/hono-client";
import type { InferResponseType } from "hono";

export type DashboardOverviewData = InferResponseType<
  typeof honoClient.api.dashboard.overview.$get,
  200
>["data"];

export type PeriodUsage = DashboardOverviewData["periodUsage"];
export type DashboardContentData = DashboardOverviewData["content"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const contentStat = honoClient.api.dashboard["content-stats"].$get;
export type ContentStat = InferResponseType<typeof contentStat, 200>["data"];
