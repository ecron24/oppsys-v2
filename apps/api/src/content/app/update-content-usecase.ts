import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import { ContentSchema } from "../domain/content";

export const UpdateContentBody = ContentSchema.partial();

export const UpdateContentInput = z.object({
  id: z.string(),
  userId: z.string(),
  updateData: UpdateContentBody,
});

export const updateContentUseCase = buildUseCase()
  .input(UpdateContentInput)
  .handle(async (ctx, input) => {
    const { id, userId, updateData } = input;
    const result = await ctx.contentRepo.update({ id, userId, updateData });
    return result;
  });
