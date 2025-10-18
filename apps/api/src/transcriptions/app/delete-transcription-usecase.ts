import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { removeFile } from "@oppsys/supabase";

const DeleteTranscriptionUseCaseInput = z.object({
  id: z.uuid(),
  user: UserInContextSchema,
});

export const deleteTranscriptionUseCase = buildUseCase()
  .input(DeleteTranscriptionUseCaseInput)
  .handle(async (ctx, input) => {
    const { id, user } = input;

    // Get the transcription to check ownership and file path
    const getResult = await ctx.transcriptionRepo.getTranscriptionById(
      id,
      user.id
    );
    if (!getResult.success) return getResult;

    const transcription = getResult.data;

    // Delete file from storage if exists
    if (transcription.filePath) {
      const deleteResult = await removeFile(ctx, {
        bucket: "transcription-files",
        files: [transcription.filePath],
      });

      if (!deleteResult.success) {
        ctx.logger.warn("[deleteTranscription] file deletion failed", {
          error: deleteResult.error,
          filePath: transcription.filePath,
        });
        // Continue with deletion
      }
    }

    // Delete the transcription record
    const deleteResult = await ctx.transcriptionRepo.deleteTranscription({
      id,
      userId: user.id,
    });
    if (!deleteResult.success) return deleteResult;

    return {
      success: true,
      data: { message: "Transcription deleted successfully" },
    } as const;
  });
