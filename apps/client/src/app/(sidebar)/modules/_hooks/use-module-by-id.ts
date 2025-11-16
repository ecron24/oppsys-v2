import { useQuery } from "@tanstack/react-query";
import { modulesService } from "@/components/modules/service/modules-service";
import { queryKeys } from "@/components/tanstack-query/query-client";
import { MODULES_CONFIG_MAPPING } from "../modules-config";
import { Bot } from "lucide-react";
import { lazy } from "react";
import type { ModuleMapping, Module } from "@/components/modules/module-types";

const PlaceholderModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);

export function useModuleById(id: string) {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.modules.id(id),
    queryFn: async () => {
      const response = await modulesService.getById(id);
      if (response.success) return response.data;
      if (response.status == 404) return null;
      throw new Error(response.error);
    },
  });

  const moduleWithMeta: Module | null = data
    ? {
        ...data,
        ...(MODULES_CONFIG_MAPPING[data?.slug]
          ? MODULES_CONFIG_MAPPING[data?.slug]
          : ({
              icon: Bot,
              component: PlaceholderModule,
              featured: true,
            } as ModuleMapping)),
      }
    : null;
  const apiStatus: ApiStatus = isLoading
    ? "loading"
    : error
      ? "failed"
      : "connected";
  return {
    module: moduleWithMeta,
    error,
    isLoading,
    apiStatus,
  };
}

type ApiStatus = "loading" | "failed" | "connected";
