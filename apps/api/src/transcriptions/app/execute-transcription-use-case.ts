import { UserInContextSchema } from "src/lib/get-user-in-context";
import { buildUseCase } from "src/lib/use-case-builder";
import { ModuleSchema } from "src/modules/domain/module";
import z from "zod";

export const ExecuteTranscriptionInput = z.object({
  transcriptionId: z.string(),
  module: ModuleSchema,
  user: UserInContextSchema,
});

export const executeTranscriptionUseCase = buildUseCase()
  .input(ExecuteTranscriptionInput)
  .handle(async (ctx, input) => {
    // Récupérer les détails de la transcription
    const transcriptionResult =
      await ctx.transcriptionRepo.getTranscriptionById(
        input.transcriptionId,
        input.user.id
      );
    if (!transcriptionResult.success) return transcriptionResult;
    const module = input.module;
    const moduleClean = {
      ...module,
      name: module.name,
      slug: module.slug,
    };

    // Mettre à jour le statut
    await ctx.transcriptionRepo.updateTranscription(input.transcriptionId, {
      status: "processing",
    });

    // Préparer les données pour N8N
    const transcription = transcriptionResult.data;
    const n8nInput = {
      transcriptionId: input.transcriptionId,
      fileUrl: transcription.fileUrl,
      fileName: transcription.fileName,
      fileType: transcription.fileType,
      fileSize: transcription.fileSize,

      // Paramètres de transcription
      transcriptionType: transcription.transcriptionType,
      language: transcription.language || undefined,
      quality: transcription.quality,
      outputFormat: transcription.outputFormat,

      // Options avancées
      speakerDiarization: transcription.speakerDiarization,
      removeFillers: transcription.removeFillers,
      addPunctuation: transcription.addPunctuation,
      addTimestamps: transcription.addTimestamps,
      generateSummary: transcription.generateSummary,
      customInstructions: transcription.customInstructions,

      // Callback URL pour recevoir le résultat
      callbackUrl: `${process.env.API_BASE_URL}/api/transcriptions/${input.transcriptionId}/callback`,

      // Métadonnées utilisateur
      userId: input.user.id,
      userEmail: input.user.email,
    } as const;

    const n8nResult = await ctx.n8n.executeWorkflow({
      module: moduleClean,
      userId: input.user.id,
      userEmail: input.user.email || "",
      input: n8nInput,
    });
    if (!n8nResult.success) {
      // Marquer la transcription comme échouée
      await ctx.transcriptionRepo.updateTranscription(input.transcriptionId, {
        status: "failed",
        errorMessage: n8nResult.error.message,
        completedAt: new Date().toISOString(),
      });
      return n8nResult;
    }

    // Marquer la transcription comme success
    await ctx.transcriptionRepo.updateTranscription(input.transcriptionId, {
      status: "success",
      completedAt: new Date().toISOString(),
    });
    return n8nResult;
  });
