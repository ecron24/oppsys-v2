import { z } from "zod";
import { createFn } from "./fn-builder";

const inputSchema = z.object({
  bucket: z.string().min(1),
  filePath: z.string().min(1),
  expiresIn: z.number().optional(),
});

const outputSchema = z.object({
  signedUrl: z.string(),
});

export const createSignedUrl = createFn()
  .input(inputSchema)
  .output(outputSchema)
  .handle(async (ctx, input) => {
    const { bucket, filePath, expiresIn } = input;

    const { data, error } = await ctx.supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn || 3600);

    if (error || !data) {
      return {
        success: false,
        kind: "STORAGE_ERROR",
        error: error || new Error("Failed to create signed url"),
      } as const;
    }

    return {
      success: true,
      data: { signedUrl: data.signedUrl },
    } as const;
  });
