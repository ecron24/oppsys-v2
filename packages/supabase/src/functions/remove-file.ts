import { z } from "zod";
import { createFn } from "./fn-builder";
import {} from "@supabase/supabase-js";

const bucketTypeSchema = z.enum(["STANDARD", "ANALYTICS"]);

const bucketSchema = z.object({
  id: z.string(),
  type: bucketTypeSchema.optional(),
  name: z.string(),
  owner: z.string(),
  file_size_limit: z.number().optional(),
  allowed_mime_types: z.array(z.string()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  public: z.boolean(),
});

const fileObjectSchema = z.object({
  name: z.string(),
  bucket_id: z.string(),
  owner: z.string(),
  id: z.string(),
  updated_at: z.string(),
  created_at: z.string(),
  last_accessed_at: z.string(),
  metadata: z.record(z.any(), z.unknown()),
  buckets: bucketSchema,
});

const inputSchema = z.object({
  bucket: z.string().min(1),
  files: z.string().array(),
});

const outputSchema = z.object({
  data: z.array(fileObjectSchema),
});

export const removeFile = createFn()
  .input(inputSchema)
  .output(outputSchema)
  .handle(async (ctx, input) => {
    const { bucket, files } = input;

    const { data, error } = await ctx.supabase.storage
      .from(bucket)
      .remove(files);

    if (error) {
      return {
        success: false,
        kind: "STORAGE_ERROR",
        error,
      } as const;
    }

    return {
      success: true,
      data: { data },
    } as const;
  });
