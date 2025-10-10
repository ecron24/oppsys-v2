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

export const chatRouter = honoRouter((ctx: OppSysContext) => {
  const router = new Hono()
    .post(
      "/sessions",
      zValidatorWrapper("json", CreateOrGetChatSessionBody),
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
      zValidatorWrapper(
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
    .get("/sessions/:sessionId", async (c) => {
      const sessionId = c.req.param("sessionId");
      const result = await getChatSessionUseCase(ctx, { sessionId });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })
    .delete("/sessions/cleanup", async (c) => {
      const result = await cleanupExpiredSessionsUseCase(ctx, {});
      return handleResultResponse(c, result, { oppSysContext: ctx });
    });
  return router;
});
