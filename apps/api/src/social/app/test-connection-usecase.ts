import { SocialPlatformSchema } from "../domain/social-connection";
import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const TestConnectionInputSchema = z.object({
  userId: z.string(),
  platform: SocialPlatformSchema,
});

export const testConnectionUseCase = buildUseCase()
  .input(TestConnectionInputSchema)
  .handle(async (ctx, input) => {
    const result = await ctx.socialAuthService.testConnection(
      input.userId,
      input.platform
    );

    return {
      success: true,
      data: result,
    };
  });
