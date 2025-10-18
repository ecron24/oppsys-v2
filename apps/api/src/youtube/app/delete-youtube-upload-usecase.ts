import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";
import { removeFile } from "@oppsys/supabase";

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
      const deleteResult = await removeFile(ctx, {
        bucket: "youtube-videos",
        files: filesToDelete,
      });

      if (!deleteResult.success) {
        ctx.logger.warn("[deleteYouTubeUpload]: Error deleting files", {
          error: deleteResult.error,
        });
      }
    }

    const result = await ctx.youtubeRepo.deleteYouTubeUpload(id, user.id);

    return result;
  });
