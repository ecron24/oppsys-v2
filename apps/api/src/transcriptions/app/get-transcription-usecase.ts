import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";

const GetTranscriptionUseCaseInput = z.object({
  id: z.uuid(),
  user: UserInContextSchema,
});

export const getTranscriptionUseCase = buildUseCase()
  .input(GetTranscriptionUseCaseInput)
  .handle(async (ctx, input) => {
    const { id, user } = input;

    const result = await ctx.transcriptionRepo.getTranscriptionById(
      id,
      user.id
    );
    if (!result.success) return result;

    return {
      success: true,
      data: result.data,
    } as const;
  });
