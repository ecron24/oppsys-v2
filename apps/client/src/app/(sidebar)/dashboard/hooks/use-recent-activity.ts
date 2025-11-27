import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard-service";
import { queryKeys } from "@/components/tanstack-query/query-client";

export const useRecentActivity = (limit = 15) => {
  const {
    data: activities = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.dashboard.recentActivity(limit),
    queryFn: async () => {
      const response = await dashboardService.getActivity({ limit });
      if (response.success) return response.data;
      throw new Error(response.error);
    },
  });

  return { activities, loading, error, refetch };
};
