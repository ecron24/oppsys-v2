import { buildUseCase } from "src/lib/use-case-builder";
import { CreateUploadUrlInputSchema } from "../domain/transcription-schema";
import { createTranscriptionUploadUrl } from "@oppsys/supabase";

export const CreateUploadUrlUseCaseInput = CreateUploadUrlInputSchema;

export const createUploadUrlUseCase = buildUseCase()
  .input(CreateUploadUrlInputSchema)
  .handle(async (ctx, input) => {
    const { fileName, fileType } = input;

    const result = await createTranscriptionUploadUrl(
      { supabase: ctx.supabase },
      { file_name: fileName, file_type: fileType }
    );

    if (!result.success) {
      ctx.logger.error("[createUploadUrl] failed", result.error, {
        fileName,
        fileType,
      });

      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("Failed to create upload URL"),
      } as const;
    }

    return {
      success: true,
      data: {
        uploadUrl: result.data.signed_url,
        filePath: result.data.file_path,
      },
    } as const;
  });
