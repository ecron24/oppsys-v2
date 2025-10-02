import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { zValidator } from "@hono/zod-validator";
import { ListModulesQuerySchema } from "../domain/module";
import { getModulesUseCase } from "../app/get-modules-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";

export const moduleRouter = honoRouter((ctx) => {
  const router = new Hono().get(
    "/",
    zValidator("query", ListModulesQuerySchema),
    async (c) => {
      const result = await getModulesUseCase(ctx, c.req.valid("query"));
      return handleResultResponse(c, result);
    }
  );

  return router;
});
