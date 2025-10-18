import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

const DeleteTemplateUseCaseInputSchema = z.object({
  templateId: z.string(),
  userId: z.string(),
});

export type DeleteTemplateUseCaseInput = z.infer<
  typeof DeleteTemplateUseCaseInputSchema
>;

export const deleteTemplateUseCase = buildUseCase()
  .input(DeleteTemplateUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { templateId, userId } = input;

    // Get template info first to check ownership
    const templateResult = await ctx.templateRepo.getTemplateById(
      templateId,
      userId
    );
    if (!templateResult.success) return templateResult;

    const template = templateResult.data;
    // Delete file from storage
    const deleteFileResult = await ctx.supabase.storage
      .from("templates")
      .remove([template.filePath]);

    if (deleteFileResult.error) {
      ctx.logger.error(
        "[deleteTemplate] file deletion failed",
        deleteFileResult.error,
        { filePath: template.filePath }
      );
      // Continue with database deletion even if file deletion fails
    }

    // Delete template record
    const deleteResult = await ctx.templateRepo.deleteTemplate(
      templateId,
      userId
    );

    if (!deleteResult.success) {
      ctx.logger.error(
        "[deleteTemplate] template deletion failed",
        deleteResult.error,
        { templateId, userId }
      );
      return {
        success: false,
        kind: "TEMPLATE_DELETION_FAILED",
        error: new Error("Failed to delete template"),
      } as const;
    }

    return {
      success: true,
      data: undefined,
    };
  });
