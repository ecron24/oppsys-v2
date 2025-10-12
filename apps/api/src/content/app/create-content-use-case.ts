import { z } from "zod";
import { buildUseCase } from "src/lib/use-case-builder";
import { ContentSchema } from "../domain/content";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const CreateContentUseCaseBody = ContentSchema.omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const CreateContentUseCaseInput = z.object({
  body: CreateContentUseCaseBody,
  user: UserInContextSchema,
});

export const createContentUseCase = buildUseCase()
  .input(CreateContentUseCaseInput)
  .handle(async (ctx, input) => {
    const { body, user } = input;
    const result = await ctx.contentRepo.create({
      userId: user.id,
      contentData: body,
    });

    if (!result.success) {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("unknown error"),
      } as const;
    }

    return result;
  });
