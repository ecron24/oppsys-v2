import z from "zod";
import { buildUseCase } from "src/lib/use-case-builder";

export const GetChatSessionUsecaseInput = z.object({
  sessionId: z.string(),
});

export const getChatSessionUseCase = buildUseCase()
  .input(GetChatSessionUsecaseInput)
  .handle((ctx, input) => {
    return ctx.chatSessionRepo.getChatSession({ sessionId: input.sessionId });
  });
