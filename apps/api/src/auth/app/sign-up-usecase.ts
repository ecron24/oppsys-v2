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
    const signUpResult = await ctx.authRepo.signUp(email, password, fullName);
    if (!signUpResult.success) return signUpResult;

    const freePlanResult = await ctx.planRepo.getByName("free");
    if (!freePlanResult.success) return freePlanResult;

    const freePlan = freePlanResult.data;

    const profileResult = await ctx.profileRepo.create({
      id: signUpResult.data.user.id,
      email,
      fullName: fullName || null,
      role: "client",
      planId: freePlan.id,
      creditBalance: freePlan.monthlyCredits,
      language: "fr",
      timezone: "Europe/Paris",
    });
    if (!profileResult.success) {
      // TODO: delete user
      return profileResult;
    }

    return {
      success: true,
      data: {
        user: signUpResult.data.user,
        session: signUpResult.data.session,
      },
    } as const;
  });
