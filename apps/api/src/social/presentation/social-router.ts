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
import { describeRoute, validator } from "hono-openapi";

export const socialRouter = honoRouter((ctx) => {
  const router = new Hono()
    .post(
      "/init",
      describeRoute({ description: "Initiate social authentication" }),
      zValidatorWrapper("json", InitiateAuthInputSchema.omit({ userId: true })),
      validator("json", InitiateAuthInputSchema.omit({ userId: true })),
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
      describeRoute({ description: "Complete social authentication callback" }),
      zValidatorWrapper("json", CompleteAuthInputSchema.omit({ userId: true })),
      validator("json", CompleteAuthInputSchema.omit({ userId: true })),
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
      describeRoute({ description: "Get connected social platforms for user" }),
      zValidatorWrapper(
        "query",
        GetConnectionsInputSchema.omit({ userId: true })
      ),
      validator("query", GetConnectionsInputSchema.omit({ userId: true })),
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
      describeRoute({ description: "Test connection status for a platform" }),
      zValidatorWrapper(
        "query",
        TestConnectionInputSchema.omit({ userId: true })
      ),
      validator("query", TestConnectionInputSchema.omit({ userId: true })),
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
      describeRoute({ description: "Disconnect a social platform from user" }),
      zValidatorWrapper(
        "query",
        DisconnectPlatformInputSchema.omit({ userId: true })
      ),
      validator("query", DisconnectPlatformInputSchema.omit({ userId: true })),
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
      describeRoute({ description: "Refresh social platform access token" }),
      zValidatorWrapper("json", RefreshTokenInputSchema.omit({ userId: true })),
      validator("json", RefreshTokenInputSchema.omit({ userId: true })),
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
