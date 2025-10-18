import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";

export const CreateThumbnailUploadUrlBody = z.object({
  fileName: z.string(),
  fileType: z
    .string()
    .refine((val) => ["image/jpeg", "image/png"].includes(val), {
      message: "File type must be image/jpeg or image/png",
    }),
});
const CreateThumbnailUploadUrlInputSchema = z.object({
  body: CreateThumbnailUploadUrlBody,
  user: UserInContextSchema,
});

export const createThumbnailUploadUrlUseCase = buildUseCase()
  .input(CreateThumbnailUploadUrlInputSchema)
  .handle(async (ctx, input) => {
    const { user } = input;
    const { fileName, fileType } = input.body;

    const result = await ctx.youtubeRepo.createThumbnailUploadUrl({
      userId: user.id,
      fileName,
      fileType,
    });

    return result;
  });
