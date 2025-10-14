import type {
  DashboardRepo,
  GetDashboardContentStatsResult,
  GetDashboardCreditsAnalyticsResult,
  GetDashboardModulesStatsResult,
} from "../domain/dashboard-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type { Logger } from "src/logger/domain/logger";
import {
  generateDailyCreditChart,
  getDaysInPeriod,
} from "../app/dashboard-utils";
import { tryCatch } from "src/lib/try-catch";
import type {
  ContentStats,
  CreditsAnalytics,
  ModuleStat,
} from "../domain/dashboard";

export class DashboardRepoSupabase implements DashboardRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {
    void this.logger;
  }

  async getModulesStats(
    userId: string,
    period: string
  ): Promise<GetDashboardModulesStatsResult> {
    return await tryCatch(async () => {
      // 1. Calculate period
      const startDate = new Date();
      switch (period) {
        case "day":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      // 2. Fetch module usage
      const { data: moduleUsage } = await this.supabase
        .from("module_usage")
        .select(`id, credits_used, status, used_at, module_slug, module_id`)
        .eq("user_id", userId)
        .gte("used_at", startDate.toISOString())
        .order("used_at", { ascending: false });
      if (!moduleUsage || moduleUsage.length === 0) {
        return { success: true, data: [] };
      }
      // 3. Fetch modules
      const { data: modules } = await this.supabase
        .from("modules")
        .select(`id, slug, name, type, category, credit_cost`)
        .eq("is_active", true);
      // 4. Map modules
      const moduleMap = new Map();
      (modules || []).forEach((module) => {
        if (module.slug) moduleMap.set(module.slug, module);
        if (module.id) moduleMap.set(module.id, module);
      });
      // 5. Group stats
      const statsByModule: Record<string, ModuleStat> = {};
      moduleUsage.forEach((usage) => {
        let moduleData = null;
        if (usage.module_slug) moduleData = moduleMap.get(usage.module_slug);
        if (!moduleData && usage.module_id)
          moduleData = moduleMap.get(usage.module_id);
        if (!moduleData) return;
        const moduleKey = moduleData.slug || moduleData.id;
        if (!statsByModule[moduleKey]) {
          statsByModule[moduleKey] = {
            moduleId: moduleData.id,
            moduleSlug: moduleData.slug,
            moduleName: moduleData.name || "Module inconnu",
            moduleType: moduleData.type || "unknown",
            category: moduleData.category || "general",
            creditCost: moduleData.credit_cost || 0,
            totalUsage: 0,
            successfulUsage: 0,
            failedUsage: 0,
            totalCreditsUsed: 0,
            lastUsed: usage.used_at || "",
            successRate: 0,
          };
        }
        statsByModule[moduleKey].totalUsage++;
        statsByModule[moduleKey].totalCreditsUsed += usage.credits_used || 0;
        if (usage.status === "success")
          statsByModule[moduleKey].successfulUsage++;
        else if (usage.status === "failed")
          statsByModule[moduleKey].failedUsage++;
        if (
          new Date(usage.used_at ?? 0) >
            new Date(statsByModule[moduleKey].lastUsed) &&
          usage.used_at
        ) {
          statsByModule[moduleKey].lastUsed = usage.used_at;
        }
      });
      // 6. To array and add success rate
      const moduleStatsArray: ModuleStat[] = Object.values(statsByModule)
        .map((stat) => ({
          ...stat,
          success_rate:
            stat.totalUsage > 0
              ? Math.round((stat.successfulUsage / stat.totalUsage) * 100)
              : 0,
        }))
        .sort((a, b) => b.totalUsage - a.totalUsage);

      return { success: true, data: moduleStatsArray } as const;
    });
  }

  async getCreditsAnalytics(
    userId: string,
    period: string
  ): Promise<GetDashboardCreditsAnalyticsResult> {
    return await tryCatch(async () => {
      // 1. Fetch profile with plan
      const { data: profile, error: profileError } = await this.supabase
        .from("profiles")
        .select(`credit_balance, plans!inner(name, monthly_credits)`)
        .eq("id", userId)
        .single();
      if (profileError) throw profileError;
      // 2. Calculate period
      const startDate = new Date();
      switch (period) {
        case "day":
          startDate.setDate(startDate.getDate() - 1);
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }
      // 3. Fetch credit history
      const { data: creditHistory } = await this.supabase
        .from("credits")
        .select("amount, created_at, origin")
        .eq("user_id", userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });
      const credits = creditHistory || [];
      const totalCreditsUsed = credits
        .filter((c) => c.amount < 0)
        .reduce((sum, c) => sum + Math.abs(c.amount), 0);
      const planData = profile?.plans;
      const monthlyCredits = planData?.monthly_credits || 0;
      const creditsRemaining = profile?.credit_balance || 0;
      const daysInPeriod = getDaysInPeriod(period);
      const dailyAverageUsage = totalCreditsUsed / daysInPeriod;
      const daysUntilDepletion =
        dailyAverageUsage > 0
          ? Math.ceil(creditsRemaining / dailyAverageUsage)
          : null;
      const dailyCreditUsage = generateDailyCreditChart(
        credits
          .filter((c) => c.amount < 0)
          .map((c) => ({
            usedAt: c.created_at || "",
            creditsUsed: Math.abs(c.amount),
          })),
        period
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
        period,
      };

      return {
        success: true,
        data: data,
      };
    });
  }

  async getContentStats(
    userId: string
  ): Promise<GetDashboardContentStatsResult> {
    return await tryCatch(async () => {
      const { data: contentStats, error } = await this.supabase
        .from("content_stats")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (error && error.code === "PGRST116") {
        return {
          success: true,
          data: {
            totalContent: 0,
            favoritesCount: 0,
            articlesCount: 0,
            audioCount: 0,
            videoCount: 0,
            imagesCount: 0,
            dataCount: 0,
            recentCount: 0,
            monthlyCount: 0,
            lastContentDate: null,
          },
        } as const;
      }
      if (error) throw error;
      const mapped: ContentStats = {
        totalContent: contentStats.total_content || 0,
        favoritesCount: contentStats.favorites_count || 0,
        articlesCount: contentStats.articles_count || 0,
        audioCount: contentStats.audio_count || 0,
        videoCount: contentStats.video_count || 0,
        imagesCount: contentStats.images_count || 0,
        dataCount: contentStats.data_count || 0,
        recentCount: contentStats.recent_count || 0,
        monthlyCount: contentStats.monthly_count || 0,
        lastContentDate: contentStats.last_content_date || null,
      };

      return { success: true, data: mapped } as const;
    });
  }
}
