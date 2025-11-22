import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "@oppsys/ui";
import { socialService } from "@/components/social/service/social-service";
import {
  queryClient,
  queryKeys,
} from "@/components/tanstack-query/query-client";
import type { Platform } from "@/components/social/social-types";
import { unwrap } from "@oppsys/utils";

export const useSocialConnections = () => {
  const {
    data: connections = [],
    isLoading: connectionsLoading,
    refetch: refetchConnections,
  } = useQuery({
    queryKey: queryKeys.social.socialConnections,
    queryFn: async () => unwrap(await socialService.getConnections()),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.social.socialStats,
    queryFn: async () => unwrap(await socialService.getStats()),
  });

  const connectMutation = useMutation({
    mutationFn: async (platform: Platform) => {
      const { authUrl } = unwrap(await socialService.initAuth(platform));

      // Open popup OAuth
      const popup = window.open(
        authUrl,
        "social-auth",
        "width=600,height=600,scrollbars=yes,resizable=yes"
      );

      return new Promise<void>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "SOCIAL_AUTH_SUCCESS") {
            popup?.close();
            toast.success(`${platform} connecté avec succès !`);
            queryClient.invalidateQueries({
              queryKey: queryKeys.social.socialConnections,
            });
            queryClient.invalidateQueries({
              queryKey: queryKeys.social.socialStats,
            });
            window.removeEventListener("message", messageHandler);
            resolve();
          } else if (event.data.type === "SOCIAL_AUTH_ERROR") {
            popup?.close();
            toast.error(`Erreur de connexion à ${platform}`);
            window.removeEventListener("message", messageHandler);
            reject(new Error(event.data.error || "Erreur OAuth"));
          }
        };

        window.addEventListener("message", messageHandler);

        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            window.removeEventListener("message", messageHandler);
            clearInterval(checkClosed);
          }
        }, 1000);
      });
    },
    onError(_, variables) {
      toast.error(`Impossible de connecter ${variables}`);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (platform: Platform) => {
      await socialService.disconnect(platform);
      toast.success(`${platform} déconnecté`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.socialConnections,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.social.socialStats });
    },
    onError: () => {
      toast.error("Erreur lors de la déconnexion");
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async (platform: Platform) => {
      await socialService.refreshToken(platform);
      toast.success(`Token ${platform} actualisé`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.social.socialConnections,
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.social.socialStats });
    },
    onError: () => {
      toast.error("Erreur lors de l'actualisation");
    },
  });

  return {
    connections,
    stats,
    isLoading: connectionsLoading || statsLoading,
    connect: connectMutation.mutate,
    connectMutation,
    disconnect: disconnectMutation.mutate,
    refresh: refreshMutation.mutate,
    refetchConnections,
  };
};
