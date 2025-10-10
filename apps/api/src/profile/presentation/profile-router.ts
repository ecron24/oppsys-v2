import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { getProfileUseCase } from "../app/get-profile-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";
import { getUserInContext } from "src/lib/get-user-in-context";

export const profileRouter = honoRouter((ctx) => {
  const router = new Hono().get("/me", async (c) => {
    const user = getUserInContext(c);
    const result = await getProfileUseCase(ctx, { userId: user.id });

    return handleResultResponse(c, result, { oppSysContext: ctx });
  });

  return router;
});
