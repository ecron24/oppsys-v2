import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { handleResultResponse } from "src/lib/handle-result-response";
import { z } from "zod";
import { getUserInContext } from "src/lib/get-user-in-context";
import {
  scheduleTaskUseCase,
  runScheduledTasksUseCase,
  getUserTasksUseCase,
  updateScheduledTaskUseCase,
  deleteScheduledTaskUseCase,
  ScheduleTaskBodySchema,
  RunScheduledTasksUseCaseInput,
  UpdateTaskBodySchema,
} from "../app";
import { requireCronSecret } from "./utils";

export const scheduleRouter = honoRouter((ctx) => {
  const router = new Hono()

    // Schedule a new task
    .post(
      "/:module_slug/schedule",
      zValidatorWrapper("param", z.object({ moduleSlug: z.string() })),
      zValidatorWrapper("json", ScheduleTaskBodySchema),
      async (c) => {
        const { moduleSlug } = c.req.valid("param");
        const { inputData, executionTime } = c.req.valid("json");
        const user = getUserInContext(c);

        const result = await scheduleTaskUseCase(ctx, {
          userId: user.id,
          moduleSlug: moduleSlug,
          body: {
            inputData: inputData,
            executionTime: executionTime,
          },
        });

        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Run scheduled tasks (cron job)
    .post(
      "/worker/run-tasks",
      zValidatorWrapper("query", RunScheduledTasksUseCaseInput),
      async (c) => {
        requireCronSecret(c);
        const { limit } = c.req.valid("query");
        const result = await runScheduledTasksUseCase(ctx, {
          limit,
        });

        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Get user tasks
    .get("/user-tasks", async (c) => {
      const user = getUserInContext(c);
      const result = await getUserTasksUseCase(ctx, { userId: user.id });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })

    // Update a scheduled task
    .put(
      "/update-task/:taskId",
      zValidatorWrapper("param", z.object({ taskId: z.string() })),
      zValidatorWrapper("json", UpdateTaskBodySchema),
      async (c) => {
        const { taskId } = c.req.valid("param");
        const { executionTime } = c.req.valid("json");
        const user = getUserInContext(c);

        const result = await updateScheduledTaskUseCase(ctx, {
          userId: user.id,
          taskId,
          body: { executionTime },
        });

        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Delete a scheduled task
    .delete("/task/:taskId", async (c) => {
      const { taskId } = c.req.param();
      const user = getUserInContext(c);

      const result = await deleteScheduledTaskUseCase(ctx, {
        userId: user.id,
        taskId,
      });

      return handleResultResponse(c, result, { oppSysContext: ctx });
    });

  return router;
});
