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
    performanceStats: ["dashboard", "performanceStats"],
  },
  modules: {
    list: ["modules", "list"],
  },
};
