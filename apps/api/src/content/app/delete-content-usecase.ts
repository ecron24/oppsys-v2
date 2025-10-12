import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const DeleteContentInput = z.object({
  id: z.string(),
  userId: z.string(),
});

export const deleteContentUseCase = buildUseCase()
  .input(DeleteContentInput)
  .handle(async (ctx, input) => {
    const { id, userId } = input;
    const result = await ctx.contentRepo.delete({ id, userId });
    return result;
  });
