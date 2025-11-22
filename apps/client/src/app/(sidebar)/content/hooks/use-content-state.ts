import { contentService } from "@/components/content/content-service";
import { toast } from "@oppsys/ui";
import type { Content, ContentMetadata } from "../content-types";
import type { User } from "@/components/auth/auth-types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/components/tanstack-query/query-client";
import { unwrap } from "@oppsys/shared";
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
      unwrap(
        await contentService.toggleFavorite(contentId, isFavorite),
        "Erreur lors de la mise à jour"
      );
      updateContentMutation.mutate({ contentId, updates: { isFavorite } });
    },
    onError: () => toast.error("Erreur lors de la mise à jour des favoris."),
  });

  const deleteContentMutation = useMutation({
    mutationFn: async (params: { content: Content; user?: User }) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?"))
        return;
      unwrap(
        await contentService.deleteContent(params),
        "Erreur lors de la suppression"
      );
      removeContentMutation.mutate(params.content.id);
      toast.success("Contenu supprimé.");
    },
    onError: () => toast.error("Erreur lors de la suppression."),
  });

  const processDecisionMutation = useMutation({
    mutationFn: async ({
      content,
      user,
      approved,
      feedback,
      originalMetadata,
    }: {
      content: Content;
      user: User;
      approved: boolean;
      feedback?: string;
      originalMetadata?: ContentMetadata;
    }) => {
      const data = unwrap(
        await contentService.processContentDecision({
          contentId: content.id,
          user,
          approved,
          feedback,
          originalMetadata,
        })
      );

      if (approved) {
        updateContentMutation.mutate({
          contentId: content.id,
          updates: data.content,
        });
        toast.success("Article approuvé !", {
          description: "Publication en cours...",
        });
        return data;
      }

      await contentService.deleteContent({ content, user });
      deleteContentMutation.mutate({ content, user });
      toast.success("Article refusé et supprimé.");
      return data;
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
