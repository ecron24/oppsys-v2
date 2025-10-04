import type { PlanRepo, GetPlanByNameResult } from "src/plan/domain/plan-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import { PlanSchema } from "src/plan/domain/plan";

export class PlanRepoSupabase implements PlanRepo {
  constructor(private supabase: OppSysSupabaseClient) {}

  async getByName(name: string): Promise<GetPlanByNameResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("plans")
        .select("*")
        .eq("name", name)
        .single();

      if (error) throw error;
      if (!data) {
        return {
          success: false,
          error: new Error("Plan not found"),
          kind: "PLAN_NOT_FOUND",
        } as const;
      }

      const plan = PlanSchema.parse(data);
      return { success: true, data: plan } as const;
    });
  }
}
