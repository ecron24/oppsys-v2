import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard-service";
import type { ContentStat } from "../type";
import { queryKeys } from "@/components/tanstack-query/query-client";

export function usePerformanceStats() {
  const {
    data: stats = null,
    isLoading: loading,
    error,
  } = useQuery<ContentStat | null>({
    queryKey: queryKeys.dashboard.performanceStats,
    queryFn: async () => {
      const response = await dashboardService.getPerformanceStats();
      if (!response.success) {
        if (response.status == 404) return null;
        throw new Error(response.error);
      }
      return response.data;
    },
  });

  return { stats, loading, error };
}
