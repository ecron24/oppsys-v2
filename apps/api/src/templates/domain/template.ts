import {
  StringNullableSchema,
  NumberNullableSchema,
  BooleanNullableSchema,
  UuidSchema,
} from "src/common/common-schema";
import z from "zod";

export const RealEstateTemplateSchema = z.object({
  id: UuidSchema,
  userId: StringNullableSchema,
  name: z.string(),
  filePath: z.string(),
  fileSize: NumberNullableSchema,
  leaseType: z.string(),
  category: StringNullableSchema,
  isPublic: BooleanNullableSchema,
  createdAt: StringNullableSchema,
  updatedAt: StringNullableSchema,
});

export type RealEstateTemplate = z.infer<typeof RealEstateTemplateSchema>;

export const CreateTemplateInputSchema = z.object({
  userId: z.string(),
  name: z.string(),
  filePath: z.string(),
  fileSize: z.number(),
  leaseType: z.string(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type CreateTemplateInput = z.infer<typeof CreateTemplateInputSchema>;

export const UpdateTemplateInputSchema = z.object({
  name: z.string().optional(),
  leaseType: z.string().optional(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type UpdateTemplateInput = z.infer<typeof UpdateTemplateInputSchema>;

export const GetTemplatesQuerySchema = z.object({
  userId: z.string(),
  includePublic: z.boolean().optional(),
});

export type GetTemplatesQuery = z.infer<typeof GetTemplatesQuerySchema>;
