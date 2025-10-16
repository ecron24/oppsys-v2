import { SocialPlatformSchema } from "../domain/social-connection";
import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const DisconnectPlatformInputSchema = z.object({
  userId: z.string(),
  platform: SocialPlatformSchema,
});

export const disconnectPlatformUseCase = buildUseCase()
  .input(DisconnectPlatformInputSchema)
  .handle(async (ctx, input) => {
    const result = await ctx.socialAuthService.disconnectPlatform(
      input.userId,
      input.platform
    );
    if (!result.success) return result;

    return {
      success: true,
      data: undefined,
    };
  });
