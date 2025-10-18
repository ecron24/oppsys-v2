import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { createSignedUrl } from "@oppsys/supabase";

export const CreateDownloadUrlInput = z.object({
  filePath: z.string(),
  expiresIn: z.number().default(7200).optional(),
});

export const createDownloadUrlUseCase = buildUseCase()
  .input(CreateDownloadUrlInput)
  .handle(async (ctx, input) => {
    const signed = await createSignedUrl(ctx, {
      bucket: "youtube-videos",
      filePath: input.filePath,
      expiresIn: input.expiresIn || 7200,
    });

    if (!signed.success) {
      ctx.logger.error("[createDownloadUrl]: ", signed.error, { input });
      throw signed.error;
    }

    return {
      success: true,
      data: { signedUrl: signed.data.signedUrl },
    } as const;
  });
