import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const SignUpSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100).optional(),
});

export const signUpUseCase = buildUseCase()
  .input(SignUpSchema)
  .handle(async (ctx, { email, password, fullName }) => {
    const result = await ctx.authRepo.signUp(email, password, fullName);
    return result;
  });
