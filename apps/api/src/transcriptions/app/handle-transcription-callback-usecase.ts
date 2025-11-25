import { buildUseCase } from "src/lib/use-case-builder";
import { TranscriptionCallbackInputSchema } from "../domain/transcription-schema";
import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const HandleTranscriptionCallbackUseCaseInput = z.object({
  transcriptionId: z.uuid(),
  body: TranscriptionCallbackInputSchema,
  user: UserInContextSchema,
});

export const handleTranscriptionCallbackUseCase = buildUseCase()
  .input(HandleTranscriptionCallbackUseCaseInput)
  .handle(async (ctx, input) => {
    const { success, result } = input.body;
    const { transcriptionId } = input;

    // Get the transcription
    const getResult =
      await ctx.transcriptionRepo.getTranscriptionById(transcriptionId);

    if (!getResult.success) return getResult;

    const transcription = getResult.data;
    const updateData: Partial<typeof transcription> = {
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (success) {
      updateData.status = "completed";
      updateData.transcriptText = result.transcript;
      updateData.summaryText = result.summary;
      updateData.speakers = result.speakers;
      updateData.segments = result.segments;
      updateData.confidenceScore = result.confidence;
      updateData.n8nExecutionId = result.executionId;
    } else {
      updateData.status = "failed";
      updateData.errorMessage = result.error || "Transcription failed";
    }

    // Update transcription
    const updateResult = await ctx.transcriptionRepo.updateTranscription(
      transcriptionId,
      updateData
    );

    if (!updateResult.success) return updateResult;

    // If success and publishToContent enabled, save to generated_content
    if (success && transcription.publishToContent) {
      const contentData = {
        userId: transcription.userId,
        moduleId: null, // To be fetched from module_usage if needed
        moduleSlug: "transcription",
        title: `Transcription - ${transcription.fileName}`,
        type: "audio" as const,
        content: result.transcript,
        url: null,
        filePath: transcription.filePath,
        metadata: {
          transcriptionId: transcription.id,
          fileName: transcription.fileName,
          fileSize: transcription.fileSize,
          transcriptionType: transcription.transcriptionType,
          language: transcription.language,
          quality: transcription.quality,
          outputFormat: transcription.outputFormat,
          speakers: result.speakers,
          confidenceScore: result.confidence,
          hasSummary: !!result.summary,
          hasTimestamps: !!result.segments,
        },
        status: "published" as const,
        isFavorite: false,
      };
      const contentResult = await ctx.contentRepo.create({
        userId: input.user.id,
        contentData: contentData,
      });
      if (!contentResult.success) return contentResult;
    }

    return {
      success: true,
      data: updateResult.data,
    } as const;
  });
