import { buildUseCase } from "src/lib/use-case-builder";
import { ListTranscriptionsQuerySchema } from "../domain/transcription-schema";
import { UserInContextSchema } from "src/lib/get-user-in-context";

const ListTranscriptionsUseCaseInput = ListTranscriptionsQuerySchema.extend({
  user: UserInContextSchema,
});

export const listTranscriptionsUseCase = buildUseCase()
  .input(ListTranscriptionsUseCaseInput)
  .handle(async (ctx, input) => {
    const { limit, offset, status, type, user } = input;

    const result = await ctx.transcriptionRepo.listTranscriptions(user.id, {
      limit,
      offset,
      status,
      type,
    });
    if (!result.success) return result;

    return {
      success: true,
      data: result.data,
    } as const;
  });
