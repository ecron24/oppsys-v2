import { buildUseCase } from "src/lib/use-case-builder";
import { GetGeneratedContentQuerySchema } from "../domain/module";
import { z } from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const GetGeneratedContentHistoryUseCaseSchema = z.object({
  query: GetGeneratedContentQuerySchema,
  user: UserInContextSchema,
});

export const getGeneratedContentHistoryUseCase = buildUseCase()
  .input(GetGeneratedContentHistoryUseCaseSchema)
  .handle(async (ctx, input) => {
    const history = await ctx.generatedContentRepo.getHistoryByUserId(
      input.user.id,
      input.query
    );
    return history;
  });
