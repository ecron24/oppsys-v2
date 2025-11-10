import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { honoRouter } from "src/lib/hono-router";
import { getAllPlanUseCase } from "../app/get-all-plan-use-case";
import { getUserInContext } from "src/lib/get-user-in-context";
import { handleResultResponse } from "src/lib/handle-result-response";

export const planRouter = honoRouter((ctx) => {
  const router = new Hono().get(
    "/",
    describeRoute({
      description: "List all available plan",
    }),

    async (c) => {
      const user = getUserInContext(c);
      const result = await getAllPlanUseCase(ctx, { userId: user.id });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  return router;
});
