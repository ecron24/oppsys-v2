import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";

export const GetDashboardActivityInput = z.object({
  userId: z.string(),
  limit: z.number().min(1).max(50).default(10),
});

export const getDashboardActivityUseCase = buildUseCase()
  .input(GetDashboardActivityInput)
  .handle(async (ctx: OppSysContext, input) => {
    const { userId, limit } = input;

    // 1. Fetch recent usage
    const usageRes = await ctx.moduleRepo.listUsageHistory(userId, {
      limit,
      order: "desc",
      page: 1,
      sort: "used_at",
    });
    if (!usageRes.success) return usageRes;

    // 2. Fetch recent content
    const contentRes = await ctx.contentRepo.getAll({
      userId,
      query: { limit, page: 1 },
    });
    if (!contentRes.success) return contentRes;

    const recentUsage = usageRes.data.data;
    const recentContent = contentRes.data.data;

    const activities = [
      ...recentUsage.map((usage) => {
        return {
          id: usage.id || `usage-${Date.now()}-${Math.random()}`,
          type: "usage" as const,
          date: usage.usedAt || "",
          moduleName: "Module inconnu",
          moduleType: "unknown",
          status: usage.status || "",
          creditsUsed: usage.creditsUsed,
        };
      }),
      ...recentContent.map((content) => {
        return {
          id: content.id || `content-${Date.now()}-${Math.random()}`,
          type: "content" as const,
          date: content.createdAt,
          title: content.title,
          contentType: content.type,
          moduleName: "Module inconnu",
          moduleType: "unknown",
        };
      }),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, Number(limit));

    return { success: true, data: activities } as const;
  });
