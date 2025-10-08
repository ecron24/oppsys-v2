import { buildUseCase } from "src/lib/use-case-builder";
import { ModuleParamsSchema } from "../domain/module";

export const getModuleByIdUseCase = buildUseCase()
  .input(ModuleParamsSchema)
  .handle(async (ctx, { id }) => {
    const module = await ctx.moduleRepo.findByIdOrSlug(id);
    return module;
  });
