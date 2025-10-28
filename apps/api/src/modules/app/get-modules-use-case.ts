import { paginationSchema } from "src/common/common-schema";
import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

export const ListModulesQuerySchema = paginationSchema.partial().extend({
  type: z.enum(["n8n", "ai"]).optional(),
  category: z.string().max(50).optional(),
  search: z.string().max(100).optional(),
  sort: z
    .enum(["name", "credit_cost", "created_at", "usage_count"])
    .default("name"),
  order: z.enum(["asc", "desc"]).default("asc"),
  includeInactive: z
    .enum(["true", "false"])
    .transform((val) => val === "true")
    .optional(),
});
export type ListModulesQuery = z.infer<typeof ListModulesQuerySchema>;

export const getModulesUseCase = buildUseCase()
  .input(ListModulesQuerySchema)
  .handle(async (ctx, query) => {
    const modulesResults = await ctx.moduleRepo.list(query);
    if (!modulesResults.success) return modulesResults;
    const modulesClean = modulesResults.data.data.map((module) => {
      const { ...rest } = module;
      return rest;
    });

    return {
      success: true,
      data: {
        modules: modulesClean,
        total: modulesResults.data.total,
      },
    };
  });
