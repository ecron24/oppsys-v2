import { DocumentsRagSchema } from "src/storage/domain/storage";
import z from "zod";

export const GenerateRagUploadUrlInputSchema = DocumentsRagSchema.omit({
  bucket: true,
});

export type GenerateRagUploadUrlInput = z.infer<
  typeof GenerateRagUploadUrlInputSchema
>;
