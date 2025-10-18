import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

export const CreateDownloadUrlInput = z.object({
  filePath: z.string(),
  expiresIn: z.number().default(7200).optional(),
});

export const createDownloadUrlUseCase = buildUseCase()
  .input(CreateDownloadUrlInput)
  .handle(async (ctx, input) => {
    const { data, error } = await ctx.supabase.storage
      .from("youtube-videos")
      .createSignedUrl(input.filePath, input.expiresIn || 7200);

    if (error) {
      ctx.logger.error("[createDownloadUrl]: ", error, { input });
      throw error;
    }

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
      },
    } as const;
  });
