import { z } from "zod";
import {
  IsoDatetime,
  nullableSchema,
  NumberNullableSchema,
  StringNullableSchema,
  UuidSchema,
} from "src/common/common-schema";
import { ConfigSchema } from "./module-config";

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: nullableSchema(z.string()),
  type: z.enum(["n8n", "ai"]),
  creditCost: z.number(),
  endpoint: z.url(),
  n8nTriggerType: nullableSchema(z.enum(["CHAT", "STANDARD"])),
  config: nullableSchema(ConfigSchema),
  isActive: z.boolean(),
  category: nullableSchema(z.string()),
  createdAt: nullableSchema(IsoDatetime),
  updatedAt: nullableSchema(IsoDatetime),
});
export type Module = z.infer<typeof ModuleSchema>;

export const ModuleUsageSchema = z.object({
  id: UuidSchema,
  userId: nullableSchema(UuidSchema),
  moduleId: nullableSchema(UuidSchema),
  moduleSlug: nullableSchema(z.string()),
  creditsUsed: z.number(),
  input: nullableSchema(z.any()),
  output: nullableSchema(z.any()),
  status: nullableSchema(z.enum(["pending", "success", "failed"])).default(
    "pending"
  ),
  usedAt: nullableSchema(IsoDatetime),
  errorMessage: StringNullableSchema,
  executionTime: NumberNullableSchema,
  metadata: nullableSchema(z.record(z.string(), z.any())),
  modules: ModuleSchema.pick({
    name: true,
    type: true,
    category: true,
    description: true,
  }).optional(),
});
export type ModuleUsage = z.infer<typeof ModuleUsageSchema>;

export const ModuleParamsSchema = z.object({
  id: z.string(),
});
export type ModuleParams = z.infer<typeof ModuleParamsSchema>;

export const CreditCheckResultSchema = z.object({
  hasEnoughCredits: z.boolean(),
  currentBalance: z.number(),
  shortfall: z.number().optional(),
  planName: z.string(),
});
export type CreditCheckResult = z.infer<typeof CreditCheckResultSchema>;
