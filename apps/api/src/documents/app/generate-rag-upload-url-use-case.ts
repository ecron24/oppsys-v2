import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { GenerateRagUploadUrlInputSchema } from "../domain/documents";
import { generateUploadUrlUseCase } from "src/storage/app/generate-upload-url-use-case";

const GenerateRagUploadUrlUseCaseInputSchema =
  GenerateRagUploadUrlInputSchema.extend({
    userId: z.string(),
  });

export const generateRagUploadUrlUseCase = buildUseCase()
  .input(GenerateRagUploadUrlUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const result = await generateUploadUrlUseCase(ctx, {
      body: {
        bucket: "documents-rag",
        ...input,
      },
      userId: input.userId,
    });

    return result;
  });
