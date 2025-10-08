import z, { ZodType } from "zod";

export const nullableSchema = <T extends ZodType>(schema: T) =>
  schema.nullable().default(null).optional();

export const StringNullableSchema = nullableSchema(z.string());

export const NumberNullableSchema = nullableSchema(z.number());

export const BooleanNullableSchema = nullableSchema(z.boolean());

export const IsoDatetime = z.iso.datetime({ offset: true });

// TODO: try with z.uuid() but not user if all is like that
export const UuidSchema = z.string().min(1);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
