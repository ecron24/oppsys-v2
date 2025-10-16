import { SocialPlatformSchema } from "../domain/social-connection";
import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const CompleteAuthInputSchema = z.object({
  platform: SocialPlatformSchema,
  code: z.string(),
  state: z.string(),
  userId: z.string(),
  redirectUri: z.string().optional(),
});

export const completeAuthUseCase = buildUseCase()
  .input(CompleteAuthInputSchema)
  .handle(async (ctx, input) => {
    const result = await ctx.socialAuthService.completeAuth({
      platform: input.platform,
      code: input.code,
      state: input.state,
      redirectUri: input.redirectUri,
      userId: input.userId,
    });
    if (!result.success) return result;

    return {
      success: true,
      data: {
        platform: input.platform,
        profile: result.data.profile,
        connected: true,
      },
    };
  });
