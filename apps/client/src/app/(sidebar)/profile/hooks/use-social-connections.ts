import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@oppsys/ui";
import { socialService } from "../services/social-service";
import type { Platform } from "../profile-types";
import { queryKeys } from "@/components/tanstack-query/query-client";

export const useSocialConnections = () => {
  const queryClient = useQueryClient();

  const {
    data: connections = [],
    isLoading: connectionsLoading,
    refetch: refetchConnections,
  } = useQuery({
    queryKey: queryKeys.social.socialConnections,
    queryFn: () => socialService.getConnections(),
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.social.socialStats,
    queryFn: () => socialService.getStats(),
  });

  const connectMutation = useMutation({
    mutationFn: async (platform: Platform) => {
      const authUrl = await socialService.initAuth(platform);

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
