import { buildUseCase } from "src/lib/use-case-builder";

export const signOutUseCase = buildUseCase().handle(async (ctx) => {
  const result = await ctx.authRepo.signOut();
  return result;
});
