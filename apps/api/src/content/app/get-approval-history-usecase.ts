import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";

export const GetApprovalHistoryInput = z.object({
  contentId: z.string(),
});

export const getApprovalHistoryUseCase = buildUseCase()
  .input(GetApprovalHistoryInput)
  .handle(async (ctx, input) => {
    const { contentId } = input;
    const result = await ctx.contentRepo.getApprovalHistory({ contentId });
    return result;
  });
