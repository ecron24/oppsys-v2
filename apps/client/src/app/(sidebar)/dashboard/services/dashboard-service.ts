import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";

export type Period = "week" | "month" | "year";

export const dashboardService = {
  async getDashboardOverview(period: Period) {
    return await handleApiCall(
      await honoClient.api.dashboard.overview.$get({
        query: { period },
      })
    );
  },

  async getPerformanceStats() {
    return await handleApiCall(
      await honoClient.api.dashboard["content-stats"].$get()
    );
  },

  async getModulesStats(period: Period) {
    return await handleApiCall(
      await honoClient.api.dashboard["modules-stats"].$get({
        query: { period },
      })
    );
  },
};
