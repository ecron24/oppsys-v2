import { useQuery } from "@tanstack/react-query";
import { dashboardService, type Period } from "../services/dashboard-service";
import type { DashboardOverviewData } from "../type";
import { queryKeys } from "@/components/tanstack-query/query-client";
import { unwrap } from "@oppsys/types";

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
      return unwrap(await dashboardService.getDashboardOverview(period));
    },
  });

  return { data, loading, refetch, error, isRefetching };
}
