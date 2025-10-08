import { z } from "zod";
import {
  nullableSchema,
  NumberNullableSchema,
  paginationSchema,
  StringNullableSchema,
} from "src/common/common-schema";

export const ModuleSchema = z.object({
  id: z.uuid(),
  name: nullableSchema(z.string()),
  slug: nullableSchema(z.string()),
  description: nullableSchema(z.string()),
  type: z.enum(["n8n", "ai"]),
  creditCost: z.number(),
  endpoint: z.url(),
  n8nTriggerType: nullableSchema(z.enum(["CHAT", "STANDARD"])),
  config: nullableSchema(z.any()),
  isActive: z.boolean(),
  category: nullableSchema(z.string()),
  createdAt: nullableSchema(z.iso.datetime()),
  updatedAt: nullableSchema(z.iso.datetime()),
});
export type Module = z.infer<typeof ModuleSchema>;

export const ModuleUsageSchema = z.object({
  id: z.uuid(),
  userId: nullableSchema(z.uuid()),
  moduleId: nullableSchema(z.uuid()),
  moduleSlug: nullableSchema(z.string()),
  creditsUsed: z.number(),
  input: nullableSchema(z.any()),
  output: nullableSchema(z.any()),
  status: nullableSchema(z.enum(["pending", "success", "failed"])).default(
    "pending"
  ),
  usedAt: nullableSchema(z.iso.datetime()),
  errorMessage: StringNullableSchema,
  executionTime: NumberNullableSchema,
  metadata: nullableSchema(z.record(z.string(), z.any())),
});
export type ModuleUsage = z.infer<typeof ModuleUsageSchema>;

export const GeneratedContentSchema = z.object({
  id: z.uuid(),
  userId: nullableSchema(z.uuid()),
  moduleId: nullableSchema(z.uuid()),
  moduleSlug: StringNullableSchema,
  title: StringNullableSchema,
  type: StringNullableSchema,
  content: StringNullableSchema,
  status: StringNullableSchema,
  url: nullableSchema(z.url()),
  metadata: nullableSchema(z.any()),
  createdAt: nullableSchema(z.iso.datetime()),
});
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

export const ListModulesQuerySchema = paginationSchema.extend({
  type: z.enum(["n8n", "ai"]).optional(),
  category: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  sort: z
    .enum(["name", "credit_cost", "created_at", "usage_count"])
    .default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  includeInactive: z.boolean().default(false),
});
export type ListModulesQuery = z.infer<typeof ListModulesQuerySchema>;

export const ExecuteModuleBodySchema = z.object({
  input: z.record(z.string(), z.any()),
  saveOutput: z.boolean().default(true),
  timeout: z.number().int().min(5000).max(300000).default(30000),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});
export type ExecuteModuleBody = z.infer<typeof ExecuteModuleBodySchema>;

export const ChatWithModuleBodySchema = z.object({
  sessionId: z.string(),
  message: z.string(),
  context: z.record(z.string(), z.any()).default({}),
  timestamp: z.iso.datetime().optional(),
});
export type ChatWithModuleBody = z.infer<typeof ChatWithModuleBodySchema>;

export const ModuleParamsSchema = z.object({
  id: z.string(),
});
export type ModuleParams = z.infer<typeof ModuleParamsSchema>;

export const ModuleUsageHistoryQuerySchema = paginationSchema.extend({
  moduleId: z.uuid().optional(),
  moduleSlug: z.string().optional(),
  status: z.enum(["success", "failed", "pending"]).optional(),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
  includeOutput: z.boolean().default(false),
  sort: z.enum(["used_at", "credits_used", "status"]).default("used_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
export type ModuleUsageHistoryQuery = z.infer<
  typeof ModuleUsageHistoryQuerySchema
>;

export const CreditCheckResultSchema = z.object({
  hasEnoughCredits: z.boolean(),
  currentBalance: z.number(),
  shortfall: z.number().optional(),
  planName: z.string(),
});
export type CreditCheckResult = z.infer<typeof CreditCheckResultSchema>;
