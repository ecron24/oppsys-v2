import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const SubmitForApprovalInput = z.object({
  id: z.string(),
  userId: z.string(),
});

export const submitForApprovalUseCase = buildUseCase()
  .input(SubmitForApprovalInput)
  .handle(async (ctx, input) => {
    const { id, userId } = input;
    const result = await ctx.contentRepo.submitForApproval({ id, userId });
    return result;
  });
