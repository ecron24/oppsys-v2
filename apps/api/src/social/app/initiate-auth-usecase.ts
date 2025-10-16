import {
  ScopeLevelSchema,
  SocialPlatformSchema,
} from "../domain/social-connection";
import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const InitiateAuthInputSchema = z.object({
  platform: SocialPlatformSchema,
  userId: z.string(),
  redirectUri: z.string().optional(),
  scopeLevel: ScopeLevelSchema.optional().default("basic"),
});

export const initiateAuthUseCase = buildUseCase()
  .input(InitiateAuthInputSchema)
  .handle(async (ctx, input) => {
    const result = await ctx.socialAuthService.initiateAuth({
      platform: input.platform,
      redirectUri: input.redirectUri,
      scopeLevel: input.scopeLevel,
    });
    if (!result.success) return result;

    return {
      success: true,
      data: {
        authUrl: result.data.authUrl,
        state: result.data.state,
        platform: input.platform,
      },
    };
  });
