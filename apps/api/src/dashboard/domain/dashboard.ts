import { IsoDatetime, nullableSchema } from "src/common/common-schema";
import { z } from "zod";

// --- Credits types ---
export const CreditSchema = z.object({
  origin: z.string(),
  amount: z.number(),
  createdAt: nullableSchema(IsoDatetime),
});
export type Credit = z.infer<typeof CreditSchema>;

// --- Module Stats Output ---
export const ModuleStatSchema = z.object({
  moduleId: z.string(),
  moduleSlug: z.string(),
  moduleName: z.string(),
  moduleType: z.string(),
  category: z.string(),
  creditCost: z.number(),
  totalUsage: z.number(),
  successfulUsage: z.number(),
  failedUsage: z.number(),
  totalCreditsUsed: z.number(),
  lastUsed: z.string(),
  successRate: z.number(),
});
export type ModuleStat = z.infer<typeof ModuleStatSchema>;

// --- Credits Analytics Output ---
export const CreditsAnalyticsSchema = z.object({
  currentBalance: z.number(),
  monthlyAllowance: z.number(),
  usedInPeriod: z.number(),
  usagePercentage: z.number(),
  remainingPercentage: z.number(),
  dailyAverageUsage: z.number(),
  estimatedDaysUntilDepletion: z.number().nullable(),
  renewalDate: z.string().nullable(),
  planName: z.string(),
  chartData: z.any(), // TODO: To be refined
  period: z.string(),
});
export type CreditsAnalytics = z.infer<typeof CreditsAnalyticsSchema>;

// --- Content Stats Output ---
export const ContentStatsSchema = z.object({
  totalContent: z.number(),
  favoritesCount: z.number(),
  articlesCount: z.number(),
  audioCount: z.number(),
  videoCount: z.number(),
  imagesCount: z.number(),
  dataCount: z.number(),
  recentCount: z.number(),
  monthlyCount: z.number(),
  lastContentDate: z.string().nullable(),
});
export type ContentStats = z.infer<typeof ContentStatsSchema>;
