import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { removeFile } from "@oppsys/supabase";

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
        kind: "FORBIDDEN",
        error: new Error("Admin permissions required"),
      } as const;
    }

    // Get expired transcriptions
    const expiredTranscriptionsResult =
      await ctx.transcriptionRepo.listTranscriptions(user.id, {
        expiresAt: new Date().toISOString(),
      });
    if (!expiredTranscriptionsResult.success)
      return expiredTranscriptionsResult;
    const expiredTranscriptions =
      expiredTranscriptionsResult.data.transcriptions;

    // Delete files from storage
    for (const transcription of expiredTranscriptions) {
      if (transcription.filePath) {
        const deleteResult = await removeFile(ctx, {
          bucket: "transcription-files",
          files: [transcription.filePath],
        });

        if (!deleteResult.success) {
          ctx.logger.error(
            "[cleanupExpiredFiles] file deletion failed",
            deleteResult.error,
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
