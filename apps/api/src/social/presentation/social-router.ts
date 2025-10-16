import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import {
  initiateAuthUseCase,
  InitiateAuthInputSchema,
} from "../app/initiate-auth-usecase";
import {
  completeAuthUseCase,
  CompleteAuthInputSchema,
} from "../app/complete-auth-usecase";
import {
  getConnectionsUseCase,
  GetConnectionsInputSchema,
} from "../app/get-connections-usecase";
import {
  testConnectionUseCase,
  TestConnectionInputSchema,
} from "../app/test-connection-usecase";
import {
  disconnectPlatformUseCase,
  DisconnectPlatformInputSchema,
} from "../app/disconnect-platform-usecase";
import {
  refreshTokenUseCase,
  RefreshTokenInputSchema,
} from "../app/refresh-token-usecase";
import { getUserInContext } from "src/lib/get-user-in-context";

export const socialRouter = honoRouter((ctx) => {
  const router = new Hono()
    .post(
      "/init",
      zValidatorWrapper("json", InitiateAuthInputSchema.omit({ userId: true })),
      async (c) => {
        const input = c.req.valid("json");
        const user = getUserInContext(c);
        const result = await initiateAuthUseCase(ctx, {
          ...input,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/callback",
      zValidatorWrapper("json", CompleteAuthInputSchema.omit({ userId: true })),
      async (c) => {
        const input = c.req.valid("json");
        const user = getUserInContext(c);
        const result = await completeAuthUseCase(ctx, {
          ...input,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/connections",
      zValidatorWrapper(
        "query",
        GetConnectionsInputSchema.omit({ userId: true })
      ),
      async (c) => {
        const input = c.req.valid("query");
        const user = getUserInContext(c);
        const result = await getConnectionsUseCase(ctx, {
          ...input,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/connections/:platform/status",
      zValidatorWrapper(
        "query",
        TestConnectionInputSchema.omit({ userId: true })
      ),
      async (c) => {
        const input = c.req.valid("query");
        const user = getUserInContext(c);
        const result = await testConnectionUseCase(ctx, {
          ...input,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .delete(
      "/connections/:platform",
      zValidatorWrapper(
        "query",
        DisconnectPlatformInputSchema.omit({ userId: true })
      ),
      async (c) => {
        const input = c.req.valid("query");
        const user = getUserInContext(c);
        const result = await disconnectPlatformUseCase(ctx, {
          ...input,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/connections/:platform/refresh",
      zValidatorWrapper("json", RefreshTokenInputSchema.omit({ userId: true })),
      async (c) => {
        const input = c.req.valid("json");
        const user = getUserInContext(c);
        const result = await refreshTokenUseCase(ctx, {
          ...input,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );

  return router;
});
