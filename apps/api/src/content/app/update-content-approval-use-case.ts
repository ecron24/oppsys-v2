import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import { ContentApprovalSchema } from "../domain/content";

export const UpdateContentApprovalBody = ContentApprovalSchema.partial();

export const UpdateContentApprovalInput = z.object({
  id: z.string(),
  userId: z.string(),
  updateData: UpdateContentApprovalBody,
});

export const updateContentApprovalUseCase = buildUseCase()
  .input(UpdateContentApprovalInput)
  .handle(async (ctx, input) => {
    const { id, userId, updateData } = input;
    const result = await ctx.contentRepo.updateContentApproval({
      ...updateData,
      contentId: id,
      userId,
    });
    return result;
  });
