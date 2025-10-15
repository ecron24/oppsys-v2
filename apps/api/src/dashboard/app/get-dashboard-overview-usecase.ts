import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import { toCamelCase } from "src/lib/to-camel-case";

export const GetDashboardOverviewInput = z.object({
  userId: z.string(),
  period: z.string().default("month"),
});

export const getDashboardOverviewUseCase = buildUseCase()
  .input(GetDashboardOverviewInput)
  .handle(async (ctx: OppSysContext, input) => {
    const { userId, period } = input;

    // 1. Fetch profile + plan
    const profileRes = await ctx.profileRepo.getByIdWithPlan(userId);
    if (!profileRes.success) {
      return profileRes;
    }

    const profile = profileRes.data;

    // 2. Calculate period start
    const startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // 3. Fetch period usage
    const periodUsageRes = await ctx.moduleRepo.listUsageHistory(userId, {
      startDate: startDate.toISOString(),
      page: 1,
      limit: 1000,
      sort: "used_at",
      order: "desc",
      includeOutput: false,
    });
    if (!periodUsageRes.success) {
      return periodUsageRes;
    }

    // 4. Fetch all usage
    const allUsageRes = await ctx.moduleRepo.listUsageHistory(userId, {
      limit: 1000,
      page: 1,
      order: "asc",
      sort: "used_at",
    });
    if (!allUsageRes.success) {
      return allUsageRes;
    }

    // 5. Fetch generated content
    const contentRes = await ctx.contentRepo.getAll({
      userId,
      query: { limit: 1000, page: 1 },
    });
    if (!contentRes.success) {
      return contentRes;
    }

    const usage = periodUsageRes.data.data.map(toCamelCase);
    const globalUsage = allUsageRes.data.data;
    const generatedContent = contentRes.data.data;

    const periodStats = {
      totalUsage: usage.length,
      totalCreditsUsed: usage.reduce((sum, u) => {
        const credits = u.creditsUsed ?? 0;
        return sum + Number(credits || 0);
      }, 0),
      successfulUsage: usage.filter((u) => u.status === "success").length,
      failedUsage: usage.filter((u) => u.status === "failed").length,
      usageByType: usage.reduce(
        (acc, module) => {
          module?.modules?.forEach((mod) => {
            const type = mod.type || "unknown";
            if (!acc[type]) acc[type] = { count: 0, credits: 0 };
            acc[type].count += 1;
            acc[type].credits += Number(module["creditsUsed"] ?? 0);
          });

          return acc;
        },
        {} as Record<string, { count: number; credits: number }>
      ),
    };

    const globalStats = {
      totalUsage: globalUsage.length,
      successfulUsage: globalUsage.filter((u) => u.status === "success").length,
      failedUsage: globalUsage.filter((u) => u.status === "failed").length,
      totalCreditsUsed: globalUsage.reduce(
        (sum, u) => sum + Number(u.creditsUsed),
        0
      ),
    };

    const contentStats = {
      totalGenerated: generatedContent.length,
      articles: generatedContent.filter((c) => c.type === "article").length,
      videos: generatedContent.filter((c) => c.type === "video").length,
      images: generatedContent.filter((c) => c.type === "image").length,
    };

    const planData = profile?.plans;
    const planName = planData?.name || "Free";
    const monthlyCredits = planData?.monthlyCredits || 0;

    // simple placeholder for chart generation
    const dailyUsage: Array<Record<string, unknown>> = [];

    const dataMapped = {
      profile: {
        planName: planName,
        creditBalance: profile?.creditBalance || 0,
        monthlyCredits: monthlyCredits,
        renewalDate: null,
        id: profile?.id || userId,
      },
      globalUsage: globalStats,
      periodUsage: {
        ...periodStats,
        successRate:
          periodStats.totalUsage > 0
            ? Math.round(
                (periodStats.successfulUsage / periodStats.totalUsage) * 100
              )
            : 0,
      },
      content: contentStats,
      charts: {
        dailyUsage: dailyUsage,
        creditsRemainingPercentage:
          monthlyCredits > 0
            ? Math.round(((profile?.creditBalance || 0) / monthlyCredits) * 100)
            : 0,
      },
      period,
    } as const;

    return { success: true, data: dataMapped } as const;
  });
