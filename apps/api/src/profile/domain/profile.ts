import {
  BooleanNullableSchema,
  nullableSchema,
  NumberNullableSchema,
  StringNullableSchema,
} from "src/common/common-schema";
import { PlanSchema } from "src/plan/domain/plan";
import z from "zod";

export const ProfileSchema = z.object({
  confirmedAt: StringNullableSchema,
  createdAt: StringNullableSchema,
  creditBalance: NumberNullableSchema,
  currentPeriodEnd: StringNullableSchema,
  email: StringNullableSchema,
  emailConfirmedAt: StringNullableSchema,
  fullName: StringNullableSchema,
  id: z.string(),
  language: StringNullableSchema,
  lastCreditRefresh: StringNullableSchema,
  lastSignInAt: StringNullableSchema,
  phone: StringNullableSchema,
  phoneConfirmedAt: StringNullableSchema,
  planId: StringNullableSchema,
  renewalDate: StringNullableSchema,
  role: StringNullableSchema,
  socialSessions: nullableSchema(z.any()),
  stripeCustomerId: StringNullableSchema,
  stripeSubscriptionId: StringNullableSchema,
  stripeSubscriptionStatus: StringNullableSchema,
  timezone: StringNullableSchema,
  twofaEnabled: BooleanNullableSchema,
  updatedAt: StringNullableSchema,
});

export type Profile = z.infer<typeof ProfileSchema>;

export const ProfileWithPlanSchema = ProfileSchema.extend({
  plans: PlanSchema.pick({
    name: true,
    monthlyCredits: true,
    priceCents: true,
  })
    .optional()
    .nullable(),
});
export type ProfileWithPlan = z.infer<typeof ProfileWithPlanSchema>;
