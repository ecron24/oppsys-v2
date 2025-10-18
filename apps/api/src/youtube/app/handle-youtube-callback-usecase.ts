import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import type { YouTubeUpload } from "../domain/youtube-upload";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const HandleYouTubeCallbackBody = z.object({
  result: z.any(),
  success: z.boolean().default(true),
});

const HandleYouTubeCallbackInputSchema = z.object({
  uploadId: z.uuid(),
  body: HandleYouTubeCallbackBody,
  user: UserInContextSchema,
});

export const handleYouTubeCallbackUseCase = buildUseCase()
  .input(HandleYouTubeCallbackInputSchema)
  .handle(async (ctx, input) => {
    const { result, success } = input.body;
    const { uploadId } = input;

    const updateData: Partial<YouTubeUpload> = {
      updatedAt: new Date().toISOString(),
    };

    if (success) {
      updateData.status = "published";
      updateData.youtubeVideoId = result.videoId;
      updateData.youtubeVideoUrl = result.videoUrl;
      updateData.youtubeThumbnailUrl = result.thumbnailUrl;
      updateData.youtubeStatus = result.youtubeStatus;
      updateData.youtubePrivacyStatus = result.privacyStatus;
      updateData.youtubeEmbeddable = result.embeddable;
      updateData.publishedAt = new Date().toISOString();
      updateData.n8nExecutionId = result.executionId;
    } else {
      updateData.status = "failed";
      updateData.errorMessage = result.error || "YouTube upload error";
    }

    const uploadResult = await ctx.youtubeRepo.updateYouTubeUploadById(
      uploadId,
      updateData
    );

    if (!uploadResult.success) return uploadResult;
    const upload = uploadResult.data;
    if (success) {
      const contentData = {
        userId: upload.userId,
        moduleId: upload.moduleId,
        moduleSlug: "youtube-uploader",
        title: upload.title,
        type: "video",
        content: upload.description,
        url: upload.youtubeVideoUrl,
        filePath: upload.videoFilePath,
        metadata: {
          youtubeUploadId: upload.id,
          youtubeVideoId: upload.youtubeVideoId,
          video_type: upload.videoType,
          privacy: upload.privacy,
          category: upload.category,
          tags: upload.tags,
          fileSize: upload.videoFileSize,
          thumbnailUrl: upload.youtubeThumbnailUrl,
          youtubeStatus: upload.youtubeStatus,
          viewCount: upload.viewCount,
          likeCount: upload.likeCount,
          commentCount: upload.commentCount,
          publishedAt: upload.publishedAt,
        },
        status: "completed",
        isFavorite: false,
      };
      await ctx.contentRepo.create({ userId: input.user.id, contentData });
    }

    // Update module usage
    if (uploadResult.data.moduleUsageId) {
      const finalStatus = success ? "success" : "failed";
      await ctx.moduleRepo.updateUsage(uploadResult.data.moduleUsageId, {
        status: finalStatus,
        output: result,
      });
    }

    return uploadResult;
  });
