import { z } from "zod";

// --- Usage Types ---
export const UsageSchema = z.object({
  id: z.string().optional(),
  creditsUsed: z.number().optional(),
  status: z.string(),
  usedAt: z.string(),
  module: z
    .object({
      name: z.string().optional(),
      type: z.string().optional(),
      slug: z.string().optional(),
      id: z.string().optional(),
      category: z.string().optional(),
      creditCost: z.number().optional(),
    })
    .optional(),
  moduleSlug: z.string().optional(),
  moduleId: z.string().optional(),
});
export type Usage = z.infer<typeof UsageSchema>;

// --- Content Types ---
export const ContentSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  type: z.string(),
  createdAt: z.string(),
  module: z
    .object({
      name: z.string().optional(),
      type: z.string().optional(),
    })
    .optional(),
});
export type Content = z.infer<typeof ContentSchema>;

// --- Credit Types ---
export const CreditSchema = z.object({
  amount: z.number(),
  createdAt: z.string(),
  origin: z.string().optional(),
});
export type Credit = z.infer<typeof CreditSchema>;

// --- Activity Output ---
export const ActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["usage", "content"]),
  date: z.string(),
  moduleName: z.string().optional(),
  moduleType: z.string().optional(),
  status: z.string().optional(),
  creditsUsed: z.number().optional(),
  title: z.string().optional(),
  contentType: z.string().optional(),
});
export type Activity = z.infer<typeof ActivitySchema>;

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
