import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { fileMiddleware } from "./template-utils";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { uploadFile, removeFile } from "@oppsys/supabase";

export const UploadTemplateBody = z.object({
  leaseType: z.enum([
    "residential_free",
    "residential_pro",
    "furnished",
    "commercial",
    "professional",
  ]),
  category: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
  file: z.instanceof(File),
});

const UploadTemplateUseCaseInputSchema = z.object({
  user: UserInContextSchema,
  body: UploadTemplateBody,
});

export const uploadTemplateUseCase = buildUseCase()
  .input(UploadTemplateUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { id: userId } = input.user;
    const { file, leaseType, category, isPublic } = input.body;
    const fileResult = fileMiddleware(file);
    if (!fileResult.success) return fileResult;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    // Generate file path
    const filePath = `real-estate/${userId}/${Date.now()}-${file.name}`;

    // Upload file to storage
    const uploadResult = await uploadFile(ctx, {
      bucket: "templates",
      filePath,
      file: buffer,
      options: { contentType: file.type, upsert: false },
    });

    if (!uploadResult.success) {
      ctx.logger.error(
        "[uploadTemplate] file upload failed",
        uploadResult.error,
        { filePath }
      );
      return {
        success: false,
        kind: "UPLOAD_FAILED",
        error: new Error("Failed to upload file"),
      };
    }

    // Create template record
    const createResult = await ctx.templateRepo.createTemplate({
      userId,
      name: file.name,
      filePath,
      fileSize: file.size,
      leaseType,
      category: category || "real_estate",
      isPublic: isPublic || false,
    });

    if (!createResult.success) {
      // Clean up uploaded file if database insert fails
      await removeFile(ctx, { bucket: "templates", files: [filePath] });
      ctx.logger.error(
        "[uploadTemplate] template creation failed",
        createResult.error,
        { filePath }
      );
      return {
        success: false,
        kind: "TEMPLATE_CREATION_FAILED",
        error: new Error("Failed to create template record"),
      };
    }

    return {
      success: true,
      data: createResult.data,
    };
  });
