import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const GetContentInput = z.object({
  id: z.string(),
  userId: z.string(),
});

export const getContentUseCase = buildUseCase()
  .input(GetContentInput)
  .handle(async (ctx, input) => {
    const { id, userId } = input;
    const result = await ctx.contentRepo.getById({ id, userId });
    return result;
  });
