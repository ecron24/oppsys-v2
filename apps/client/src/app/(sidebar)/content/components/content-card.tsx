import {
  Heart,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { Content } from "../types";
import { Badge, Button, H4, P } from "@oppsys/ui";
import { Card } from "@oppsys/ui/components/card";
import { CONTENT_TYPES } from "../utils/constants";
import type { JSX } from "react";

export const ContentCard = ({
  content,
  onView,
  onDelete,
  onToggleFavorite,
  onSchedule,
  showScheduleButton = false,
}: ContentCardProps) => {
  const typeConfig =
    CONTENT_TYPES.find((t) => t.id === content.type) || CONTENT_TYPES[0];
  const Icon = typeConfig.icon;

  return (
    <Card className="hover:shadow-md group flex flex-col justify-between">
      <div className="p-4">
        <div className="flex items-start justify-between space-x-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-3 rounded-lg bg-muted flex-shrink-0">
              <Icon className={`h-6 w-6 ${typeConfig.color}`} />
            </div>

            <div className="min-w-0">
              <H4 className="font-semibold text-card-foreground group-hover:text-primary truncate">
                {content.title}
              </H4>
              <P className="text-sm text-muted-foreground truncate">
                {content.moduleSlug || "Inconnu"}
              </P>

              <div className="mt-2">
                {content.status && BadgeMapping[content.status]}
              </div>

              {/* {content.scheduled_at && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Planifié pour le{" "}
                    {new Date(content.scheduled_at).toLocaleDateString()}
                  </span>
                </p>
              )} */}
            </div>
          </div>

          <Button
            onClick={() => onToggleFavorite(content.id, !content.isFavorite)}
            variant={"ghost"}
            className={`rounded-full ${
              content.isFavorite ? "text-red-500" : "text-muted-foreground"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${content.isFavorite ? "fill-current" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4 flex space-x-2">
        <Button
          variant={"default"}
          onClick={() => onView(content)}
          className="flex-1"
        >
          Voir
        </Button>

        {showScheduleButton && onSchedule && (
          <Button onClick={() => onSchedule(content)} variant={"secondary"}>
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Planifier</span>
          </Button>
        )}

        <Button onClick={() => onDelete(content.id)} variant={"destructive"}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
};

type ContentCardProps = {
  content: Content;
  onView: (content: Content) => void;
  onDelete: (contentId: string) => void;
  onToggleFavorite: (contentId: string, isFavorite: boolean) => void;
  onSchedule?: (content: Content) => void;
  showScheduleButton?: boolean;
};

const BadgeMapping: Record<string, JSX.Element> = {
  published: (
    <Badge variant={"success"}>
      <CheckCircle className="h-3 w-3 mr-1" />
      Publié
    </Badge>
  ),
  scheluded: (
    <Badge variant={"info"}>
      <Clock className="h-3 w-3 mr-1" />
      Planifié
    </Badge>
  ),
  pending: (
    <Badge variant={"warning"}>
      <AlertTriangle className="h-3 w-3 mr-1" />
      En attente
    </Badge>
  ),
};
