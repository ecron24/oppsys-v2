import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

const DownloadTemplateUseCaseInputSchema = z.object({
  templateId: z.string(),
  userId: z.string(),
});

export type DownloadTemplateUseCaseInput = z.infer<
  typeof DownloadTemplateUseCaseInputSchema
>;

export const downloadTemplateUseCase = buildUseCase()
  .input(DownloadTemplateUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { templateId, userId } = input;

    // Get template info
    const templateResult = await ctx.templateRepo.getTemplateById(
      templateId,
      userId
    );
    if (!templateResult.success) return templateResult;

    const template = templateResult.data;
    // Download file from storage
    const downloadResult = await ctx.supabase.storage
      .from("templates")
      .download(template.filePath);

    if (downloadResult.error) {
      ctx.logger.error(
        "[downloadTemplate] file download failed",
        downloadResult.error,
        { filePath: template.filePath }
      );
      return {
        success: false,
        kind: "DOWNLOAD_FAILED",
        error: new Error("Failed to download file"),
      };
    }

    // Determine content type
    let contentType = "application/octet-stream";
    if (template.filePath.endsWith(".docx")) {
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    } else if (template.filePath.endsWith(".doc")) {
      contentType = "application/msword";
    } else if (template.filePath.endsWith(".pdf")) {
      contentType = "application/pdf";
    } else if (template.filePath.endsWith(".txt")) {
      contentType = "text/plain";
    }

    return {
      success: true,
      data: {
        fileData: await downloadResult.data.arrayBuffer(),
        contentType,
        filename: template.name,
      },
    };
  });
