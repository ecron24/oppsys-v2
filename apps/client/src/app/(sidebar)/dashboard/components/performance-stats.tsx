import { Link } from "react-router";
import { FileText, AlertCircle, Sparkles } from "lucide-react";
import { usePerformanceStats } from "../hooks/use-performance-stats";
import { formatTimeAgo } from "@/lib/date-humanizer";
import { LinkButton } from "@/components/link-button";
import { H3, P } from "@oppsys/ui";

export function PerformanceStats() {
  const { stats, loading, error } = usePerformanceStats();

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
        <div className="h-6 bg-muted rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between animate-pulse"
            >
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-card-foreground rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <H3 className="text-lg font-semibold text-card-foreground mb-2">
          Performances
        </H3>
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">Erreur: {error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <H3 className="text-lg font-semibold text-card-foreground">
          Performances de contenu
        </H3>
        <Link
          to="/content"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          Voir tout
        </Link>
      </div>

      {stats && stats.totalContent > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total contenu généré
            </span>
            <span className="font-medium text-card-foreground">
              {stats.totalContent}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Contenu favori
            </span>
            <span className="font-medium text-card-foreground">
              {stats.favoritesCount || 0}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Activité récente (7j)
            </span>
            <span className="font-medium text-card-foreground">
              {stats.recentCount || 0}
            </span>
          </div>

          <div className="pt-4 border-t border-border">
            <P className="text-xs text-muted-foreground">
              {stats.lastContentDate
                ? `Dernière création: ${formatTimeAgo(stats.lastContentDate)}`
                : "Commencez à créer du contenu pour voir vos statistiques"}
            </P>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <P className="text-sm text-muted-foreground">Aucun contenu généré</P>
          <P className="text-xs text-muted-foreground mt-1">
            Vos statistiques apparaîtront ici après vos premières créations.
          </P>
          <LinkButton to="/modules" className="bg-gradient-primary mt-3">
            <Sparkles className="h-4 w-4" />
            Créer du contenu
          </LinkButton>
        </div>
      )}
    </div>
  );
}
