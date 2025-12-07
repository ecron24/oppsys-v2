import { buildUseCase } from "src/lib/use-case-builder";
import { z } from "zod";
import { ContentSchema } from "../domain/content";
import { deepMerge } from "@oppsys/shared";

export const UpdateContentBody = ContentSchema.partial().omit({
  userId: true,
  moduleId: true,
});

export const UpdateContentInput = z.object({
  id: z.string(),
  userId: z.string(),
  updateData: UpdateContentBody,
});

export const updateContentUseCase = buildUseCase()
  .input(UpdateContentInput)
  .handle(async (ctx, input) => {
    const { id, userId, updateData } = input;
    const contentResult = await ctx.contentRepo.getById({ id, userId });
    if (!contentResult.success) return contentResult;
    if (!contentResult.data) {
      return {
        success: false,
        error: new Error("Content not found"),
        kind: "NOT_FOUND",
      } as const;
    }
    const oldMetadata = contentResult.data?.metadata ?? {};
    const newMetadata = updateData?.metadata ?? {};
    const updateDataMerged = deepMerge(contentResult.data, {
      ...updateData,
      metadata: { ...oldMetadata, ...newMetadata },
    });
    const { modules, ...updateDataClean } = updateDataMerged;

    const result = await ctx.contentRepo.update({
      id,
      userId,
      updateData: updateDataClean,
    });
    return result;
  });
