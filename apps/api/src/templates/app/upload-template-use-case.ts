import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

const UploadTemplateUseCaseInputSchema = z.object({
  userId: z.string(),
  file: z.object({
    originalname: z.string(),
    buffer: z.instanceof(Buffer),
    mimetype: z.string(),
    size: z.number(),
  }),
  leaseType: z.string(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export type UploadTemplateUseCaseInput = z.infer<
  typeof UploadTemplateUseCaseInputSchema
>;

export const uploadTemplateUseCase = buildUseCase()
  .input(UploadTemplateUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { userId, file, leaseType, category, isPublic } = input;

    // Validate lease type
    const validLeaseTypes = [
      "residential_free",
      "residential_pro",
      "furnished",
      "commercial",
      "professional",
    ];
    if (!validLeaseTypes.includes(leaseType)) {
      return {
        success: false,
        kind: "INVALID_LEASE_TYPE",
        error: new Error("Invalid lease type"),
      };
    }

    // Generate file path
    const filePath = `real-estate/${userId}/${Date.now()}-${file.originalname}`;

    // Upload file to storage
    const uploadResult = await ctx.supabase.storage
      .from("templates")
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadResult.error) {
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
      name: file.originalname,
      filePath,
      fileSize: file.size,
      leaseType,
      category: category || "real_estate",
      isPublic: isPublic || false,
    });

    if (!createResult.success) {
      // Clean up uploaded file if database insert fails
      await ctx.supabase.storage.from("templates").remove([filePath]);
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
