import z from "zod";
import { buildUseCase } from "src/lib/use-case-builder";

export const UpdateChatSessionUsecaseinput = z.object({
  sessionId: z.string(),
  sessionData: z.record(z.string(), z.unknown()),
});

export const updateChatSessionUseCase = buildUseCase()
  .input(UpdateChatSessionUsecaseinput)
  .handle(async (ctx, input) => {
    const chatSessionResult = await ctx.chatSessionRepo.getChatSession({
      sessionId: input.sessionId,
    });
    if (!chatSessionResult.success) return chatSessionResult;
    const sessionDataMerged = {
      ...chatSessionResult.data.sessionData,
      ...input.sessionData,
    };

    return ctx.chatSessionRepo.updateChatSession({
      sessionId: input.sessionId,
      sessionData: sessionDataMerged,
    });
  });
