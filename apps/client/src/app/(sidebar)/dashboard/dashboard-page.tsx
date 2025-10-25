import { useState } from "react";
import { Sparkles, FileText, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { WithHeader } from "../_components/with-header";
import { useAuth } from "@/components/auth/hooks/use-auth";
import { useDashboardOverview } from "./hooks/use-dashboard-overview";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { StatsCard } from "./components/stats-card";
import { PerformanceStats } from "./components/performance-stats";
import { FavoriteModules } from "./components/favorite-modules";
import { QuickActions } from "./components/quick-actions";
import { GeneralStats } from "./components/general-stats";
import { LinkButton } from "@/components/link-button";
import { Badge, Button } from "@oppsys/ui";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: permissions } = usePremiumFeatures();
  const dashboardOverview = useDashboardOverview("month");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await dashboardOverview.refetch();
    setRefreshing(false);
  };

  const planName = dashboardOverview.data?.profile.planName || "Free";

  const stats = [
    {
      title: "Modules utilisés",
      value: dashboardOverview.data?.periodUsage.totalUsage || 0,
      icon: Sparkles,
      description: "Exécutions",
      isLoading: dashboardOverview.loading,
      error: dashboardOverview.error?.message ?? null,
      trend: dashboardOverview.data?.periodUsage.successRate
        ? {
            value: `${dashboardOverview.data?.periodUsage.successRate}% de succès`,
            isPositive: dashboardOverview.data?.periodUsage.successRate > 80,
          }
        : null,
    },
    {
      title: "Contenu généré",
      value: dashboardOverview.data?.content.totalGenerated || 0,
      icon: FileText,
      description: "Articles",
      isLoading: dashboardOverview.loading,
      error: dashboardOverview.error?.message ?? null,
    },
  ];

  return (
    <WithHeader title="Tableau de bord">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {`Bienvenue, ${user?.fullName?.split(" ")[0] || "Utilisateur"}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {dashboardOverview.data?.periodUsage.totalUsage &&
              dashboardOverview.data?.periodUsage.totalUsage > 0
                ? `Vous avez utilisé ${dashboardOverview.data?.periodUsage.totalUsage} modules ce mois-ci.`
                : "Commencez à explorer vos modules."}
            </p>
            {planName && (
              <div className="mt-2">
                <Badge variant={"primary-outline"}>Plan {planName}</Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant={"muted"}
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>Actualiser</span>
            </Button>

            <LinkButton
              to="/modules"
              className=" text-white bg-gradient-primary"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau module</span>
            </LinkButton>
          </div>
        </div>

        {dashboardOverview.error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-destructive mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-destructive">
                  Erreur de connexion API
                </h4>
                <p className="text-sm text-destructive/80 mt-1">
                  {dashboardOverview.error.message}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {stats.map((stat, index) => (
            <StatsCard key={index} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FavoriteModules />
            <PerformanceStats />
          </div>

          <div className="space-y-6">
            <QuickActions isPremium={permissions?.isPremium || false} />
            {dashboardOverview.data && (
              <GeneralStats
                content={dashboardOverview.data?.content}
                periodUsage={dashboardOverview.data?.periodUsage}
              />
            )}
          </div>
        </div>
      </div>
    </WithHeader>
  );
}
