import { z } from "zod";
import { createFn } from "./fn-builder";

const inputSchema = z.object({
  file_name: z.string().min(1),
  file_type: z.string().min(1),
});

const outputSchema = z.object({
  signed_url: z.string(),
  file_path: z.string(),
});

export const createTranscriptionUploadUrl = createFn()
  .input(inputSchema)
  .output(outputSchema)
  .handle(async (ctx, input) => {
    const { file_name, file_type } = input;

    const { data, error } = await ctx.supabase.rpc(
      "create_transcription_upload_url",
      {
        file_name,
        file_type,
      }
    );

    if (error || !data) {
      return {
        success: false,
        kind: "RPC_ERROR",
        error: error || new Error("Failed to create transcription upload url"),
      } as const;
    }

    return {
      success: true,
      data: data as z.infer<typeof outputSchema>,
    } as const;
  });
