import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";

export const plansService = {
  getPlans: async () => {
    return handleApiCall(await honoClient.api.plans.$get());
  },
};
