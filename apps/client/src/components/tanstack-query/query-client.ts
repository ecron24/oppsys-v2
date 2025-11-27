import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient();

export const queryKeys = {
  auth: {
    session: ["auth", "session"],
    user: ["auth", "user"],
  },
  user: {
    all: () => ["user"],
    permissions: ["user", "permissions"],
  },
  dashboard: {
    overview: (period: string) => ["dashboard", "overview", period],
    modulesStats: (period: string) => ["dashboard", "modulesStats", period],
    recentActivity: (limit: number | string) => [
      "dashboard",
      "recentActivity",
      limit.toString(),
    ],
    performanceStats: ["dashboard", "performanceStats"],
  },
  modules: {
    list: ["modules"],
    id: (id: string) => ["modules", id],
  },
  plans: {
    list: ["plans"],
  },
  social: {
    socialConnections: ["social", "social-connections"],
    socialStats: ["social", "social-stats"],
  },
  content: {
    userId: (userId?: string) => ["contents", userId],
  },
};
