import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import { PeriodSchema, type ModuleStat } from "../domain/dashboard";
import type { Module } from "src/modules/domain/module";
import { periodToDate } from "./dashboard-utils";

export const GetDashboardModulesStatsInput = z.object({
  userId: z.string(),
  period: PeriodSchema.default("month"),
});

export const getDashboardModulesStatsUseCase = buildUseCase()
  .input(GetDashboardModulesStatsInput)
  .handle(async (ctx: OppSysContext, input) => {
    const { period, userId } = input;
    // 1. Calculate period
    const startDate = periodToDate(period);
    // 2. Fetch module usage
    const moduleUsageResult = await ctx.moduleRepo.listUsageHistory(userId, {
      order: "desc",
      sort: "used_at",
      startDate: startDate.toISOString(),
    });
    if (!moduleUsageResult.success) return moduleUsageResult;
    // 3. Fetch modules
    const modulesResult = await ctx.moduleRepo.list({
      order: "asc",
      sort: "created_at",
    });
    if (!modulesResult.success) return modulesResult;
    // 4. Map modules
    const moduleMap = new Map<string, Module>();
    modulesResult.data.data.forEach((module) => {
      if (module.slug) moduleMap.set(module.slug, module);
      if (module.id) moduleMap.set(module.id, module);
    });
    // 5. Group stats
    const statsByModule: Record<string, ModuleStat> = {};
    moduleUsageResult.data.data.forEach((usage) => {
      let moduleData = null;
      if (usage.moduleSlug) moduleData = moduleMap.get(usage.moduleSlug);
      if (!moduleData && usage.moduleId)
        moduleData = moduleMap.get(usage.moduleId);
      if (!moduleData) return;
      const moduleKey = moduleData.slug || moduleData.id;
      if (!statsByModule[moduleKey]) {
        statsByModule[moduleKey] = {
          moduleId: moduleData.id,
          moduleSlug: moduleData.slug || "",
          moduleName: moduleData.name || "Module inconnu",
          moduleType: moduleData.type || "unknown",
          category: moduleData.category || "general",
          creditCost: moduleData.creditCost || 0,
          totalUsage: 0,
          successfulUsage: 0,
          failedUsage: 0,
          totalCreditsUsed: 0,
          lastUsed: usage.usedAt || "",
          successRate: 0,
        };
      }
      statsByModule[moduleKey].totalUsage++;
      statsByModule[moduleKey].totalCreditsUsed += usage.creditsUsed || 0;
      if (usage.status === "success")
        statsByModule[moduleKey].successfulUsage++;
      else if (usage.status === "failed")
        statsByModule[moduleKey].failedUsage++;
      if (
        new Date(usage.usedAt ?? 0) >
          new Date(statsByModule[moduleKey].lastUsed) &&
        usage.usedAt
      ) {
        statsByModule[moduleKey].lastUsed = usage.usedAt;
      }
    });
    // 6. To array and add success rate
    const moduleStatsArray: ModuleStat[] = Object.values(statsByModule)
      .map((stat) => ({
        ...stat,
        successRate:
          stat.totalUsage > 0
            ? Math.round((stat.successfulUsage / stat.totalUsage) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalUsage - a.totalUsage);

    return {
      success: true,
      data: {
        data: moduleStatsArray,
        period: period,
        metadata: {
          totalRecords: moduleUsageResult.data.data.length,
          uniqueModules: moduleStatsArray.length,
          dateRange: {
            start: startDate.toISOString(),
            end: new Date().toISOString(),
          },
        },
      },
    } as const;
  });
