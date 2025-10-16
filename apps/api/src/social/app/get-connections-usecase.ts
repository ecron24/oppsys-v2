import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const GetConnectionsInputSchema = z.object({
  userId: z.string(),
});

export const getConnectionsUseCase = buildUseCase()
  .input(GetConnectionsInputSchema)
  .handle(async (ctx, input) => {
    const result = await ctx.socialTokenManager.getAllUserTokens(input.userId);
    if (!result.success) return result;

    return {
      success: true,
      data: result.data,
    };
  });
