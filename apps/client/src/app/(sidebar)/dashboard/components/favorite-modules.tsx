import { Link } from "react-router";
import { Sparkles, AlertCircle, ArrowUpRight } from "lucide-react";
import { useModulesStats } from "../hooks/use-modules-stats";
import { routes } from "@/routes";
import { Badge } from "@oppsys/ui";

export function FavoriteModules() {
  const { modulesStats, loading, error } = useModulesStats("month");

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
        <div className="h-6 bg-muted rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="p-4 border border-border rounded-lg animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-muted rounded-lg"></div>
                <div className="w-16 h-6 bg-muted rounded-full"></div>
              </div>
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-card-foreground rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Modules les plus utilisés
        </h3>
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">Erreur de chargement: {error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          {modulesStats.length > 0
            ? "Modules les plus utilisés"
            : "Modules disponibles"}
        </h3>
        <Link
          to={routes.modules.index()}
          className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1 transition-colors"
        >
          <span>Voir tout</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {modulesStats.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Aucun module utilisé ce mois-ci
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Vos modules les plus utilisés apparaîtront ici.
          </p>
          <Link
            to={routes.modules.index()}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-primary rounded-lg shadow-xd hover:shadow-sm transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Explorer les modules
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modulesStats.slice(0, 4).map((module, index) => (
            <Link
              key={module.slug || index}
              to={routes.modules.id(module.slug)}
              className="p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gradient-primary p-2 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <Badge variant={"primary-outline"}>{module.cost} crédits</Badge>
              </div>
              <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                {module.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {module.uses} utilisations ({module.credits} crédits)
              </p>
              {module.successRate > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all"
                      style={{ width: `${module.successRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {module.successRate}%
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
