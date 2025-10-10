import type {
  PlanRepo,
  GetPlanByNameResult,
  GetPlanHistoryResult,
} from "src/plan/domain/plan-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import { PlanHistorySchema, PlanSchema, type Plan } from "src/plan/domain/plan";
import { toCamelCase } from "src/lib/to-camel-case";
import z from "zod";

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

  async getHistoryByUserId(userId: string): Promise<GetPlanHistoryResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("plan_history")
        .select(
          `
            *,
            plans (
              name,
              monthly_credits,
              price_cents
            )
          `
        )
        .eq("user_id", userId)
        .order("start_date", { ascending: false });

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: z.array(PlanHistorySchema).parse(data.map(toCamelCase)),
      };
    });
  }
}
