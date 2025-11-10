import type {
  PlanRepo,
  GetPlanByNameResult,
  GetPlanHistoryResult,
  GetAllResult,
} from "src/plan/domain/plan-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import { PlanHistorySchema, PlanSchema, type Plan } from "src/plan/domain/plan";
import { toCamelCase } from "src/lib/to-camel-case";
import z from "zod";
import type { Logger } from "src/logger/domain/logger";

export class PlanRepoSupabase implements PlanRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async getAll(): Promise<GetAllResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase.from("plans").select("*");

      if (error) {
        this.logger.error("[getByName] :", error);
        throw error;
      }

      const plans: Plan[] = data.map((item) =>
        toCamelCase({
          id: item.id,
          name: item.name,
          monthlyCredits: item.monthly_credits,
          priceCents: item.price_cents,
          initialCredits: item.initial_credits,
          isActive: item.is_active,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          features: item.features as string[],
          stripePriceId: item.stripe_price_id,
          stripeProductId: item.stripe_product_id,
        })
      );
      return { success: true, data: PlanSchema.array().parse(plans) } as const;
    });
  }

  async getByName(name: string): Promise<GetPlanByNameResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("plans")
        .select("*")
        .eq("name", name)
        .maybeSingle();

      if (error) {
        this.logger.error("[getByName] :", error);
        throw error;
      }

      if (!data) {
        return {
          success: false,
          error: new Error("Plan not found : name=" + name),
          kind: "PLAN_NOT_FOUND",
        } as const;
      }

      const plan: Plan = toCamelCase({
        id: data.id,
        name: data.name,
        monthlyCredits: data.monthly_credits,
        priceCents: data.price_cents,
        initialCredits: data.initial_credits,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        features: data.features as string[],
        stripePriceId: data.stripe_price_id,
        stripeProductId: data.stripe_product_id,
      });
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
