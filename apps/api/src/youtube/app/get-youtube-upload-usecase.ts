import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";

const GetYouTubeUploadInputSchema = z.object({
  id: z.uuid(),
  user: UserInContextSchema,
});

export type GetYouTubeUploadInput = z.infer<typeof GetYouTubeUploadInputSchema>;

export const getYouTubeUploadUseCase = buildUseCase()
  .input(GetYouTubeUploadInputSchema)
  .handle(async (ctx, input) => {
    const { id, user } = input;

    const result = await ctx.youtubeRepo.getYouTubeUploadById(id, user.id);

    return result;
  });
