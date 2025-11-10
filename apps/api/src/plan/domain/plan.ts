import {
  BooleanNullableSchema,
  nullableSchema,
  NumberNullableSchema,
  StringNullableSchema,
} from "src/common/common-schema";
import z from "zod";

export const PlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  monthlyCredits: z.number(),
  priceCents: z.number(),
  initialCredits: NumberNullableSchema,
  isActive: BooleanNullableSchema,
  createdAt: StringNullableSchema,
  updatedAt: StringNullableSchema,
  features: nullableSchema(z.string().array()),
  stripePriceId: StringNullableSchema,
  stripeProductId: StringNullableSchema,
});

export type Plan = z.infer<typeof PlanSchema>;

export const PlanHistorySchema = z.object({
  id: z.string(),
  userId: z.string(),
  planId: z.string(),
  startDate: z.string(),
  endDate: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  plans: PlanSchema.pick({
    name: true,
    monthlyCredits: true,
    priceCents: true,
  })
    .optional()
    .nullable(),
});
export type PlanHistory = z.infer<typeof PlanHistorySchema>;
