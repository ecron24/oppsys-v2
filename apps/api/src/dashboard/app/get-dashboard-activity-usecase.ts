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
    return ctx.dashboardRepo.getActivity(input.userId, input.limit);
  });
