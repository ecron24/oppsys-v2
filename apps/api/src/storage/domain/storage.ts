import z from "zod";

export const DocumentsRagSchema = z.object({
  fileName: z.string(),
  fileType: z.enum([
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024), // 10mb
  bucket: z.literal("documents-rag"),
});

const TalentAnalyzerSchema = z.object({
  fileName: z.string(),
  fileType: z.enum(["application/pdf", "text/plain", "application/json"]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024), // 5mb
  bucket: z.literal("talent-analyzer"),
});

export const GenerateUploadUrlInputSchema = z.discriminatedUnion("bucket", [
  DocumentsRagSchema,
  TalentAnalyzerSchema,
]);

export type GenerateUploadUrlInput = z.infer<
  typeof GenerateUploadUrlInputSchema
>;
