import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { GenerateRagUploadUrlInputSchema } from "../domain/documents";
import { createSignedUploadUrl } from "@oppsys/supabase";

const GenerateRagUploadUrlUseCaseInputSchema =
  GenerateRagUploadUrlInputSchema.extend({
    userId: z.string(),
  });

export const generateRagUploadUrlUseCase = buildUseCase()
  .input(GenerateRagUploadUrlUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { fileName, userId } = input;

    // Create unique path
    const timestamp = Date.now();
    const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filePath = `${userId}/rag/${timestamp}_${safeName}`;

    const signedResult = await createSignedUploadUrl(
      { supabase: ctx.supabase },
      { bucket: "document-rag", filePath }
    );

    if (!signedResult.success) {
      ctx.logger.error(
        "[generateRagUploadUrl]: create signed upload url failed",
        signedResult.error,
        { filePath }
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
