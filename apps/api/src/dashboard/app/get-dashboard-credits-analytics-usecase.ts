import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import { CreditsAnalyticsSchema } from "../domain/dashboard";

export const GetDashboardCreditsAnalyticsInput = z.object({
  userId: z.string(),
  period: z.string().default("month"),
});

export const getDashboardCreditsAnalyticsUseCase = buildUseCase()
  .input(GetDashboardCreditsAnalyticsInput)
  .output(CreditsAnalyticsSchema)
  .handle(async (ctx: OppSysContext, input) => {
    return ctx.dashboardRepo.getCreditsAnalytics(input.userId, input.period);
  });
