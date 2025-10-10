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
import { describeRoute, validator } from "hono-openapi";

export const profileRouter = honoRouter((ctx) => {
  const router = new Hono()
    .get(
      "/me",
      describeRoute({ description: "Get current user profile" }),
      async (c) => {
        const user = getUserInContext(c);
        const result = await getProfileUseCase(ctx, { userId: user.id });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .put(
      "/profile",
      describeRoute({ description: "Update user profile" }),
      zValidatorWrapper("json", UpdateProfileSchema),
      validator("json", UpdateProfileSchema),
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
    .get(
      "/plan-history",
      describeRoute({ description: "Get user plan history" }),
      async (c) => {
        const user = getUserInContext(c);
        const result = await getPlanHistoryUseCase(ctx, { userId: user.id });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/generated-content",
      describeRoute({ description: "Get generated content history" }),
      zValidatorWrapper("query", GetGeneratedContentQuerySchema),
      validator("query", GetGeneratedContentQuerySchema),
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
