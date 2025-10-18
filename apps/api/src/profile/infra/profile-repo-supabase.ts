import type {
  ProfileRepo,
  CreateProfileResult,
  GetProfileResult,
  AddCreditsResult,
  CheckCreditsResult,
  DeductCreditsResult,
  UpdateProfileResult,
  DeleteProfileResult,
} from "src/profile/domain/profile-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import {
  ProfileWithPlanSchema,
  type Profile,
  type ProfileWithPlan,
  type UpdateProfile,
} from "src/profile/domain/profile";
import { toCamelCase } from "src/lib/to-camel-case";
import { toSnakeCase } from "src/lib/to-snake-case";
import type { Logger } from "src/logger/domain/logger";

export class ProfileRepoSupabase implements ProfileRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async deleteById(userId: string): Promise<DeleteProfileResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.auth.admin.deleteUser(userId);

      if (error) {
        this.logger.error("[create]: ", error, { userId });
        throw error;
      }

      return { success: true as const, data: undefined };
    });
  }

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
        this.logger.error("[create]: ", error, { profile });
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
        .maybeSingle();

      if (error) {
        this.logger.error("[getByIdWithPlan]: ", error, { id });
        throw error;
      }

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
        this.logger.error("[deductCredits]: ", error, { userId, amount });
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

      if (error) {
        this.logger.error("[addCredits]: ", error, { userId, amount });
        throw error;
      }

      return { success: true as const, data: undefined };
    });
  }

  async update(
    id: string,
    profile: UpdateProfile
  ): Promise<UpdateProfileResult> {
    return await tryCatch(async () => {
      const newProfile = toSnakeCase(profile);
      const { data, error } = await this.supabase
        .from("profiles")
        .update(newProfile)
        .eq("id", id)
        .select(
          `
             *,
           plans (
             name,
             slug,
             monthly_credits,
             price_cents
           )
         `
        )
        .maybeSingle();

      if (error) {
        this.logger.error("[update]: ", error, { profile, id });
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "PROFILE_NOT_FOUND",
          error: new Error("Profile not found : id=" + id),
        } as const;
      }

      return {
        success: true,
        data: ProfileWithPlanSchema.parse(toCamelCase(data)),
      };
    });
  }
}
