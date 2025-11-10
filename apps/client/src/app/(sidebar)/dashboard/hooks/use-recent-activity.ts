import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboard-service";

export const useRecentActivity = (limit = 15) => {
  const {
    data: activities = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recentActivity", limit],
    queryFn: async () => {
      const response = await dashboardService.getActivity({ limit });
      if (response.success) return response.data;
      throw new Error(response.error);
    },
  });

  return { activities, loading, error, refetch };
};
