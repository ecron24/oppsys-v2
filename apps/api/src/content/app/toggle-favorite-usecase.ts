import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import { updateContentUseCase } from "./update-content-usecase";

export const ToggleFavoriteBody = z.object({
  isFavorite: z.boolean(),
});

export const ToggleFavoriteInput = z.object({
  id: z.string(),
  userId: z.string(),
  body: ToggleFavoriteBody,
});

export const toggleFavoriteUseCase = buildUseCase()
  .input(ToggleFavoriteInput)
  .handle(async (ctx, input) => {
    const { id, userId, body } = input;
    const result = await updateContentUseCase(ctx, {
      id,
      userId,
      updateData: { isFavorite: body.isFavorite },
    });
    return result;
  });
