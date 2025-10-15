import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import {
  CreditsAnalyticsSchema,
  PeriodSchema,
  type CreditsAnalytics,
} from "../domain/dashboard";
import {
  generateDailyCreditChart,
  getDaysInPeriod,
  periodToDate,
} from "./dashboard-utils";

export const GetDashboardCreditsAnalyticsInput = z.object({
  userId: z.string(),
  period: PeriodSchema.default("month"),
});

export const getDashboardCreditsAnalyticsUseCase = buildUseCase()
  .input(GetDashboardCreditsAnalyticsInput)
  .output(CreditsAnalyticsSchema)
  .handle(async (ctx: OppSysContext, input) => {
    // 1. Fetch profile with plan
    const profileResult = await ctx.profileRepo.getByIdWithPlan(input.userId);
    if (!profileResult.success) return profileResult;
    // 2. Calculate period
    const startDate = periodToDate(input.period);
    // 3. Fetch credit history
    const creditsResult = await ctx.dashboardRepo.getCredits({
      userId: input.userId,
      createdAt: startDate.toISOString(),
    });
    if (!creditsResult.success) return creditsResult;

    const credits = creditsResult.data;
    const profile = profileResult.data;
    const totalCreditsUsed = credits
      .filter((c) => c.amount < 0)
      .reduce((sum, c) => sum + Math.abs(c.amount), 0);
    const planData = profile.plans;
    const monthlyCredits = planData?.monthlyCredits || 0;
    const creditsRemaining = profile?.creditBalance || 0;
    const daysInPeriod = getDaysInPeriod(input.period);
    const dailyAverageUsage = totalCreditsUsed / daysInPeriod;
    const daysUntilDepletion =
      dailyAverageUsage > 0
        ? Math.ceil(creditsRemaining / dailyAverageUsage)
        : null;
    const dailyCreditUsage = generateDailyCreditChart(
      credits
        .filter((c) => c.amount < 0)
        .map((c) => ({
          usedAt: c.createdAt || "",
          creditsUsed: Math.abs(c.amount),
        })),
      input.period
    );
    const data: CreditsAnalytics = {
      currentBalance: creditsRemaining,
      monthlyAllowance: monthlyCredits,
      usedInPeriod: totalCreditsUsed,
      usagePercentage:
        monthlyCredits > 0
          ? Math.round((totalCreditsUsed / monthlyCredits) * 100)
          : 0,
      remainingPercentage:
        monthlyCredits > 0
          ? Math.round((creditsRemaining / monthlyCredits) * 100)
          : 0,
      dailyAverageUsage: Math.round(dailyAverageUsage * 100) / 100,
      estimatedDaysUntilDepletion: daysUntilDepletion,
      renewalDate: null,
      planName: planData?.name || "Free",
      chartData: dailyCreditUsage,
      period: input.period,
    };

    return {
      success: true,
      data: data,
    };
  });
