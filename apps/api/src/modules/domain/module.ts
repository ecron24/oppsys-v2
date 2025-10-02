import z from "zod";

export const ModuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  type: z.enum(["n8n", "ai"]),
  credit_cost: z.number(),
  description: z.string().nullable(),
  is_active: z.boolean().nullable(),
  created_at: z.string(),
  config: z.record(z.string(), z.any()),
  category: z.string().nullable(),
});
export type Module = z.infer<typeof ModuleSchema>;

export const ListModuleSchema = z.array(ModuleSchema);

export const ListModulesQuerySchema = z
  .object({
    type: z.enum(["n8n", "ai"]).optional(),
    category: z.string().max(50).optional(),
    search: z.string().max(100).optional(),
    page: z.number().int().min(1).default(1).optional(),
    limit: z.number().int().min(1).max(100).default(20).optional(),
    sort: z
      .enum(["name", "credit_cost", "created_at", "usage_count"])
      .default("name")
      .optional(),
    order: z.enum(["asc", "desc"]).default("asc").optional(),
    include_inactive: z.boolean().default(false).optional(),
  })
  .optional();
export type ListModulesQuery = z.infer<typeof ListModulesQuerySchema>;
