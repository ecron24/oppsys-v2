import { buildUseCase } from "src/lib/use-case-builder";
import { ModuleUsageHistoryQuerySchema } from "../domain/module";
import { z } from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

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
