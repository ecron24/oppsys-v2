import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

const CleanupExpiredFilesUseCaseInput = z.object({
  user: UserInContextSchema,
});

export const cleanupExpiredFilesUseCase = buildUseCase()
  .input(CleanupExpiredFilesUseCaseInput)
  .handle(async (ctx, input) => {
    const { user } = input;

    // Check if user is admin
    if (user.role !== "admin") {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("Admin permissions required"),
      } as const;
    }

    // Get expired transcriptions
    const expiredTranscriptionsResult =
      await ctx.transcriptionRepo.listTranscriptions(user.id, {
        limit: 1000,
        offset: 10,
        expiresAt: new Date().toISOString(),
      });
    if (!expiredTranscriptionsResult.success)
      return expiredTranscriptionsResult;
    const expiredTranscriptions =
      expiredTranscriptionsResult.data.transcriptions;

    // Delete files from storage
    for (const transcription of expiredTranscriptions) {
      if (transcription.filePath) {
        const { error: deleteError } = await ctx.supabase.storage
          .from("transcription-files")
          .remove([transcription.filePath]);

        if (deleteError) {
          ctx.logger.error(
            "[cleanupExpiredFiles] file deletion failed",
            deleteError,
            { filePath: transcription.filePath }
          );
        } else {
          ctx.logger.debug("[cleanupExpiredFiles] file deleted", {
            filePath: transcription.filePath,
          });
        }
      }
    }

    // Delete expired transcription records
    const cleanupResult = await ctx.transcriptionRepo.deleteTranscription({
      expiresAt: new Date().toISOString(),
    });
    if (!cleanupResult.success) return cleanupResult;

    return {
      success: true,
      data: {
        message: `Cleaned up ${expiredTranscriptions?.length || 0} expired transcriptions`,
      },
    } as const;
  });
