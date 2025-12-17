import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { CreateSigneUrlInputSchema } from "../domain/storage";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { createSignedUrl } from "@oppsys/supabase";

const CreateSigneUrlUseCaseInputSchema = z.object({
  body: CreateSigneUrlInputSchema,
  user: UserInContextSchema,
});

export const createSignedUrlUseCase = buildUseCase()
  .input(CreateSigneUrlUseCaseInputSchema)
  .handle(async (ctx, input) => {
    const { bucket, filePath } = input.body;

    const signedResult = await createSignedUrl(
      { supabase: ctx.supabase },
      { bucket, filePath }
    );

    if (!signedResult.success) {
      ctx.logger.error(
        "[generateUploadUrl]: create signed upload url failed",
        signedResult.error,
        { bucket, filePath }
      );
      return {
        success: false,
        error: new Error("Failed to create upload URL"),
        kind: "UNKNOWN_ERROR",
      };
    }

    return {
      success: true,
      data: {
        signedUrl: signedResult.data.signedUrl,
        filePath: filePath,
      },
    } as const;
  });
