import { z } from "zod";
import { createFn } from "./fn-builder";

const inputSchema = z.object({
  userId: z.string().uuid(),
});

const userProfileSchema = z.object({
  id: z.uuid(),
  full_name: z.string(),
  role: z.string(),
  plan_id: z.uuid(),
  credit_balance: z.number(),
  renewal_date: z.iso.datetime({ offset: true }),
  social_sessions: z.record(z.string(), z.any()),
  language: z.string(),
  timezone: z.string(),
  stripe_customer_id: z.string().nullable(),
  twofa_enabled: z.boolean(),
  created_at: z.iso.datetime({ offset: true }),
  updated_at: z.iso.datetime({ offset: true }),
  email: z.email(),
  stripe_subscription_id: z.string().nullable(),
  stripe_subscription_status: z.string().nullable(),
  current_period_end: z.string().nullable(),
  last_credit_refresh: z.string().nullable(),
  email_confirmed_at: z.string().nullable(),
  confirmed_at: z.string().nullable(),
  last_sign_in_at: z.string().nullable(),
  phone: z.string().nullable(),
  phone_confirmed_at: z.string().nullable(),
  plan_name: z.string(),
});

export const getUserProfileForService = createFn()
  .input(inputSchema)
  .output(userProfileSchema)
  .handle(async (ctx, input) => {
    const { data: userProfile, error: profileError } = await ctx.supabase.rpc(
      "get_user_profile_for_service",
      { user_id_param: input.userId }
    );

    if (profileError || !userProfile) {
      return {
        success: false,
        kind: "USER_PROFILE_NOTFOUND",
        error: profileError || new Error("User profile not found"),
      };
    }

    return {
      success: true,
      data: userProfile as z.infer<typeof userProfileSchema>,
    };
  });
