import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const SendMagicLinkSchema = z.object({
  email: z.email(),
  redirectTo: z.url().optional(),
});

export const sendMagicLinkUseCase = buildUseCase()
  .input(SendMagicLinkSchema)
  .handle(async (ctx, { email, redirectTo }) => {
    const result = await ctx.authRepo.sendMagicLink(email, redirectTo);
    return result;
  });
