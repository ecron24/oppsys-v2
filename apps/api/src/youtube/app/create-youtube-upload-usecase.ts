import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";
import {
  YouTubeUploadOptionsSchema,
  type YouTubeUpload,
} from "../domain/youtube-upload";
import { calculateUploadCost, validateYouTubeData } from "./youtube-utils";
import { InsufficientCreditError } from "src/modules/domain/exception";
import { createDownloadUrlUseCase } from "./create-download-url-use-case";
import { env } from "src/env";

export const CreateYouTubeUploadInputSchema = z.object({
  body: YouTubeUploadOptionsSchema,
  user: UserInContextSchema,
});

export type CreateYouTubeUploadInput = z.infer<
  typeof CreateYouTubeUploadInputSchema
>;

export const createYouTubeUploadUseCase = buildUseCase()
  .input(CreateYouTubeUploadInputSchema)
  .handle(async (ctx, input) => {
    const { body, user } = input;

    // Get the YouTube module
    const moduleResult =
      await ctx.moduleRepo.findByIdOrSlug("youtube-uploader");
    if (!moduleResult.success) return moduleResult;

    const module = moduleResult.data;

    // Calculate cost
    const calculatedCost = calculateUploadCost({
      videoType: body.videoType,
      fileSize: body.videoFileSize,
      generateThumbnail: body.generateAiThumbnail,
      privacy: body.privacy,
    });

    // Check credits
    const creditCheckResult = await ctx.profileRepo.checkCredits(
      user.id,
      calculatedCost
    );
    if (!creditCheckResult.success) return creditCheckResult;

    if (!creditCheckResult.data.hasEnoughCredits) {
      return {
        success: false,
        kind: "INSUFFICIENT_CREDITS",
        error: new InsufficientCreditError({
          required: calculatedCost,
          available: creditCheckResult.data.currentBalance,
        }),
      } as const;
    }

    // Validate YouTube data
    const validation = validateYouTubeData({
      title: body.title,
      description: body.description || "",
      tags: body.tags,
    });

    if (!validation.valid) {
      return {
        success: false,
        kind: "VALIDATION_ERROR",
        error: new Error(
          "Invalid YouTube data : " + validation.errors.join(", ")
        ),
      } as const;
    }

    // Create usage record
    const usageResult = await ctx.moduleRepo.createUsage({
      userId: user.id,
      moduleId: module.id,
      moduleSlug: module.slug,
      creditsUsed: calculatedCost,
      input: body,
      status: "pending",
    });
    if (!usageResult.success) return usageResult;

    // Deduct credits
    const deductResult = await ctx.profileRepo.deductCredits(
      user.id,
      calculatedCost
    );
    if (!deductResult.success) {
      // Rollback usage
      await ctx.moduleRepo.updateUsage(usageResult.data.id, {
        status: "failed",
      });
      return {
        success: false,
        kind: "CREDIT_DEDUCTION_FAILED",
        error: new Error("Failed to deduct credits"),
      } as const;
    }

    // Prepare file data
    const videoFile = {
      name: body.videoFileName,
      size: body.videoFileSize,
      type: body.videoFileType,
      path: body.videoFilePath,
    };

    const thumbnailFile = body.thumbnailFilePath
      ? {
          name: body.thumbnailFileName!,
          size: 0, // Not critical for thumbnail
          type: body.thumbnailFileType!,
          path: body.thumbnailFilePath,
        }
      : null;

    // Create YouTube upload
    // Generate download URLs for N8N
    const videoDownloadUrlResult = await createDownloadUrlUseCase(ctx, {
      filePath: videoFile.path,
    });
    if (!videoDownloadUrlResult.success) return videoDownloadUrlResult;
    const thumbnailDownloadUrlResult = thumbnailFile
      ? await createDownloadUrlUseCase(ctx, { filePath: thumbnailFile.path })
      : null;
    if (
      thumbnailDownloadUrlResult != null &&
      !thumbnailDownloadUrlResult.success
    )
      return thumbnailDownloadUrlResult;

    const videoDownloadUrl = videoDownloadUrlResult.data.signedUrl;
    const thumbnailDownloadUrl =
      thumbnailDownloadUrlResult?.data.signedUrl || null;
    const uploadData = {
      userId: input.user.id,
      moduleUsageId: usageResult.data.id,
      moduleId: "3173bec3-0114-4dc0-83a1-ab369505bdc4", // Hardcoded for now
      // Metadata
      title: body.title,
      description: body.description || "",
      tags: body.tags,
      videoType: body.videoType,
      privacy: body.privacy,
      category: body.category,
      // Video file
      videoFileName: videoFile.name,
      videoFileSize: videoFile.size,
      videoFileType: videoFile.type,
      videoFilePath: videoFile.path,
      videoFileUrl: videoDownloadUrl,
      // Thumbnail
      thumbnailFileName: thumbnailFile?.name || null,
      thumbnailFilePath: thumbnailFile?.path || null,
      thumbnailFileUrl: thumbnailDownloadUrl,
      generateAiThumbnail: body.generateAiThumbnail,
      // Cost
      costUsed: calculatedCost,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: "pending",
    } as Omit<YouTubeUpload, "id">;
    const uploadResult = await ctx.youtubeRepo.createYouTubeUpload(uploadData);

    if (!uploadResult.success) {
      // Rollback credits and usage
      await ctx.profileRepo.addCredits(user.id, calculatedCost);
      await ctx.moduleRepo.updateUsage(usageResult.data.id, {
        status: "failed",
      });
      return {
        success: false,
        kind: "UPLOAD_CREATION_FAILED",
        error: new Error("Failed to create YouTube upload"),
      } as const;
    }

    const upload = uploadResult.data;
    // Update status
    await ctx.youtubeRepo.updateYouTubeUploadById(upload.id, {
      status: "uploading",
    });

    // Préparer les données pour N8N
    const n8nInput = {
      uploadId: uploadResult.data.id,

      // Métadonnées vidéo
      title: upload.title,
      description: upload.description || undefined,
      tags: upload.tags,
      videoType: upload.videoType,
      privacy: upload.privacy,
      category: upload.category,

      // URLs des fichiers
      videoUrl: upload.videoFileUrl,
      videoFilename: upload.videoFileName,
      videoSize: upload.videoFileSize,
      videoTypeMime: upload.videoFileType,

      // Thumbnail
      thumbnailUrl: upload.thumbnailFileUrl,
      thumbnailFilename: upload.thumbnailFileName,
      generateAiThumbnail: upload.generateAiThumbnail,

      // Configuration YouTube
      youtubeConfig: {
        notifySubscribers: true,
        autoChapters: true,
        enableComments: true,
        enableRatings: true,
      },

      // Callback URL pour recevoir le résultat
      callbackUrl: `${env.API_BASE_URL}/api/youtube/${uploadResult.data.id}/callback`,

      // Métadonnées utilisateur
      userId: user.id,
      userEmail: user.email ?? "unknown@example.com",
    };

    // Execute upload
    const executeResult = await ctx.n8n.executeWorkflow({
      input: n8nInput,
      module,
      userId: user.id,
      userEmail: user.email ?? "unknown@example.com",
    });

    if (!executeResult.success) {
      // Rollback credits and usage
      await ctx.profileRepo.addCredits(user.id, calculatedCost);
      await ctx.moduleRepo.updateUsage(usageResult.data.id, {
        status: "failed",
      });

      return {
        success: false,
        kind: "UPLOAD_EXECUTION_FAILED",
        error: new Error("Failed to execute YouTube upload"),
      } as const;
    }

    // Update usage status
    await ctx.moduleRepo.updateUsage(usageResult.data.id, {
      status: "pending",
    });

    return {
      success: true,
      data: {
        uploadId: uploadResult.data.id,
        usageId: usageResult.data.id,
        status: "uploading",
        creditsUsed: calculatedCost,
        message: "Upload YouTube lancé avec succès",
      },
    } as const;
  });
