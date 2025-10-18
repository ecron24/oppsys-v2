import { nullableSchema, StringNullableSchema } from "src/common/common-schema";
import z from "zod";

export const FormationSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  category: z.literal("formation"),
  isActive: z.boolean(),
  config: z.object({
    levels: z.record(
      z.string(),
      z.object({
        label: StringNullableSchema,
        formats: z.record(
          z.string(),
          z.object({
            label: StringNullableSchema,
            premium: z.unknown(),
            cost: z.number(),
            source: z.object({
              id: z.string(),
              path: StringNullableSchema,
              type: z.enum(["supabase", "vimeo", "youtube"]),
            }),
          })
        ),
      })
    ),
  }),
});

export type Formation = z.infer<typeof FormationSchema>;

export const FormationAccessSchema = z.object({
  id: z.string(),
  userId: z.string(),
  moduleId: z.string(),
  levelId: z.string(),
  formatId: z.string(),
  filePath: z.string(),
  creditsSpent: z.number(),
  accessedAt: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  modules: nullableSchema(
    z.object({
      name: z.string(),
      slug: z.string(),
    })
  ),
});

export type FormationAccess = z.infer<typeof FormationAccessSchema>;

export const CreditTransactionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  type: z.enum(["debit", "credit"]),
  description: z.string(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});

export type CreditTransaction = z.infer<typeof CreditTransactionSchema>;
