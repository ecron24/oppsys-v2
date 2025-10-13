import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { z } from "zod";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import type { OppSysContext } from "src/get-context";
import {
  CreateOrGetChatSessionBody,
  createOrGetChatSessionUseCase,
} from "../app/create-or-get-chat-session.usecase";
import { getUserInContext } from "src/lib/get-user-in-context";
import { updateChatSessionUseCase } from "../app/update-chat-session.usecase";
import { getChatSessionUseCase } from "../app/get-chat-session.usecase";
import { cleanupExpiredSessionsUseCase } from "../app/cleanup-expired-sessions.usecase";
import { describeRoute, validator } from "hono-openapi";

export const chatRouter = honoRouter((ctx: OppSysContext) => {
  const router = new Hono()
    .post(
      "/sessions",
      describeRoute({ description: "Create or get a chat session" }),
      zValidatorWrapper("json", CreateOrGetChatSessionBody),
      validator("json", CreateOrGetChatSessionBody),
      async (c) => {
        const { moduleSlug } = c.req.valid("json");
        const user = getUserInContext(c);
        const result = await createOrGetChatSessionUseCase(ctx, {
          body: { moduleSlug },
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .put(
      "/sessions/:sessionId",
      describeRoute({ description: "Update chat session data" }),
      zValidatorWrapper(
        "json",
        z.object({ sessionData: z.record(z.string(), z.unknown()) })
      ),
      validator(
        "json",
        z.object({ sessionData: z.record(z.string(), z.unknown()) })
      ),
      async (c) => {
        const sessionId = c.req.param("sessionId");
        const { sessionData } = c.req.valid("json");
        const result = await updateChatSessionUseCase(ctx, {
          sessionId,
          sessionData,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/sessions/:sessionId",
      describeRoute({ description: "Get chat session by ID" }),
      async (c) => {
        const sessionId = c.req.param("sessionId");
        const result = await getChatSessionUseCase(ctx, { sessionId });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .delete(
      "/sessions/cleanup",
      describeRoute({ description: "Cleanup expired chat sessions" }),
      async (c) => {
        const result = await cleanupExpiredSessionsUseCase(ctx, {});
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );
  return router;
});
