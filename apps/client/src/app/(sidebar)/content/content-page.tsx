import { useState, useEffect, useMemo } from "react";
import { toast, Button, Input, P, H2, H3 } from "@oppsys/ui";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useAuth } from "@/components/auth/hooks/use-auth";
import { Search, Folder, Plus, XCircle } from "lucide-react";
import { CONTENT_TYPES } from "./utils/constants";
import { getCorrectModuleSlug } from "./utils/content-utils";
import { useContentState } from "./hooks/use-content-state";
import { useRealtimeSubscription } from "./hooks/use-realtime-subscription";
import { useScheduleContent } from "./hooks/use-schedule-content";
import { ContentCard } from "./components/content-card";
import { RecentActivityHorizontal } from "./components/recent-activity-horizontal";
import { PaginationControls } from "./components/pagination-controls";
import { SchedulingDialog } from "./components/scheduling-dialog";
import type { Content, ContentMetadata } from "./types";
import { WithHeader } from "../_components/with-header";
import { LinkButton } from "@/components/link-button";
import { routes } from "@/routes";
import { DialogViewContent } from "./components/dialog-view-content";
import { Card, CardContent } from "@oppsys/ui/components/card";

export default function ContentPage() {
  {
    const { user } = useAuth();
    const {
      contents,
      error,
      refetch: fetchContent,
      updateContentMutation,
      deleteContentMutation,
      toggleFavoriteMutation,
      processDecisionMutation,
    } = useContentState(user);
    const { handleScheduleContent } = useScheduleContent();
    const permissions = usePremiumFeatures();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);
    const [selectedContent, setSelectedContent] = useState<Content | null>(
      null
    );
    const [approvalLoading, setApprovalLoading] = useState(false);
    const [schedulingContent, setSchedulingContent] = useState<Content | null>(
      null
    );
    const [processingDecisions, setProcessingDecisions] = useState(
      new Set<string>()
    );

    useRealtimeSubscription(user, (contentId, updates) =>
      updateContentMutation.mutate({ contentId, updates })
    );

    useEffect(() => {
      if (user?.id) fetchContent();
    }, [user?.id, fetchContent]);

    useEffect(() => {
      setCurrentPage(1);
    }, [searchTerm, selectedType]);

    const handleUserDecision = async (
      contentId: string,
      isApproved: boolean
    ) => {
      if (processingDecisions.has(contentId)) {
        toast.warning("Une action est déjà en cours sur ce contenu");
        return;
      }
      setProcessingDecisions((prev) => new Set([...prev, contentId]));
      setApprovalLoading(true);

      const content = contents.find((c) => c.id === contentId);
      if (!content) {
        toast.error("Contenu non trouvé");
        return;
      }

      const enrichedMetadata = {
        ...(content.metadata || {}),
        userId: content.userId,
        clientEmail: user?.email ?? "",
        clientName: user?.fullName,
        clientId: user?.id,
        planId: user?.planId,
        title: content.title,
        type: content.type,
        moduleSlug: content.moduleSlug,
        decision_timestamp: new Date().toISOString(),
        approvedBy: user?.id,
        originalStatus: content.status,
      } as ContentMetadata;

      await processDecisionMutation.mutateAsync({
        contentId,
        userId: user?.id || "",
        approved: isApproved,
        feedback: isApproved
          ? "Approuvé par l'utilisateur"
          : "Refusé par l'utilisateur",
        originalMetadata: enrichedMetadata,
      });
      setApprovalLoading(false);
      setProcessingDecisions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    };

    const handleScheduleContentWrapper = async (
      contentId: string,
      executionTime: string
    ) => {
      const content = contents.find((c) => c.id === contentId);
      if (!content) {
        toast.error("Contenu non trouvé");
        return;
      }

      const result = await handleScheduleContent({ executionTime, content });
      if (!result.success) return;
      updateContentMutation.mutate({ contentId, updates: result.data });
    };

    const filteredAndSortedContent = useMemo(() => {
      if (!contents) return [];
      return contents
        .filter((content) => {
          const matchesSearch = content.title
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase());
          const matchesType =
            selectedType === "all" || content.type === selectedType;
          return matchesSearch && matchesType;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [contents, searchTerm, selectedType]);

    const pageCount = Math.ceil(filteredAndSortedContent.length / itemsPerPage);
    const paginatedContent = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredAndSortedContent.slice(
        startIndex,
        startIndex + itemsPerPage
      );
    }, [currentPage, filteredAndSortedContent, itemsPerPage]);

    if (error) {
      return (
        <div className="text-center py-12">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <H3 className="text-lg font-medium">Erreur de chargement</H3>
          <P className="text-muted-foreground mb-4">{error}</P>
          <Button onClick={() => fetchContent()} variant={"default"}>
            Réessayer
          </Button>
        </div>
      );
    }

    return (
      <WithHeader title="Contenu">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <H2 className="md:text-3xl text-foreground">Mon Contenu</H2>

              <P className="text-muted-foreground mt-2">
                Gérez tout le contenu que vous avez généré.
              </P>
            </div>
            <LinkButton
              to={routes.modules.index()}
              className="bg-gradient-primary"
            >
              <Plus />
              <span>Créer</span>
            </LinkButton>
          </div>

          <RecentActivityHorizontal />

          <Card className="">
            <CardContent className="flex space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Rechercher par titre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="form-input"
              >
                {CONTENT_TYPES.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </CardContent>
          </Card>

          {paginatedContent.length === 0 ? (
            <div className="text-center py-12">
              <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">Aucun contenu trouvé</h3>
              <p className="text-muted-foreground mb-4">
                Créez du contenu depuis la page des modules.
              </p>
              <LinkButton
                to={routes.modules.index()}
                className="bg-gradient-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Commencer à créer
              </LinkButton>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedContent.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onView={setSelectedContent}
                    onDelete={deleteContentMutation.mutate}
                    onToggleFavorite={(contentId, isFavorite) =>
                      toggleFavoriteMutation.mutate({ contentId, isFavorite })
                    }
                    onSchedule={setSchedulingContent}
                    showScheduleButton={
                      permissions.data?.scheduling.canSchedule &&
                      content.moduleSlug === "social-factory"
                    }
                  />
                ))}
              </div>
              <PaginationControls
                currentPage={currentPage}
                pageCount={pageCount}
                setCurrentPage={setCurrentPage}
              />
            </>
          )}

          {selectedContent && (
            <DialogViewContent
              content={selectedContent}
              user={user}
              approvalLoading={approvalLoading}
              onClose={() => setSelectedContent(null)}
              onDenyAndDelete={() =>
                handleUserDecision(selectedContent.id, false)
              }
              canSchedule={
                getCorrectModuleSlug(selectedContent) === "social-factory" &&
                permissions.data?.scheduling.canSchedule
              }
              onDelete={() => deleteContentMutation.mutate(selectedContent.id)}
              onSchelude={() => {
                setSchedulingContent(selectedContent);
                setSelectedContent(null);
              }}
              onApproveAndPublish={async () => {
                setApprovalLoading(true);

                if (selectedContent.status === "pending") {
                  const enrichedMetadata: ContentMetadata = {
                    ...(selectedContent.metadata || {}),
                    userId: selectedContent.userId,
                    clientEmail: user?.email ?? "",
                    clientName: user?.fullName ?? "",
                    clientId: user?.id ?? null,
                    planId: user?.planId ?? null,
                    title: selectedContent.title,
                    type: selectedContent.type,
                    targetModuleSlug: selectedContent.moduleSlug,
                    decisionTimestamp: new Date().toISOString(),
                    approvedBy: user?.id ?? null,
                    originalStatus: selectedContent.status,
                  };

                  processDecisionMutation.mutateAsync({
                    contentId: selectedContent.id,
                    userId: user?.id || "",
                    approved: true,
                    feedback: "Approuvé et publié par l'utilisateur",
                    originalMetadata: enrichedMetadata,
                  });
                }

                setSelectedContent(null);
                setApprovalLoading(false);

                // FIXME: it doesn't exist
                // const response = await honoClient.api.content[":id"][
                //   "publish"
                // ].$post({
                //   param: { id: selectedContent.id },
                // });

                // if (response.ok) {
                //   updateContent(selectedContent.id, {
                //     status: "publishing",
                //   });
                //   toast.success(
                //     "Contenu approuvé et publication en cours sur les réseaux sociaux..."
                //   );
                //   setSelectedContent(null);
                //   return;
                // }
                // throw new Error("Erreur de publication");
              }}
            />
          )}

          <SchedulingDialog
            isOpen={!!schedulingContent}
            onClose={() => setSchedulingContent(null)}
            content={schedulingContent}
            onSchedule={handleScheduleContentWrapper}
          />
        </div>
      </WithHeader>
    );
  }
}
