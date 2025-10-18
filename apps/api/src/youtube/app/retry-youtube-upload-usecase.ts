import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";

export const RetryYouTubeUploadInputSchema = z.object({
  id: z.uuid(),
  user: UserInContextSchema,
});

export const retryYouTubeUploadUseCase = buildUseCase()
  .input(RetryYouTubeUploadInputSchema)
  .handle(async (ctx, input) => {
    const { id, user } = input;
    const uploadResult = await ctx.youtubeRepo.getYouTubeUploadById(
      id,
      user.id
    );
    if (!uploadResult.success) return uploadResult;

    const upload = uploadResult.data;
    if (upload.status !== "failed") {
      return {
        success: false,
        kind: "CANNOT_RETRY",
        error: new Error("Only failed uploads can be retried"),
      } as const;
    }

    if (upload.retryCount >= 3) {
      return {
        success: false,
        kind: "CANNOT_RETRY",
        error: new Error("Maximum retry attempts reached"),
      } as const;
    }

    const updateResult = await ctx.youtubeRepo.updateYouTubeUploadById(id, {
      status: "pending",
      retryCount: (upload.retryCount || 0) + 1,
      errorMessage: null,
      updatedAt: new Date().toISOString(),
    });

    return updateResult;
  });
