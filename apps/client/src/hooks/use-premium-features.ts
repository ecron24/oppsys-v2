import { queryKeys } from "@/components/tanstack-query/query-client";
import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import { useQuery } from "@tanstack/react-query";

export function usePremiumFeatures() {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.user.permissions,
    queryFn: async () =>
      handleApiCall(await honoClient.api.users.permissions.$get()),
  });

  return { data, isLoading };
}
