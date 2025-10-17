import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

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
      // TODO: make me in @oppsys/supabase
      const { error: deleteError } = await ctx.supabase.storage
        .from("transcription-files")
        .remove([transcription.filePath]);

      if (deleteError) {
        ctx.logger.warn("[deleteTranscription] file deletion failed", {
          error: deleteError,
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
