import { useQuery } from "@tanstack/react-query";
import { dashboardService, type Period } from "../services/dashboard-service";
import type { DashboardOverviewData } from "../type";
import { queryKeys } from "@/components/tanstack-query/query-client";

export function useDashboardOverview(period: Period = "month") {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
    isRefetching,
  } = useQuery<DashboardOverviewData | null>({
    queryKey: queryKeys.dashboard.overview(period),
    queryFn: async () => {
      const response = await dashboardService.getDashboardOverview(period);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  return { data, loading, refetch, error, isRefetching };
}
