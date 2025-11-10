import { contentService } from "../services/content-service";
import { toast } from "@oppsys/ui";
import type { Content, ContentMetadata } from "../types";
import type { User } from "@/components/auth/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/components/tanstack-query/query-client";
// import { mockContents } from "./mock-data";

export const useContentState = (user: User | null) => {
  const {
    data: contents = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Content[]>({
    queryKey: ["userContents", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const response = await contentService.getUserContent({ limit: "1000" });
      if (response.success) return response.data.data;
      throw new Error(response.error);
    },
  });

  const updateContentMutation = useMutation({
    mutationFn: async ({
      contentId,
      updates,
    }: {
      contentId: string;
      updates: Partial<Content>;
    }) => {
      queryClient.setQueryData<Content[]>(["userContents", user?.id], (old) =>
        old
          ? old.map((c) => (c.id === contentId ? { ...c, ...updates } : c))
          : []
      );
    },
  });

  const removeContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      queryClient.setQueryData<Content[]>(["userContents", user?.id], (old) =>
        old ? old.filter((c) => c.id !== contentId) : []
      );
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      contentId,
      isFavorite,
    }: {
      contentId: string;
      isFavorite: boolean;
    }) => {
      const result = await contentService.toggleFavorite(contentId, isFavorite);
      if (!result.success) throw new Error("Erreur lors de la mise à jour");
      updateContentMutation.mutate({ contentId, updates: { isFavorite } });
    },
    onError: () => toast.error("Erreur lors de la mise à jour des favoris."),
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (contentId: string) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?"))
        return;
      const result = await contentService.deleteContent(contentId);
      if (!result.success) throw new Error("Erreur lors de la suppression");
      removeContentMutation.mutate(contentId);
      toast.success("Contenu supprimé.");
    },
    onError: () => toast.error("Erreur lors de la suppression."),
  });

  const processDecisionMutation = useMutation({
    mutationFn: async ({
      contentId,
      userId,
      approved,
      feedback,
      originalMetadata,
    }: {
      contentId: string;
      userId: string;
      approved: boolean;
      feedback?: string;
      originalMetadata?: ContentMetadata;
    }) => {
      const result = await contentService.processContentDecision({
        contentId,
        userId,
        approved,
        feedback,
        originalMetadata,
      });

      if (!result.success) throw new Error(result.error);

      if (approved) {
        updateContentMutation.mutate({
          contentId,
          updates: result.data.content,
        });
        toast.success("Contenu approuvé ! Publication en cours.", {
          description: "Le workflow va reprendre automatiquement.",
        });
        return result;
      }

      await contentService.deleteContent(contentId);
      deleteContentMutation.mutate(contentId);
      toast.success("Contenu refusé et supprimé.");
      return result;
    },
    onError: (err) => {
      if (err.message.includes("Timeout") || err.message.includes("422")) {
        toast.error("Le processus prend plus de temps que prévu.", {
          description:
            "Votre contenu sera traité en arrière-plan. Vérifiez dans quelques minutes.",
        });
        return;
      }
      toast.error(`Une erreur est survenue: ${err.message}`);
    },
  });

  return {
    contents,
    loading: isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
    updateContentMutation,
    toggleFavoriteMutation,
    deleteContentMutation,
    processDecisionMutation,
  };
};
