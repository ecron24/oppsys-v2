import type { Result } from "@oppsys/types";
import type { Plan, PlanHistory } from "./plan";

export type GetPlanHistoryResult = Result<
  PlanHistory[],
  Error,
  "UNKNOWN_ERROR"
>;

export type GetPlanByNameResult = Result<
  Plan,
  Error,
  "UNKNOWN_ERROR" | "PLAN_NOT_FOUND"
>;

export interface PlanRepo {
  getByName(name: string): Promise<GetPlanByNameResult>;
  getHistoryByUserId(userId: string): Promise<GetPlanHistoryResult>;
}
