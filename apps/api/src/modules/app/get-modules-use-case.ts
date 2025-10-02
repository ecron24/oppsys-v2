import { buildUseCase } from "src/lib/use-case-builder";
import { ListModulesQuerySchema } from "../domain/module";

export const getModulesUseCase = buildUseCase()
  .input(ListModulesQuerySchema)
  .handle(async (ctx, query) => {
    const modules = await ctx.moduleRepo.getAll(query);
    return {
      success: true,
      data: modules,
    } as const;
  });
