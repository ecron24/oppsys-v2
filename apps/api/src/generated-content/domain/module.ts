import {
  nullableSchema,
  StringNullableSchema,
  UuidSchema,
} from "src/common/common-schema";
import z from "zod";

export const GeneratedContentSchema = z.object({
  id: UuidSchema,
  userId: nullableSchema(UuidSchema),
  moduleId: nullableSchema(UuidSchema),
  moduleSlug: StringNullableSchema,
  title: StringNullableSchema,
  type: StringNullableSchema,
  content: StringNullableSchema,
  status: StringNullableSchema,
  url: nullableSchema(z.url()),
  metadata: nullableSchema(z.any()),
  createdAt: nullableSchema(z.iso.datetime({ offset: true })),
});
export type GeneratedContent = z.infer<typeof GeneratedContentSchema>;

export const GetGeneratedContentQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(20),
  type: z.string().optional(),
});
export type GetGeneratedContentQuery = z.infer<
  typeof GetGeneratedContentQuerySchema
>;

export const PaginatedGeneratedContentSchema = z.object({
  data: z.array(GeneratedContentSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});
export type PaginatedGeneratedContent = z.infer<
  typeof PaginatedGeneratedContentSchema
>;
