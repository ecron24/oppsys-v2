import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import z from "zod";

export const CreateVideoUploadUrlBody = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().int().positive().optional(),
});

const CreateVideoUploadUrlInputSchema = z.object({
  body: CreateVideoUploadUrlBody,
  user: UserInContextSchema,
});

export const createVideoUploadUrlUseCase = buildUseCase()
  .input(CreateVideoUploadUrlInputSchema)
  .handle(async (ctx, input) => {
    const { user } = input;
    const { fileName, fileType, fileSize } = input.body;

    const result = await ctx.youtubeRepo.createVideoUploadUrl({
      userId: user.id,
      fileName,
      fileType,
      fileSize,
    });

    return result;
  });
