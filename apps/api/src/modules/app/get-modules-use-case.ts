import type { ListModulesQuery } from "../domain/module";
import type { ModuleRepo } from "../domain/module-repo";

type Ctx = {
  moduleRepo: ModuleRepo;
};

export const getModulesUseCase =
  (ctx: Ctx) =>
  async (query: ListModulesQuery = {}) => {
    const modules = await ctx.moduleRepo.getAll(query);
    return {
      success: true,
      data: modules,
    } as const;
  };
