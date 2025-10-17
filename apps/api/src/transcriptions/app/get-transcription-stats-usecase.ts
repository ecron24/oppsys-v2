import { buildUseCase } from "src/lib/use-case-builder";
import { TranscriptionStatsQuerySchema } from "../domain/transcription-schema";
import { UserInContextSchema } from "src/lib/get-user-in-context";

const GetTranscriptionStatsUseCaseInput = TranscriptionStatsQuerySchema.extend({
  user: UserInContextSchema,
});

export const getTranscriptionStatsUseCase = buildUseCase()
  .input(GetTranscriptionStatsUseCaseInput)
  .handle(async (ctx, input) => {
    const { period, user } = input;

    const startDate = new Date();
    switch (period) {
      case "week":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const transcriptionsResult = await ctx.transcriptionRepo.listTranscriptions(
      user.id,
      {
        createdAt: startDate.toISOString(),
      }
    );
    if (!transcriptionsResult.success) return transcriptionsResult;

    const transcriptions = transcriptionsResult.data.transcriptions;
    const stats = {
      total: transcriptions?.length || 0,
      completed:
        transcriptions?.filter((t) => t.status === "completed").length || 0,
      failed: transcriptions?.filter((t) => t.status === "failed").length || 0,
      pending:
        transcriptions?.filter((t) => t.status === "pending").length || 0,
      processing:
        transcriptions?.filter((t) => t.status === "processing").length || 0,
      byType: {} as Record<string, number>,
      byQuality: {} as Record<string, number>,
      totalFileSize:
        transcriptions?.reduce((sum, t) => sum + (t.fileSize || 0), 0) || 0,
      avgProcessingTime: 0,
      avgConfidence: 0,
    };

    transcriptions?.forEach((transcription) => {
      const type = transcription.transcriptionType;
      if (type) {
        stats.byType[type] = (stats.byType[type] || 0) + 1;
      }

      const quality = transcription.quality;
      if (quality) {
        stats.byQuality[quality] = (stats.byQuality[quality] || 0) + 1;
      }
    });

    const completedTranscriptions =
      transcriptions?.filter((t) => t.status === "completed") || [];
    if (completedTranscriptions.length > 0) {
      const withConfidence = completedTranscriptions.filter(
        (t) => t.confidenceScore
      );
      if (withConfidence.length > 0) {
        stats.avgConfidence =
          Math.round(
            (withConfidence.reduce(
              (sum, t) => sum + (t.confidenceScore ?? 0),
              0
            ) /
              withConfidence.length) *
              100
          ) / 100;
      }
    }
    return {
      success: true,
      data: stats,
    } as const;
  });
