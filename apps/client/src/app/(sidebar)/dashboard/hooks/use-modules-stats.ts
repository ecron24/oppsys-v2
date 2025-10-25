import { useQuery } from "@tanstack/react-query";
import { dashboardService, type Period } from "../services/dashboard-service";
import { queryKeys } from "@/components/tanstack-query/query-client";

export function useModulesStats(period: Period = "month") {
  const {
    data: modulesStats = [],
    isLoading: loading,
    error,
  } = useQuery<ModuleStat[]>({
    queryKey: queryKeys.dashboard.modulesStats(period),
    queryFn: async () => {
      const response = await dashboardService.getModulesStats(period);
      if (!response.success) throw new Error(response.error);

      return response.data.data.map((stat) => ({
        name: stat.moduleName || "",
        slug: stat.moduleSlug || "",
        uses: stat.totalUsage || 0,
        credits: stat.totalCreditsUsed || 0,
        successRate: stat.successRate || 0,
        cost: stat.creditCost || 0,
      }));
    },
  });

  return { modulesStats, loading, error };
}

type ModuleStat = {
  name: string;
  slug: string;
  uses: number;
  credits: number;
  successRate: number;
  cost: number;
};
