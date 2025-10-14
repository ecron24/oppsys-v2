import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import { ActivitySchema } from "../domain/dashboard";

export const GetDashboardActivityInput = z.object({
  userId: z.string(),
  limit: z.number().min(1).max(50).default(10),
});

export const getDashboardActivityUseCase = buildUseCase()
  .input(GetDashboardActivityInput)
  .output(ActivitySchema.array())
  .handle(async (ctx: OppSysContext, input) => {
    const { userId, limit } = input;

    // 1. Fetch recent usage
    const usageRes = await ctx.moduleRepo.listUsageHistory(userId, {
      limit,
      order: "desc",
      page: 1,
      sort: "used_at",
    });
    if (!usageRes.success) {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("INTERNAL_ERROR"),
      } as const;
    }

    // 2. Fetch recent content
    const contentRes = await ctx.contentRepo.getAll({
      userId,
      query: { limit, page: 1 },
    });
    if (!contentRes.success) {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("INTERNAL_ERROR"),
      } as const;
    }

    const toRec = (v: unknown) => v as Record<string, unknown>;

    const recentUsage = usageRes.data.data as Record<string, unknown>[];
    const recentContent = contentRes.data.data as Record<string, unknown>[];

    const activities = [
      ...recentUsage.map((usage) => {
        const u = toRec(usage);
        return {
          id: (u["id"] as string) || `usage-${Date.now()}-${Math.random()}`,
          type: "usage" as const,
          date: (u["used_at"] as string) || "",
          moduleName:
            ((u["modules"] as Record<string, unknown> | undefined)
              ?.name as string) ||
            (u["module_slug"] as string) ||
            "Module inconnu",
          moduleType:
            ((u["modules"] as Record<string, unknown> | undefined)
              ?.type as string) || "unknown",
          status: (u["status"] as string) || "",
          creditsUsed:
            (u["credits_used"] as number) || (u["creditsUsed"] as number) || 0,
        };
      }),
      ...recentContent.map((content) => {
        const c = toRec(content);
        const modules = (c["modules"] as Array<Record<string, unknown>>) || [];
        return {
          id: (c["id"] as string) || `content-${Date.now()}-${Math.random()}`,
          type: "content" as const,
          date: (c["created_at"] as string) || "",
          title: (c["title"] as string) || "Contenu sans titre",
          contentType: (c["type"] as string) || "unknown",
          moduleName: (modules[0]?.["name"] as string) || "Module inconnu",
          moduleType: (modules[0]?.["type"] as string) || "unknown",
        };
      }),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, Number(limit));

    return { success: true, data: activities } as const;
  });
