import type { PlanRepo, GetPlanByNameResult } from "src/plan/domain/plan-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import { PlanSchema, type Plan } from "src/plan/domain/plan";

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

      const plan: Plan = {
        id: data.id,
        name: data.name,
        monthlyCredits: data.monthly_credits,
        priceCents: data.price_cents,
        initialCredits: data.initial_credits,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        features: data.features,
        stripePriceId: data.stripe_price_id,
        stripeProductId: data.stripe_product_id,
      };
      return { success: true, data: PlanSchema.parse(plan) } as const;
    });
  }
}
