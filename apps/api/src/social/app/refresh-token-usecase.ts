import { SocialPlatformSchema } from "../domain/social-connection";
import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const RefreshTokenInputSchema = z.object({
  userId: z.string(),
  platform: SocialPlatformSchema,
});

export const refreshTokenUseCase = buildUseCase()
  .input(RefreshTokenInputSchema)
  .handle(async (ctx, input) => {
    const result = await ctx.socialTokenManager.refreshToken(
      input.userId,
      input.platform
    );
    if (!result.success) return result;

    const updatedToken = result.data;
    return {
      success: true,
      data: {
        id: updatedToken.id,
        userId: updatedToken.userId,
        platform: updatedToken.platform,
        expiresAt: updatedToken.expiresAt,
        isValid: updatedToken.isValid,
        lastUsed: updatedToken.lastUsed,
      },
    };
  });
