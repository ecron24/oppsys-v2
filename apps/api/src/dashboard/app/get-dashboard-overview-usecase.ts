import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import { DashboardOverviewSchema } from "../domain/dashboard";

export const GetDashboardOverviewInput = z.object({
  userId: z.string(),
  period: z.string().default("month"),
});

export const getDashboardOverviewUseCase = buildUseCase()
  .input(GetDashboardOverviewInput)
  .output(DashboardOverviewSchema)
  .handle(async (ctx: OppSysContext, input) => {
    return ctx.dashboardRepo.getOverview(input.userId, input.period);
  });
