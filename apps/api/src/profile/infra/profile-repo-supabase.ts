import type {
  ProfileRepo,
  CreateProfileResult,
  GetProfileResult,
  AddCreditsResult,
  CheckCreditsResult,
  DeductCreditsResult,
} from "src/profile/domain/profile-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import {
  ProfileWithPlanSchema,
  type Profile,
  type ProfileWithPlan,
} from "src/profile/domain/profile";
import { toCamelCase } from "src/lib/to-camel-case";

export class ProfileRepoSupabase implements ProfileRepo {
  constructor(private supabase: OppSysSupabaseClient) {}

  async create(profile: Profile): Promise<CreateProfileResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.from("profiles").insert({
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName || null,
        role: profile.role,
        plan_id: profile.planId || null,
        credit_balance: profile.creditBalance || 100,
        language: profile.language,
        timezone: profile.timezone,
      });
      if (error) {
        throw error;
      }
      return { success: true as const, data: undefined };
    });
  }

  async getByIdWithPlan(id: string): Promise<GetProfileResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("profiles")
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
        .eq("id", id)
        .single();
      if (error) throw error;
      if (!data) {
        return {
          success: false as const,
          error: new Error("Profile not found"),
          kind: "PROFILE_NOT_FOUND" as const,
        };
      }

      const profile = toCamelCase(data) as ProfileWithPlan;

      return {
        success: true as const,
        data: ProfileWithPlanSchema.parse(profile),
      };
    });
  }

  async checkCredits(
    // TODO: make me as object
    userId: string,
    requiredCredits: number
  ): Promise<CheckCreditsResult> {
    return await tryCatch(async () => {
      const profileResult = await this.getByIdWithPlan(userId);
      if (!profileResult.success) {
        return profileResult;
      }
      const profile = profileResult.data;

      const currentBalance = profile.creditBalance || 0;
      const hasEnoughCredits = currentBalance >= requiredCredits;

      return {
        success: true as const,
        data: {
          hasEnoughCredits,
          currentBalance,
          shortfall: hasEnoughCredits
            ? undefined
            : requiredCredits - currentBalance,
          planName: profile.plans?.name || "Unknown",
        },
      };
    });
  }

  async deductCredits(
    userId: string,
    amount: number
  ): Promise<DeductCreditsResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.rpc("deduct_credits", {
        user_id: userId,
        amount,
      });

      if (error) {
        // TODO: check for insufficient credits error from RPC
        throw error;
      }

      return { success: true, data: undefined } as const;
    });
  }

  async addCredits(userId: string, amount: number): Promise<AddCreditsResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.rpc("add_credits", {
        p_user_id: userId,
        p_amount: amount,
        p_origin: "api",
      });

      if (error) throw error;

      return { success: true as const, data: undefined };
    });
  }
}
