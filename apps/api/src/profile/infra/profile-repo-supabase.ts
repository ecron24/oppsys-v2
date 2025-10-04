import type {
  ProfileRepo,
  CreateProfileResult,
  GetProfileResult,
} from "src/profile/domain/profile-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import {
  ProfileWithPlanSchema,
  type Profile,
} from "src/profile/domain/profile";

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
      return { success: true, data: undefined } as const;
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
          success: false,
          error: new Error("Profile not found"),
          kind: "PROFILE_NOT_FOUND",
        } as const;
      }
      const parsed = ProfileWithPlanSchema.parse({
        id: data.id,
        confirmedAt: data.confirmed_at ?? null,
        createdAt: data.created_at ?? null,
        creditBalance: data.credit_balance ?? null,
        currentPeriodEnd: data.current_period_end ?? null,
        email: data.email ?? null,
        emailConfirmedAt: data.email_confirmed_at ?? null,
        fullName: data.full_name ?? null,
        language: data.language ?? null,
        lastCreditRefresh: data.last_credit_refresh ?? null,
        lastSignInAt: data.last_sign_in_at ?? null,
        phone: data.phone ?? null,
        phoneConfirmedAt: data.phone_confirmed_at ?? null,
        planId: data.plan_id ?? null,
        renewalDate: data.renewal_date ?? null,
        role: data.role ?? null,
        socialSessions: data.social_sessions ?? null,
        stripeCustomerId: data.stripe_customer_id ?? null,
        stripeSubscriptionId: data.stripe_subscription_id ?? null,
        stripeSubscriptionStatus: data.stripe_subscription_status ?? null,
        timezone: data.timezone ?? null,
        twofaEnabled: data.twofa_enabled ?? null,
        updatedAt: data.updated_at ?? null,
        plans: {
          name: data.plans?.name ?? null,
          monthlyCredit: data.plans?.monthly_credits ?? null,
          priceCents: data.plans?.price_cents ?? null,
        },
      });
      return { success: true, data: parsed } as const;
    });
  }
}
