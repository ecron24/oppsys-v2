import { z } from "zod";
import { createFn } from "./fn-builder";

const inputSchema = z.object({
  bucket: z.string().min(1),
  filePath: z.string().min(1),
});

const outputSchema = z.object({
  file: z.instanceof(Blob),
});

export const downloadFile = createFn()
  .input(inputSchema)
  .output(outputSchema)
  .handle(async (ctx, input) => {
    const { bucket, filePath } = input;

    const { data, error } = await ctx.supabase.storage
      .from(bucket)
      .download(filePath);

    if (error || !data) {
      return {
        success: false,
        kind: "STORAGE_ERROR",
        error: error || new Error("Failed to download file"),
      } as const;
    }

    return {
      success: true,
      data: { file: data },
    } as const;
  });
