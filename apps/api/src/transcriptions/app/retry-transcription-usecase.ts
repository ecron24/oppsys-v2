import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

const RetryTranscriptionUseCaseInput = z.object({
  id: z.uuid(),
  user: UserInContextSchema,
});

export const retryTranscriptionUseCase = buildUseCase()
  .input(RetryTranscriptionUseCaseInput)
  .handle(async (ctx, input) => {
    const { id, user } = input;

    // Get the transcription
    const getResult = await ctx.transcriptionRepo.getTranscriptionById(
      id,
      user.id
    );
    if (!getResult.success) return getResult;

    const transcription = getResult.data;
    if (transcription.status !== "failed") {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("Only failed transcriptions can be retried"),
      } as const;
    }

    if (transcription.retryCount && transcription.retryCount >= 3) {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("Maximum retry attempts reached"),
      } as const;
    }

    // Update transcription for retry
    const updateResult = await ctx.transcriptionRepo.updateTranscription(id, {
      status: "pending",
      retryCount: (transcription.retryCount || 0) + 1,
      errorMessage: null,
      updatedAt: new Date().toISOString(),
    });
    if (!updateResult.success) return updateResult;

    // TODO: rerun the workflow

    return {
      success: true,
      data: { message: "Transcription retry initiated" },
    } as const;
  });
