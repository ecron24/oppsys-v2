import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { submitForApprovalUseCase } from "../app/submit-for-approval-usecase";
import { getApprovalHistoryUseCase } from "../app/get-approval-history-usecase";
import {
  ToggleFavoriteBody,
  toggleFavoriteUseCase,
} from "../app/toggle-favorite-usecase";
import { getContentUseCase } from "../app/get-content-usecase";
import {
  UpdateContentBody,
  updateContentUseCase,
} from "../app/update-content-usecase";
import { deleteContentUseCase } from "../app/delete-content-usecase";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { handleResultResponse } from "src/lib/handle-result-response";
import {
  getContentStatsUseCase,
  GetContentStatsUseCaseQuery,
} from "../app/get-content-stats-use-case";
import { getUserInContext } from "src/lib/get-user-in-context";
import {
  searchContentUseCase,
  SearchContentUseCaseBody,
} from "../app/search-content-use-case";
import {
  createContentUseCase,
  CreateContentUseCaseBody,
} from "../app/create-content-use-case";
import {
  getAllContentUseCase,
  GetAllContentUseCaseQuery,
} from "../app/get-all-content-use-case";
import { describeRoute, validator } from "hono-openapi";

export const contentRouter = honoRouter((ctx) => {
  const router = new Hono()
    .get(
      "/generated",
      describeRoute({ description: "Get all generated content" }),
      zValidatorWrapper("query", GetAllContentUseCaseQuery),
      validator("query", GetAllContentUseCaseQuery),
      async (c) => {
        const query = c.req.valid("query");
        const user = getUserInContext(c);
        const result = await getAllContentUseCase(ctx, { query, user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/generated",
      describeRoute({ description: "Create new generated content" }),
      zValidatorWrapper("json", CreateContentUseCaseBody),
      validator("json", CreateContentUseCaseBody),
      async (c) => {
        const body = c.req.valid("json");
        const user = getUserInContext(c);
        const result = await createContentUseCase(ctx, { body, user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/generated/:id",
      describeRoute({ description: "Get generated content by ID" }),
      async (c) => {
        const id = c.req.param("id");
        const user = getUserInContext(c);
        const result = await getContentUseCase(ctx, { id, userId: user.id });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .put(
      "/generated/:id",
      describeRoute({ description: "Update generated content by ID" }),
      zValidatorWrapper("json", UpdateContentBody),
      validator("json", UpdateContentBody),
      async (c) => {
        const id = c.req.param("id");
        const user = getUserInContext(c);
        const updateData = c.req.valid("json");
        const result = await updateContentUseCase(ctx, {
          id,
          userId: user.id,
          updateData,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .delete(
      "/generated/:id",
      describeRoute({ description: "Delete generated content by ID" }),
      async (c) => {
        const id = c.req.param("id");
        const user = getUserInContext(c);
        const result = await deleteContentUseCase(ctx, { id, userId: user.id });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/stats",
      describeRoute({ description: "Get content statistics" }),
      zValidatorWrapper("query", GetContentStatsUseCaseQuery),
      validator("query", GetContentStatsUseCaseQuery),
      async (c) => {
        const query = c.req.valid("query");
        const user = getUserInContext(c);
        const result = await getContentStatsUseCase(ctx, { query, user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/search",
      describeRoute({ description: "Search content" }),
      zValidatorWrapper("json", SearchContentUseCaseBody),
      validator("json", SearchContentUseCaseBody),
      async (c) => {
        const body = c.req.valid("json");
        const user = getUserInContext(c);
        const result = await searchContentUseCase(ctx, { body, user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/generated/:id/submit-for-approval",
      describeRoute({ description: "Submit generated content for approval" }),
      async (c) => {
        const id = c.req.param("id");
        const user = getUserInContext(c);
        const result = await submitForApprovalUseCase(ctx, {
          id,
          userId: user.id,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/generated/:id/approval-history",
      describeRoute({
        description: "Get approval history for generated content",
      }),
      async (c) => {
        const id = c.req.param("id");
        const result = await getApprovalHistoryUseCase(ctx, { contentId: id });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .patch(
      "/generated/:id/favorite",
      describeRoute({ description: "Toggle favorite for generated content" }),
      zValidatorWrapper("json", ToggleFavoriteBody),
      validator("json", ToggleFavoriteBody),
      async (c) => {
        const id = c.req.param("id");
        const user = getUserInContext(c);
        const body = c.req.valid("json");
        const result = await toggleFavoriteUseCase(ctx, {
          id,
          userId: user.id,
          body,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );

  return router;
});
