import {
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  BarChart3,
  FileText,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { useRecentActivity } from "../../dashboard/hooks/use-recent-activity";
import type { Activity } from "../content-types";
import { formatTimeAgo } from "@/lib/date-humanizer";
import { H3, P } from "@oppsys/ui";
import { LinkButton } from "@/components/link-button";
import { routes } from "@/routes";

export const RecentActivityHorizontal = () => {
  const { activities, loading, error } = useRecentActivity(15);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-500" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatActivity = (activity: Activity) => {
    if (activity.type === "usage") {
      return {
        title: activity.moduleName || "Module",
        description: `${activity.creditsUsed || 0} crédits`,
        icon: activity.moduleType === "ai" ? Sparkles : BarChart3,
        status: activity.status,
      };
    }
    return {
      title: activity.title || "Contenu",
      description:
        activity.contentType === "social-post"
          ? "Post social"
          : activity.contentType || "Contenu",
      icon: FileText,
      status: "success",
    };
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <H3 className="text-lg font-semibold">Activité récente</H3>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 p-3 border border-border rounded-lg animate-pulse"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <H3 className="text-lg font-semibold">Activité récente</H3>
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Erreur de chargement: {error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <H3 className="text-lg font-semibold">Activité récente</H3>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <LinkButton to={routes.dashboard.index()} variant={"link"}>
            <span>Voir dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </LinkButton>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <P className="text-sm text-muted-foreground">
            Aucune activité récente
          </P>
          <P className="text-xs text-muted-foreground mt-1">
            Votre activité apparaîtra ici lorsque vous utiliserez les modules.
          </P>
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {activities.map((activity, index) => {
            const formattedActivity = formatActivity(activity);
            const Icon = formattedActivity.icon;
            return (
              <div
                key={activity.id || `activity-${index}`}
                className="flex-shrink-0 w-64 p-3 border border-border rounded-lg hover:border-primary/50 transition-all bg-background/50"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-primary p-2 rounded-lg">
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <P className="text-sm font-medium truncate mb-0">
                        {formattedActivity.title}
                      </P>
                      {getStatusIcon(formattedActivity.status)}
                    </div>
                    <P className="text-xs text-muted-foreground truncate">
                      {formattedActivity.description}
                    </P>
                    <P className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.date)}
                    </P>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
