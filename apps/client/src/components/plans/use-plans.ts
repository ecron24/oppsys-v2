import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../tanstack-query/query-client";
import { plansService } from "./plans-service";
import { Crown, Star, type LucideIcon } from "lucide-react";
import { unwrap } from "@oppsys/utils";

type PLAN_CONFIG = {
  color: string;
  buttonVariant?: "secondary" | "default";
  popular?: boolean;
  icon: LucideIcon | null;
  buttonClassName?: string;
};

const PLANS_CONFIG_MAPPING: Record<string, PLAN_CONFIG> = {
  Free: {
    color: "border-muted",
    buttonVariant: "secondary",
    popular: false,
    icon: null,
  },
  Solo: {
    color: "border-primary/20",
    buttonVariant: "default",
    popular: false,
    icon: null,
  },
  Standard: {
    color: "border-primary",
    buttonVariant: "default",
    popular: true,
    icon: Crown,
  },
  Premium: {
    color: "border-orange-300",
    buttonClassName:
      "bg-gradient-primary text-white hover:from-primary/90 hover:to-orange-600/90",
    popular: false,
    icon: Star,
  },
};

export function usePlans() {
  const { data, error, isLoading } = useQuery({
    queryKey: queryKeys.plans.list,
    queryFn: async () => {
      return unwrap(await plansService.getPlans());
    },
  });

  const plans =
    data?.map((plan) => {
      const metaConfig = PLANS_CONFIG_MAPPING[plan.name];
      return {
        ...plan,
        ...metaConfig,
      };
    }) || [];

  return { plans, error, isLoading };
}
