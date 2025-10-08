import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import {
  ChatWithModuleBodySchema,
  ExecuteModuleBodySchema,
  ListModulesQuerySchema,
  ModuleParamsSchema,
  ModuleUsageHistoryQuerySchema,
} from "../domain/module";
import { getModulesUseCase } from "../app/get-modules-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { getModuleByIdUseCase } from "../app/get-module-by-id-use-case";
import { getModuleUsageHistoryUseCase } from "../app/get-module-usage-history-use-case";
import { executeModuleUseCase } from "../app/execute-module-use-case";
import { chatWithModuleUseCase } from "../app/chat-with-module-use-case";
import { authenticateToken } from "src/auth/presentation/auth-middleware";
import { getUserInContext } from "src/lib/get-user-in-context";

export const moduleRouter = honoRouter((ctx) => {
  const router = new Hono();

  router.use("*", authenticateToken(ctx));

  router.get(
    "/",
    zValidatorWrapper("query", ListModulesQuerySchema),
    async (c) => {
      const query = c.req.valid("query");
      const result = await getModulesUseCase(ctx, query);
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  router.get(
    "/usage/history",
    zValidatorWrapper("query", ModuleUsageHistoryQuerySchema),
    async (c) => {
      const user = getUserInContext(c);
      const query = c.req.valid("query");
      const result = await getModuleUsageHistoryUseCase(ctx, {
        query,
        user,
      });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  router.get(
    "/:id",
    zValidatorWrapper("param", ModuleParamsSchema),
    async (c) => {
      const params = c.req.valid("param");
      const result = await getModuleByIdUseCase(ctx, params);
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  router.post(
    "/:id/execute",
    zValidatorWrapper("param", ModuleParamsSchema),
    zValidatorWrapper("json", ExecuteModuleBodySchema),
    async (c) => {
      const params = c.req.valid("param");
      const body = c.req.valid("json");
      const result = await executeModuleUseCase(ctx, {
        params,
        body,
        user: getUserInContext(c),
        metadata: {
          userAgent: c.req.header("user-agent") || undefined,
          ipAddress:
            c.req.header("x-forwarded-for")?.split(",").shift() || undefined,
        },
      });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  router.post(
    "/:id/chat",
    zValidatorWrapper("param", ModuleParamsSchema),
    zValidatorWrapper("json", ChatWithModuleBodySchema),
    async (c) => {
      const params = c.req.valid("param");
      const body = c.req.valid("json");
      const result = await chatWithModuleUseCase(ctx, {
        body,
        params,
        user: getUserInContext(c),
      });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  return router;
});
