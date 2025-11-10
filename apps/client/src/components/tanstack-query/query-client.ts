import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
  auth: {
    session: ["auth", "session"],
    user: ["auth", "user"],
  },
  user: {
    permissions: ["user", "permissions"],
  },
  dashboard: {
    overview: (period: string) => ["dashboard", "overview", period],
    modulesStats: (period: string) => ["dashboard", "modulesStats", period],
    recentActivity: (limit: string) => ["dashboard", "recentActivity", limit],
    performanceStats: ["dashboard", "performanceStats"],
  },
  modules: {
    list: ["modules", "list"],
  },
};
