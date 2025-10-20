import { z } from "zod";
import { createFn } from "./fn-builder";

const inputSchema = z.object({
  bucket: z.string().min(1),
  filePath: z.string().min(1),
  file: z.any(),
  options: z
    .object({
      contentType: z.string().optional(),
      upsert: z.boolean().optional(),
    })
    .optional(),
});

const outputSchema = z.object({
  path: z.string().optional(),
});

export const uploadFile = createFn()
  .input(inputSchema)
  .output(outputSchema)
  .handle(async (ctx, input) => {
    const { bucket, filePath, file, options } = input;
    if (
      !(
        file instanceof Buffer ||
        file instanceof ArrayBuffer ||
        file instanceof Uint8Array
      )
    ) {
      return {
        success: false,
        error: new Error("File must be Buffer or ArrayBuffer"),
        kind: "VALIDATION_ERROR",
      };
    }

    const { data, error } = await ctx.supabase.storage
      .from(bucket)
      .upload(filePath, file, options);

    if (error) {
      return {
        success: false,
        kind: "STORAGE_ERROR",
        error,
      } as const;
    }

    return {
      success: true,
      data: { path: data?.path },
    } as const;
  });
