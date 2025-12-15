import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { createSignedUploadUrl } from "@oppsys/supabase";
import { GenerateUploadUrlInputSchema } from "../domain/storage";

const GenerateUploadUrlUseCaseInputSchema = z.object({
  body: GenerateUploadUrlInputSchema,
  userId: z.string(),
});

export const generateUploadUrlUseCase = buildUseCase()
  .input(GenerateUploadUrlUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { fileName, bucket } = input.body;
    const { userId } = input;

    // Create unique path
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${userId}/${timestamp}_${safeName}`;

    // TODO: limit file by user quota
    const signedResult = await createSignedUploadUrl(
      { supabase: ctx.supabase },
      { bucket, filePath }
    );

    if (!signedResult.success) {
      ctx.logger.error(
        "[generateUploadUrl]: create signed upload url failed",
        signedResult.error,
        { bucket, filePath }
      );
      return {
        success: false,
        error: new Error("Failed to create upload URL"),
        kind: "UNKNOWN_ERROR",
      };
    }

    return {
      success: true,
      data: {
        uploadUrl: signedResult.data.signedUrl,
        filePath: filePath,
      },
    } as const;
  });
