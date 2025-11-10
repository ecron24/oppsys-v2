import type { Content } from "@/app/(sidebar)/content/types";
import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";

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
};
