import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import { ModuleStatSchema } from "../domain/dashboard";

export const GetDashboardModulesStatsInput = z.object({
  userId: z.string(),
  period: z.string().default("month"),
});

export const getDashboardModulesStatsUseCase = buildUseCase()
  .input(GetDashboardModulesStatsInput)
  .output(ModuleStatSchema.array())
  .handle(async (ctx: OppSysContext, input) => {
    return ctx.dashboardRepo.getModulesStats(input.userId, input.period);
  });
