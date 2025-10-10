import z from "zod";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import { buildUseCase } from "src/lib/use-case-builder";
import { updateChatSessionUseCase } from "./update-chat-session.usecase";

export const CreateOrGetChatSessionBody = z.object({
  moduleSlug: z.string(),
});

export const CreateOrGetChatUseCaseInput = z.object({
  user: UserInContextSchema,
  body: CreateOrGetChatSessionBody,
});

export const createOrGetChatSessionUseCase = buildUseCase()
  .input(CreateOrGetChatUseCaseInput)
  .handle(async (ctx, { body, user }) => {
    const found = await ctx.chatSessionRepo.findActiveSession({
      userId: user.id,
      moduleSlug: body.moduleSlug,
    });
    if (found.success) {
      await updateChatSessionUseCase(ctx, {
        sessionId: found.data.id,
        sessionData: {
          ...found.data.sessionData,
          last_activity: new Date().toISOString(),
        },
      });
      return found;
    }

    return ctx.chatSessionRepo.createSession({
      userId: user.id,
      moduleSlug: body.moduleSlug,
    });
  });
