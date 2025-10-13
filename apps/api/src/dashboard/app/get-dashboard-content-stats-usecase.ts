import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import type { OppSysContext } from "src/get-context";
import { ContentStatsSchema } from "../domain/dashboard";

export const GetDashboardContentStatsInput = z.object({
  userId: z.string(),
});

export const getDashboardContentStatsUseCase = buildUseCase()
  .input(GetDashboardContentStatsInput)
  .output(ContentStatsSchema)
  .handle(async (ctx: OppSysContext, input) => {
    return ctx.dashboardRepo.getContentStats(input.userId);
  });
