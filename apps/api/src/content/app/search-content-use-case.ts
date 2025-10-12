import { z } from "zod";
import { buildUseCase } from "src/lib/use-case-builder";
import { SearchFiltersSchema } from "../domain/content";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const SearchContentUseCaseBody = z.object({
  query: z.string(),
  filters: SearchFiltersSchema.optional().default({}),
});

export const SearchContentUseCaseInput = z.object({
  body: SearchContentUseCaseBody,
  user: UserInContextSchema,
});

export const searchContentUseCase = buildUseCase()
  .input(SearchContentUseCaseInput)
  .handle(async (ctx, input) => {
    const { body, user } = input;
    const result = await ctx.contentRepo.search({
      userId: user.id,
      query: body.query,
      filters: body.filters,
    });

    if (!result.success) {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("unknown error"),
      } as const;
    }

    return result;
  });
