import type { Content } from "@/app/(sidebar)/content/content-types";
import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { UpdateTaskBody } from "./schelude-types";

export const scheludeService = {
  scheludeContent: async (params: {
    executionTime: string;
    content: Content;
  }) => {
    return handleApiCall(
      await honoClient.api.schedule[":module_slug"]["schedule"].$post({
        param: { moduleSlug: params.content.moduleSlug },
        json: {
          inputData: (params.content.metadata?.input ||
            params.content.metadata ||
            {}) as Record<string, unknown>,
          executionTime: params.executionTime,
        },
      })
    );
  },
  getUserTasks: async () => {
    return handleApiCall(await honoClient.api.schedule["user-tasks"].$get());
  },
  updateTask: async (taskId: string, data: UpdateTaskBody) => {
    return handleApiCall(
      await honoClient.api.schedule["update-task"][":taskId"].$put({
        param: { taskId },
        json: data,
      })
    );
  },
  deleteTask: async (taskId: string) => {
    return handleApiCall(
      await honoClient.api.schedule.task[":taskId"].$delete({
        param: { taskId },
      })
    );
  },
};
