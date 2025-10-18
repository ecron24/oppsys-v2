import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";

const DeleteYouTubeUploadInputSchema = z.object({
  id: z.uuid(),
  user: UserInContextSchema,
});

export const deleteYouTubeUploadUseCase = buildUseCase()
  .input(DeleteYouTubeUploadInputSchema)
  .handle(async (ctx, input) => {
    const { id, user } = input;
    const uploadResult = await ctx.youtubeRepo.getYouTubeUploadById(
      id,
      user.id
    );
    if (!uploadResult.success) return uploadResult;

    const upload = uploadResult.data;
    // Delete files from storage
    const filesToDelete: string[] = [];
    if (upload.videoFilePath) filesToDelete.push(upload.videoFilePath);
    if (upload.thumbnailFilePath) filesToDelete.push(upload.thumbnailFilePath);

    if (filesToDelete.length > 0) {
      const { error: deleteError } = await ctx.supabase.storage
        .from("youtube-videos")
        .remove(filesToDelete);

      if (deleteError) {
        ctx.logger.warn("[deleteYouTubeUpload]: Error deleting files", {
          error: deleteError,
        });
      }
    }

    const result = await ctx.youtubeRepo.deleteYouTubeUpload(id, user.id);

    return result;
  });
