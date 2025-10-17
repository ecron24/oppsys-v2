import z from "zod";

export const GenerateRagUploadUrlInputSchema = z.object({
  fileName: z.string(),
  fileType: z.enum([
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  fileSize: z.number().int().positive().max(10485760), // 10MB max
});

export type GenerateRagUploadUrlInput = z.infer<
  typeof GenerateRagUploadUrlInputSchema
>;
