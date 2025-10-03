import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signInUseCase = buildUseCase()
  .input(SignInSchema)
  .handle(async (ctx, { email, password }) => {
    const result = await ctx.authRepo.signIn(email, password);
    return result;
  });
