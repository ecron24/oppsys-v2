import { z } from "zod";
import {
  IsoDatetime,
  nullableSchema,
  StringNullableSchema,
  UuidSchema,
} from "src/common/common-schema";

export const ContentSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  moduleId: nullableSchema(UuidSchema),
  type: z.string(),
  // TODO: check if I'm type: z.enum(["article", "video", "audio", "image", "data", "social-post"]),
  title: z.string(),
  content: StringNullableSchema,
  url: nullableSchema(z.url()),
  filePath: StringNullableSchema,
  moduleSlug: z.string(),
  moduleType: StringNullableSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  isFavorite: z.boolean().optional(),
  status: z.string().optional(),
  createdAt: IsoDatetime,
  updatedAt: nullableSchema(IsoDatetime),
});
export type Content = z.infer<typeof ContentSchema>;

export const PaginatedContentSchema = z.object({
  data: z.array(ContentSchema),
  pagination: z.object({
    page: z.number().nullable(),
    limit: z.number().nullable(),
    total: z.number(),
    pages: z.number(),
  }),
});
export type PaginatedContent = z.infer<typeof PaginatedContentSchema>;

export const SearchFiltersSchema = z.object({
  type: StringNullableSchema,
  moduleSlug: StringNullableSchema,
  isFavorite: z.boolean().optional(),
  dateFrom: nullableSchema(IsoDatetime),
  dateTo: nullableSchema(IsoDatetime),
});
export type SearchFilters = z.infer<typeof SearchFiltersSchema>;

export const ContentStatsSchema = z.object({
  total: z.number(),
  favorites: z.number(),
  byType: z.object({
    article: z.number(),
    audio: z.number(),
    video: z.number(),
    image: z.number(),
    data: z.number(),
    "social-post": z.number(),
  }),
  byModule: z.record(z.string(), z.number()),
  period: z.enum(["week", "month", "year"]),
});
export type ContentStats = z.infer<typeof ContentStatsSchema>;

export const ContentApprovalSchema = z.object({
  id: z.string(),
  approverId: StringNullableSchema,
  contentId: StringNullableSchema,
  createdAt: IsoDatetime,
  feedback: StringNullableSchema,
  reviewedAt: StringNullableSchema,
  status: z.string(),
  submitterId: StringNullableSchema,
  updatedAt: IsoDatetime,
});
export type ContentApproval = z.infer<typeof ContentApprovalSchema>;
