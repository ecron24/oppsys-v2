import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { ModuleParamsSchema } from "../domain/module";
import {
  getModulesUseCase,
  ListModulesQuerySchema,
} from "../app/get-modules-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { getModuleByIdUseCase } from "../app/get-module-by-id-use-case";
import {
  getModuleUsageHistoryUseCase,
  ModuleUsageHistoryQuerySchema,
} from "../app/get-module-usage-history-use-case";
import {
  ExecuteModuleBodySchema,
  executeModuleUseCase,
} from "../app/execute-module-use-case";
import {
  ChatWithModuleBodySchema,
  chatWithModuleUseCase,
} from "../app/chat-with-module-use-case";
import { getUserInContext } from "src/lib/get-user-in-context";
import { describeRoute, validator } from "hono-openapi";

export const moduleRouter = honoRouter((ctx) => {
  const router = new Hono()
    .get(
      "/",
      describeRoute({
        description: "",
      }),
      zValidatorWrapper("query", ListModulesQuerySchema),
      validator("query", ListModulesQuerySchema),
      async (c) => {
        const query = c.req.valid("query");
        const result = await getModulesUseCase(ctx, query);
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    .get(
      "/usage/history",
      describeRoute({
        description: "",
      }),
      zValidatorWrapper("query", ModuleUsageHistoryQuerySchema),
      validator("query", ModuleUsageHistoryQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        console.log("user", user);

        const query = c.req.valid("query");
        const result = await getModuleUsageHistoryUseCase(ctx, {
          query,
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    .get(
      "/:id",
      describeRoute({
        description: "",
      }),
      zValidatorWrapper("param", ModuleParamsSchema),
      validator("param", ModuleParamsSchema),
      async (c) => {
        const params = c.req.valid("param");
        const result = await getModuleByIdUseCase(ctx, params);
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    .post(
      "/:id/execute",
      describeRoute({
        description: "",
      }),
      zValidatorWrapper("param", ModuleParamsSchema),
      validator("param", ModuleParamsSchema),
      zValidatorWrapper("json", ExecuteModuleBodySchema),
      validator("json", ExecuteModuleBodySchema),
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
    )

    .post(
      "/:id/chat",
      describeRoute({
        description: "",
      }),
      zValidatorWrapper("param", ModuleParamsSchema),
      validator("param", ModuleParamsSchema),
      zValidatorWrapper("json", ChatWithModuleBodySchema),
      validator("json", ChatWithModuleBodySchema),
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
