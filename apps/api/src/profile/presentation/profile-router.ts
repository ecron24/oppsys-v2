import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { getProfileUseCase } from "../app/get-profile-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { updateProfileUseCase } from "../app/update-profile-use-case";
import { getGeneratedContentHistoryUseCase } from "src/generated-content/app/get-generated-content-history-use-case";
import { GetGeneratedContentQuerySchema } from "src/generated-content/domain/module";
import { getPlanHistoryUseCase } from "src/plan/app/get-plan-history-use-case";
import { UpdateProfileSchema } from "../domain/profile";
import { getUserInContext } from "src/lib/get-user-in-context";

export const profileRouter = honoRouter((ctx) => {
  const router = new Hono()
    .get("/me", async (c) => {
      const user = getUserInContext(c);
      const result = await getProfileUseCase(ctx, { userId: user.id });

      return handleResultResponse(c, result, { oppSysContext: ctx });
    })
    .put(
      "/profile",
      zValidatorWrapper("json", UpdateProfileSchema),
      async (c) => {
        const user = getUserInContext(c);
        const body = c.req.valid("json");
        const result = await updateProfileUseCase(ctx, {
          body,
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get("/plan-history", async (c) => {
      const user = getUserInContext(c);
      const result = await getPlanHistoryUseCase(ctx, { userId: user.id });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })
    .get(
      "/generated-content",
      zValidatorWrapper("query", GetGeneratedContentQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const query = c.req.valid("query");
        const result = await getGeneratedContentHistoryUseCase(ctx, {
          query,
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );

  return router;
});
