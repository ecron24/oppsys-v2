import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { paginationSchema } from "src/common/common-schema";
import z from "zod";

export const ListYouTubeUploadsQuerySchema = paginationSchema.partial().extend({
  status: z.enum(["pending", "uploading", "published", "failed"]).optional(),
  videoType: z.enum(["video", "short", "live"]).optional(),
});

const ListYoutubeUploadsInput = z.object({
  query: ListYouTubeUploadsQuerySchema,
  user: UserInContextSchema,
});

export const listYouTubeUploadsUseCase = buildUseCase()
  .input(ListYoutubeUploadsInput)
  .handle(async (ctx, input) => {
    const { user, query } = input;
    const result = await ctx.youtubeRepo.listYouTubeUploads(user.id, query);

    return result;
  });
