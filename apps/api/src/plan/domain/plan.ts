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
  features: nullableSchema(z.any()),
  stripePriceId: StringNullableSchema,
  stripeProductId: StringNullableSchema,
});

export type Plan = z.infer<typeof PlanSchema>;
