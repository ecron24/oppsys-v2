import { useQuery } from "@tanstack/react-query";
import { modulesService } from "@/components/modules/service/modules-service";
import { queryKeys } from "@/components/tanstack-query/query-client";
import { MODULES_CONFIG_MAPPING } from "../modules-config";
import type { ModuleMapping } from "@/components/modules/module-types";
import { Bot } from "lucide-react";
import { lazy } from "react";
import { unwrap } from "@oppsys/utils";

const PlaceholderModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);

export function useModules() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.modules.list,
    queryFn: async () => {
      const data = unwrap(await modulesService.getAll());
      return data;
    },
  });

  const modules =
    data?.modules.map((module) => {
      const metaConfig: ModuleMapping = MODULES_CONFIG_MAPPING[module.slug]
        ? MODULES_CONFIG_MAPPING[module.slug]
        : { icon: Bot, component: PlaceholderModule, featured: true };

      return {
        ...module,
        ...metaConfig,
      };
    }) || [];

  const getFeaturedModules = () => {
    return modules.filter((mod) => mod.featured);
  };

  const getModulesByCategory = (category: string) => {
    return modules.filter((mod) => mod.category === category);
  };

  const searchModules = (searchTerm: string) => {
    const lowercasedTerm = searchTerm.toLowerCase();
    return modules.filter(
      (mod) =>
        mod.name.toLowerCase().includes(lowercasedTerm) ||
        mod.description?.toLowerCase().includes(lowercasedTerm)
    );
  };

  const getN8NModules = () => {
    return modules.filter((mod) => mod.type === "n8n");
  };

  return {
    modules,
    total: data?.total || 0,
    error,
    isLoading,
    getFeaturedModules,
    getModulesByCategory,
    searchModules,
    getN8NModules,
  };
}
