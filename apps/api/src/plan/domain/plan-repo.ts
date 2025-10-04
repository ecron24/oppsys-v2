import type { Result } from "@oppsys/types";
import type { Plan } from "./plan";

export type GetPlanByNameResult = Result<
  Plan,
  Error,
  "UNKNOWN_ERROR" | "PLAN_NOT_FOUND"
>;

export interface PlanRepo {
  getByName(name: string): Promise<GetPlanByNameResult>;
}
