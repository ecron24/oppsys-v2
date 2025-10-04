import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const SignInSchema = z.object({
  email: z.email(),
  password: z.string(),
});

export const signInUseCase = buildUseCase()
  .input(SignInSchema)
  .handle(async (ctx, { email, password }) => {
    const signInResult = await ctx.authRepo.signIn(email, password);
    if (!signInResult.success) return signInResult;

    const profileResult = await ctx.profileRepo.getByIdWithPlan(
      signInResult.data.user.id
    );
    if (!profileResult.success) {
      return profileResult;
    }

    return {
      success: true,
      data: {
        user: signInResult.data.user,
        session: signInResult.data.session,
      },
    } as const;
  });
