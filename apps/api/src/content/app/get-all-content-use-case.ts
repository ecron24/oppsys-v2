import { z } from "zod";
import { buildUseCase } from "src/lib/use-case-builder";
import { UserInContextSchema } from "src/lib/get-user-in-context";

export const GetAllContentUseCaseQuery = z.object({
  limit: z.string().transform(Number).default(50),
  page: z.string().transform(Number).default(0),
  type: z.string().optional(),
});
export type GetAllContentQuery = z.infer<typeof GetAllContentUseCaseQuery>;

export const GetAllContentUseCaseInput = z.object({
  query: GetAllContentUseCaseQuery,
  user: UserInContextSchema,
});

export const getAllContentUseCase = buildUseCase()
  .input(GetAllContentUseCaseInput)
  .handle(async (ctx, input) => {
    const { query, user } = input;
    const result = await ctx.contentRepo.getAll({ userId: user.id, query });

    if (!result.success) {
      return {
        success: false,
        kind: "UNKNOWN_ERROR",
        error: new Error("unknown error"),
      } as const;
    }

    return result;
  });
