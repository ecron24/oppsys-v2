import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { describeRoute, validator } from "hono-openapi";
import { getDashboardOverviewUseCase } from "../app/get-dashboard-overview-usecase";
import { getDashboardActivityUseCase } from "../app/get-dashboard-activity-usecase";
import { getDashboardModulesStatsUseCase } from "../app/get-dashboard-modules-stats-usecase";
import { getDashboardCreditsAnalyticsUseCase } from "../app/get-dashboard-credits-analytics-usecase";
import { getDashboardContentStatsUseCase } from "../app/get-dashboard-content-stats-usecase";
import { z } from "zod";
import { getUserInContext } from "src/lib/get-user-in-context";
import { PeriodSchema } from "../domain/dashboard";

const dashboardQuerySchema = z.object({
  period: PeriodSchema.default("month"),
});

const activityQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const dashboardRouter = honoRouter((ctx) => {
  const router = new Hono()
    .get(
      "/overview",
      describeRoute({ description: "Get dashboard overview" }),
      zValidatorWrapper("query", dashboardQuerySchema),
      validator("query", dashboardQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const period = c.req.valid("query").period;
        const result = await getDashboardOverviewUseCase(ctx, {
          period,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/activity",
      describeRoute({ description: "Get dashboard activity" }),
      zValidatorWrapper("query", activityQuerySchema),
      validator("query", activityQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const limit = c.req.valid("query").limit;
        const result = await getDashboardActivityUseCase(ctx, {
          limit,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/modules-stats",
      describeRoute({ description: "Get dashboard modules stats" }),
      zValidatorWrapper("query", dashboardQuerySchema),
      validator("query", dashboardQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const period = c.req.valid("query").period;
        const result = await getDashboardModulesStatsUseCase(ctx, {
          period,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/credits-analytics",
      describeRoute({ description: "Get dashboard credits analytics" }),
      zValidatorWrapper("query", dashboardQuerySchema),
      validator("query", dashboardQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const period = c.req.valid("query").period;
        const result = await getDashboardCreditsAnalyticsUseCase(ctx, {
          period,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/content-stats",
      describeRoute({ description: "Get dashboard content stats" }),
      async (c) => {
        const user = getUserInContext(c);
        const result = await getDashboardContentStatsUseCase(ctx, {
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );
  return router;
});
