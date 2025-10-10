import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import {
  IsoDatetime,
  paginationSchema,
  UuidSchema,
} from "src/common/common-schema";

export const ModuleUsageHistoryQuerySchema = paginationSchema.extend({
  moduleId: UuidSchema.optional(),
  moduleSlug: z.string().optional(),
  status: z.enum(["success", "failed", "pending"]).optional(),
  startDate: IsoDatetime.optional(),
  endDate: IsoDatetime.optional(),
  includeOutput: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
  sort: z.enum(["used_at", "credits_used", "status"]).default("used_at"),
  order: z.enum(["asc", "desc"]).default("desc"),
});
export type ModuleUsageHistoryQuery = z.infer<
  typeof ModuleUsageHistoryQuerySchema
>;

const GetModuleUsageHistoryInputSchema = z.object({
  query: ModuleUsageHistoryQuerySchema,
  user: UserInContextSchema,
});

export const getModuleUsageHistoryUseCase = buildUseCase()
  .input(GetModuleUsageHistoryInputSchema)
  .handle(async (ctx, { user, query }) => {
    const history = await ctx.moduleRepo.listUsageHistory(user.id, query);
    return history;
  });
