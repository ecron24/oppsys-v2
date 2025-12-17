import { BucketSchema } from "@oppsys/supabase";
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

const TranscriptionFileSchema = z.object({
  fileName: z.string(),
  fileType: z.enum([
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
    "audio/flac",
    "video/mp4",
    "video/mov",
    "video/avi",
  ]),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024), // 10mb
  bucket: z.literal("transcription-files"),
});

export const GenerateUploadUrlInputSchema = z.discriminatedUnion("bucket", [
  DocumentsRagSchema,
  TalentAnalyzerSchema,
  TranscriptionFileSchema,
]);

export type GenerateUploadUrlInput = z.infer<
  typeof GenerateUploadUrlInputSchema
>;

export const CreateSigneUrlInputSchema = z.object({
  bucket: BucketSchema,
  filePath: z.string().min(1),
});
