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
