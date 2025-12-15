import { useState, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { modulesService } from "@/components/modules/service/modules-service";
import { toast } from "@oppsys/ui/lib/sonner";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@oppsys/ui/components/dialog";
import { Button } from "@oppsys/ui/components/button";
import { H2, H3, P } from "@oppsys/ui/components/typography";
import ScheduledPostsList from "./scheduled-posts-list";
import {
  Calendar as CalendarIcon,
  Trash2,
  Send,
  Clock,
  Filter,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  List,
} from "lucide-react";
import { unwrap } from "@oppsys/shared";
import type {
  CalendarEvent,
  UserTask,
} from "@/components/schelude/schelude-types";
import { scheludeService } from "@/components/schelude/schelude-service";
import { LinkButton } from "@/components/link-button";
import { routes } from "@/routes";
import { PageLoader } from "@/components/loading";

const localizer = momentLocalizer(moment);

type ViewType = "month" | "week" | "day" | "agenda" | "list";

type FilterType = "all" | "linkedin" | "twitter" | "facebook" | "instagram";

// Icônes pour les réseaux sociaux
const SocialIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
} as const;

// Couleurs pour les réseaux sociaux
const SocialColors = {
  linkedin: "#0077b5",
  twitter: "#1da1f2",
  facebook: "#4267B2",
  instagram: "#E4405F",
} as const;

export default function CalendarPage() {
  const permissions = usePremiumFeatures();
  const [selectedEvent, setSelectedEvent] = useState<UserTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [view, setView] = useState<ViewType>("month");
  const [filter, setFilter] = useState<FilterType>("all");

  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["scheduledTasks"],
    queryFn: async () => {
      const response = unwrap(await scheludeService.getUserTasks());
      return response;
    },
    enabled: permissions.data?.isPremium,
  });

  const events: CalendarEvent[] = useMemo(() => {
    if (!tasks) return [];
    return tasks.map((task) => {
      // Extraire le réseau social à partir du module_slug
      const socialPlatform = Object.keys(SocialColors).find((platform) =>
        task.modules?.slug?.includes(platform)
      ) as keyof typeof SocialColors | undefined;

      // Utiliser le titre du contenu généré si disponible
      const title =
        task.generatedContent?.title || `Post ${task.modules?.slug}`;

      return {
        id: task.id,
        title,
        start: new Date(task.executionTime),
        end: new Date(task.executionTime),
        allDay: false,
        resource: task,
        color: socialPlatform ? SocialColors[socialPlatform] : "#888",
      };
    });
  }, [tasks]);

  // Filtrer les événements par réseau social
  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.resource.modules?.slug?.includes(filter);
  });

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event.resource);
    setIsModalOpen(true);
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheludeService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledTasks"] });
      toast.success("Post supprimé");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const handleDeleteTask = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.id);
    }
  };

  const publishMutation = useMutation({
    mutationFn: ({
      moduleSlug,
      payload,
    }: {
      moduleSlug: string;
      payload: unknown;
    }) =>
      modulesService.executeModule(moduleSlug, {
        context: payload as Record<string, unknown>,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledTasks"] });
      toast.success("Publication en cours...");
      setIsModalOpen(false);
    },
    onError: () => {
      toast.error("Erreur lors de la publication");
    },
  });

  const handlePublishNow = () => {
    if (selectedEvent) {
      publishMutation.mutate({
        moduleSlug: selectedEvent.modules?.slug || "",
        payload: selectedEvent.payload,
      });
    }
  };

  // Style pour les événements en fonction du réseau social
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    };
  };

  if (!permissions.data?.isPremium) {
    return (
      <div className="text-center py-12 px-4">
        <CalendarIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <H3 className="text-xl font-semibold mb-2">Fonctionnalité Premium</H3>
        <P className="text-muted-foreground mb-4">
          Le calendrier de planification est réservé aux abonnés Premium
        </P>
        <LinkButton to={routes.billing.index()} className="bg-gradient-primary">
          <CalendarIcon className="h-4 w-4" />
          Passer à Premium
        </LinkButton>
      </div>
    );
  }

  if (isLoading) return <PageLoader text="Chargement du calendrier..." />;

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <H2 className="text-2xl font-bold">Calendrier de publication</H2>
        <div className="flex items-center gap-3">
          {/* Filtre par réseau social */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="form-input text-sm"
            >
              <option value="all">Tous les réseaux</option>
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          <Button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["scheduledTasks"] })
            }
          >
            <CalendarIcon className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Sélecteur de vue avec le bouton Liste */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant={view === "month" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("month")}
        >
          Mois
        </Button>
        <Button
          variant={view === "week" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("week")}
        >
          Semaine
        </Button>
        <Button
          variant={view === "day" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("day")}
        >
          Jour
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
        >
          <List className="h-4 w-4 mr-1" />
          Liste
        </Button>
      </div>

      {/* Condition pour afficher la vue liste ou le calendrier */}
      {view === "list" ? (
        <ScheduledPostsList
          events={filteredEvents}
          onSelectEvent={handleSelectEvent}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-4">
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectEvent={handleSelectEvent}
            selectable
            popup
            view={view}
            onView={(newView) => setView(newView as ViewType)}
            eventPropGetter={eventStyleGetter}
            components={
              {
                //   eventWrapper: (children) => {
                //     return (
                //       <div className="relative">
                //         {children.}
                //         {event.resource.status === "scheduled" && (
                //           <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></div>
                //         )}
                //         {event.resource.status === "running" && (
                //           <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                //         )}
                //       </div>
                //     );
                //   },
              }
            }
          />
        </div>
      )}

      {/* Modale de détails */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <h3 className="text-lg font-semibold">
              {selectedEvent?.generatedContent?.title || "Détails du post"}
            </h3>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                {moment(selectedEvent.executionTime).format("LLL")}
              </div>

              {/* Afficher l'icône du réseau social */}
              <div className="flex items-center gap-2">
                {(() => {
                  const socialPlatform = Object.keys(SocialIcons).find(
                    (platform) =>
                      selectedEvent.modules?.slug?.includes(platform)
                  );
                  const Icon = socialPlatform
                    ? SocialIcons[socialPlatform as keyof typeof SocialIcons]
                    : CalendarIcon;
                  return <Icon className="h-5 w-5" />;
                })()}
                <span className="text-sm font-medium">
                  {selectedEvent.modules?.slug}
                </span>
              </div>

              {/* Afficher le contenu généré si disponible */}
              {selectedEvent.generatedContent ? (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">
                    {selectedEvent.generatedContent.title}
                  </h4>
                  {selectedEvent.generatedContent.htmlPreview ? (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: selectedEvent.generatedContent.htmlPreview,
                      }}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Aucun aperçu disponible
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    {selectedEvent.payload?.content?.toString() ||
                      "Aucun aperçu disponible"}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span>Status: {selectedEvent.status}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleDeleteTask}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
            <Button onClick={handlePublishNow}>
              <Send className="h-4 w-4 mr-2" />
              Publier maintenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
