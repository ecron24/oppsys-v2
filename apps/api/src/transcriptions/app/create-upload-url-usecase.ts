import { buildUseCase } from "src/lib/use-case-builder";
import { CreateUploadUrlInputSchema } from "../domain/transcription-schema";

export const CreateUploadUrlUseCaseInput = CreateUploadUrlInputSchema;

export const createUploadUrlUseCase = buildUseCase()
  .input(CreateUploadUrlInputSchema)
  .handle(async (ctx, input) => {
    const { fileName, fileType } = input;

    // TODO: make me in @oppsys/supabase
    // Call the RPC function to create upload URL
    const { data, error } = await ctx.supabase.rpc(
      "create_transcription_upload_url",
      {
        file_name: fileName,
        file_type: fileType,
      }
    );

    if (error || !data) {
      ctx.logger.error(
        "[createUploadUrl] failed",
        error || new Error("No data"),
        {
          fileName,
          fileType,
        }
      );
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("Failed to create upload URL"),
      } as const;
    }
    const responseData = data as { signed_url: string; file_path: string };

    return {
      success: true,
      data: {
        uploadUrl: responseData.signed_url,
        filePath: responseData.file_path,
      },
    } as const;
  });
