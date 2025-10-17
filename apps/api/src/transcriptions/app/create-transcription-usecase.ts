import { buildUseCase } from "src/lib/use-case-builder";
import { CreateTranscriptionInputSchema } from "../domain/transcription-schema";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { InsufficientCreditError } from "src/modules/domain/exception";
import z from "zod";
import type { Transcription } from "../domain/transcription";
import { executeTranscriptionUseCase } from "./execute-transcription-use-case";

export const CreateTranscriptionUseCaseInput = z.object({
  body: CreateTranscriptionInputSchema,
  user: UserInContextSchema,
});

export const createTranscriptionUseCase = buildUseCase()
  .input(CreateTranscriptionUseCaseInput)
  .handle(async (ctx, input) => {
    const { user } = input;
    const {
      transcriptionType,
      language,
      quality,
      outputFormat,
      speakerDiarization,
      removeFillers,
      addPunctuation,
      addTimestamps,
      generateSummary,
      customInstructions,
      publishToContent,
      filePath,
      fileName,
      fileSize,
      fileType,
    } = input.body;

    // Get the transcription module
    const moduleResult = await ctx.moduleRepo.findByIdOrSlug("transcription");
    if (!moduleResult.success) return moduleResult;
    const module = moduleResult.data;

    // Check user credits
    const userResult = await ctx.profileRepo.getByIdWithPlan(user.id);
    if (!userResult.success) return userResult;

    const userProfile = userResult.data;
    if ((userProfile.creditBalance ?? 0) < module.creditCost) {
      return {
        success: false,
        kind: "INSUFFICIENT_CREDITS",
        error: new InsufficientCreditError({
          required: module.creditCost,
          available: userProfile.creditBalance ?? 0,
        }),
      } as const;
    }

    // Create usage record
    const usageData = {
      userId: user.id,
      moduleId: module.id,
      moduleSlug: module.slug,
      creditsUsed: module.creditCost,
      input: input,
      status: "pending" as const,
    };

    const usageCreatedResult = await ctx.moduleRepo.createUsage(usageData);
    if (!usageCreatedResult.success) return usageCreatedResult;
    const usage = usageCreatedResult.data;
    // Deduct credits
    const deductCreditResult = await ctx.profileRepo.deductCredits(
      user.id,
      module.creditCost
    );
    if (!deductCreditResult.success) return deductCreditResult;

    // Create transcription record
    const transcriptionData = {
      userId: user.id,
      moduleUsageId: usage.id,
      fileName: fileName || "liveTranscript.txt",
      filePath: filePath || null,
      fileSize: fileSize || 0,
      fileType: fileType || "text/plain",
      fileUrl: null, // Will be set later if needed
      transcriptionType: transcriptionType,
      language,
      quality,
      outputFormat: outputFormat,
      speakerDiarization: speakerDiarization,
      removeFillers: removeFillers,
      addPunctuation: addPunctuation,
      addTimestamps: addTimestamps,
      generateSummary: generateSummary,
      customInstructions: customInstructions || null,
      publishToContent: publishToContent,
      status: "pending" as const,
    } as Omit<Transcription, "id" | "createdAt" | "updatedAt">;

    const transcriptionCreatedResult =
      await ctx.transcriptionRepo.createTranscription(transcriptionData);
    if (!transcriptionCreatedResult.success) return transcriptionCreatedResult;

    const transcription = transcriptionCreatedResult.data;
    // Lancer la transcription via N8N
    const executionResult = await executeTranscriptionUseCase(ctx, {
      module: module,
      transcriptionId: transcription.id,
      user,
    });
    if (!executionResult.success) return executionResult;

    // Update usage status
    await ctx.moduleRepo.updateUsage(usage.id, { status: "success" });

    return {
      success: true,
      data: {
        transcriptionId: transcription.id,
        usageId: usage.id,
        status: "processing",
        creditsUsed: module.creditCost,
        message: "Transcription created successfully",
      },
    } as const;
  });
