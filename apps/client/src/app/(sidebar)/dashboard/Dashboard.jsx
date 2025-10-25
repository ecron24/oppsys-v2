// src/pages/Dashboard.jsx - VERSION MODIFIÉE SANS LES CRÉDITS
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "../hooks/useAuth";
import apiService from "../services/apiService";
import {
  Sparkles,
  FileText,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  Plus,
  Calendar,
  Target,
  Share2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { supabaseRPC } from "@/lib/supabase";

const useDashboardOverview = (period = "month") => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get(`/dashboard/overview`, { period });
      if (response && response.success) {
        setData(response.data);
      } else {
        throw new Error(
          response?.error || "API returned unsuccessful response"
        );
      }
      const a = await supabaseRPC.getDashboardOverview(
        "45377f20-8b85-42a1-b7c6-fb93491ec386"
      );
      console.log("a", a);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboardData();
  }, [period]);
  return { data, loading, error, refetch: fetchDashboardData };
};

const usePerformanceStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformanceStats = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiService.get("/dashboard/content-stats");

        if (response && response.success) {
          setStats(response.data);
        } else {
          throw new Error(
            response?.error || "Erreur de chargement des statistiques"
          );
        }
      } catch (err) {
        setError(err.message);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceStats();
  }, []);

  return { stats, loading, error };
};

const useModulesStats = (period = "month") => {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchModulesStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.get(`/dashboard/modules-stats`, {
          period,
        });
        if (response && response.success && response.data) {
          const moduleStats = response.data.map((stat) => ({
            name: stat.module_name,
            slug: stat.module_slug,
            uses: stat.total_usage || 0,
            credits: stat.total_credits_used || 0,
            success_rate: stat.success_rate || 0,
            cost: stat.credit_cost || 0,
          }));
          setModules(moduleStats);
        } else {
          setModules([]);
        }
      } catch (err) {
        setError(err.message);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchModulesStats();
  }, [period]);
  return { modules, loading, error };
};

const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  if (diffInMinutes < 1) return "À l'instant";
  if (diffInMinutes < 60)
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""}`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24)
    return `il y a ${diffInHours} heure${diffInHours > 1 ? "s" : ""}`;
  const diffInDays = Math.floor(diffInMinutes / 1440);
  return `il y a ${diffInDays} jour${diffInDays > 1 ? "s" : ""}`;
};

const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-muted rounded w-2/3"></div>
          </div>
          <div className="w-12 h-12 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-sm text-destructive mt-2">Erreur API</p>
            <p className="text-xs text-destructive/80 mt-1">{error}</p>
          </div>
          <div className="bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground mt-2">
            {value}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="bg-gradient-to-br from-primary to-orange-600 p-3 rounded-lg">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {trend && (
        <div
          className={`flex items-center mt-4 text-sm ${
            trend.isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          <TrendingUp
            className={`h-4 w-4 mr-1 ${trend.isPositive ? "" : "rotate-180"}`}
          />
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
};

const PerformanceStats = () => {
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
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Performances
        </h3>
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">Erreur: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          Performances de contenu
        </h3>
        <Link
          to="/content"
          className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
        >
          Voir tout
        </Link>
      </div>

      {stats && stats.total_content > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total contenu généré
            </span>
            <span className="font-medium text-card-foreground">
              {stats.total_content}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Contenu favori
            </span>
            <span className="font-medium text-card-foreground">
              {stats.favorites_count}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Activité récente (7j)
            </span>
            <span className="font-medium text-card-foreground">
              {stats.recent_count}
            </span>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {stats.last_content_date
                ? `Dernière création: ${formatTimeAgo(stats.last_content_date)}`
                : "Commencez à créer du contenu pour voir vos statistiques"}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucun contenu généré</p>
          <p className="text-xs text-muted-foreground mt-1">
            Vos statistiques apparaîtront ici après vos premières créations.
          </p>
          <Link
            to="/modules"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Créer du contenu
          </Link>
        </div>
      )}
    </div>
  );
};

const FavoriteModules = () => {
  const { modules, loading, error } = useModulesStats("month");
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
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <h3 className="text-lg font-semibold text-card-foreground mb-2">
          Modules les plus utilisés
        </h3>
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span className="text-sm">Erreur de chargement: {error}</span>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">
          {modules.length > 0
            ? "Modules les plus utilisés"
            : "Modules disponibles"}
        </h3>
        <Link
          to="/modules"
          className="text-primary hover:text-primary/80 text-sm font-medium flex items-center space-x-1 transition-colors"
        >
          <span>Voir tout</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
      {modules.length === 0 ? (
        <div className="text-center py-8">
          <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Aucun module utilisé ce mois-ci
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Vos modules les plus utilisés apparaîtront ici.
          </p>
          <Link
            to="/modules"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Sparkles className="h-4 w-4" />
            Explorer les modules
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {modules.slice(0, 4).map((module, index) => (
            <Link
              key={module.slug || index}
              to={`/modules/${module.slug}`}
              className="p-4 border border-border rounded-lg hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="bg-gradient-to-r from-primary to-orange-600 p-2 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                  {module.cost} crédits
                </span>
              </div>
              <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                {module.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {module.uses} utilisations ({module.credits} crédits)
              </p>
              {module.success_rate > 0 && (
                <div className="mt-2 flex items-center space-x-2">
                  <div className="flex-1 bg-muted rounded-full h-1">
                    <div
                      className="bg-green-500 h-1 rounded-full transition-all"
                      style={{ width: `${module.success_rate}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {module.success_rate}%
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const permissions = usePremiumFeatures();
  const dashboardOverview = useDashboardOverview("month");
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await dashboardOverview.refetch();
    } catch (error) {
      console.error("Erreur refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const profile = dashboardOverview.data?.profile || {};
  const periodUsage = dashboardOverview.data?.period_usage || {};
  const content = dashboardOverview.data?.content || {};
  const planName = profile.plan_name || "Free";

  // Stats sans les crédits - seulement modules utilisés et contenu généré
  const stats = [
    {
      title: "Modules utilisés",
      value: periodUsage.total_usage || 0,
      icon: Sparkles,
      description: "Exécutions",
      isLoading: dashboardOverview.loading,
      error: dashboardOverview.error,
      trend: periodUsage.success_rate
        ? {
            value: `${periodUsage.success_rate}% de succès`,
            isPositive: periodUsage.success_rate > 80,
          }
        : null,
    },
    {
      title: "Contenu généré",
      value: content.total_generated || 0,
      icon: FileText,
      description: "Articles",
      isLoading: dashboardOverview.loading,
      error: dashboardOverview.error,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {`Bienvenue, ${user?.full_name?.split(" ")[0] || "Utilisateur"}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {periodUsage.total_usage > 0
              ? `Vous avez utilisé ${periodUsage.total_usage} modules ce mois-ci.`
              : "Commencez à explorer vos modules."}
          </p>
          {planName && (
            <div className="mt-2">
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                Plan {planName}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span>Actualiser</span>
          </button>
          <Link
            to="/modules"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau module</span>
          </Link>
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
                {dashboardOverview.error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Grid des statistiques - maintenant avec seulement 2 colonnes au lieu de 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FavoriteModules />
          <PerformanceStats />
        </div>

        <div className="space-y-6">
          {/* Card "Actions rapides" */}
          <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">
                Actions rapides
              </h3>
              <Plus className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  title: "Créer un article",
                  description:
                    "Générez un article optimisé SEO en quelques clics.",
                  icon: FileText,
                  href: "/modules",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  title: "Publier sur réseaux",
                  description: "Créez et planifiez vos posts sociaux.",
                  icon: Share2,
                  href: "/modules",
                  color: "from-purple-500 to-purple-600",
                },
                {
                  title: "Analyser le SEO",
                  description:
                    "Obtenez un rapport SEO détaillé pour votre site.",
                  icon: BarChart3,
                  href: "/modules",
                  color: "from-green-500 to-green-600",
                },
                {
                  title: "Générer une image",
                  description: "Créez une image unique avec l'IA.",
                  icon: Sparkles,
                  href: "/modules",
                  color: "from-orange-500 to-orange-600",
                },
                {
                  title: "Calendrier de publication",
                  description: "Planifiez visuellement vos posts.",
                  icon: Calendar,
                  href: "/calendar",
                  color: "from-amber-500 to-amber-600",
                  premiumOnly: true,
                  badge: (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                      Premium
                    </span>
                  ),
                },
              ].map((action, index) => {
                if (action.premiumOnly && !permissions.isPremium) {
                  return null;
                }

                return (
                  <Link
                    key={index}
                    to={action.href}
                    className="flex items-center p-3 border border-border rounded-lg hover:border-primary/50 hover:shadow-sm transition-all group"
                  >
                    <div
                      className={`bg-gradient-to-r ${action.color} p-2 rounded-lg mr-3`}
                    >
                      <action.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                          {action.title}
                        </h4>
                        {action.badge && action.badge}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Card des statistiques générales */}
          {(content.total_generated > 0 ||
            periodUsage.total_usage > 0 ||
            periodUsage.success_rate > 0) && (
            <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground">
                  Statistiques
                </h3>
                <Target className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-5">
                {content.total_generated > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Contenu généré
                      </span>
                      <span className="font-medium text-card-foreground">
                        {content.total_generated}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((content.total_generated / 10) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {periodUsage.total_usage > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Modules utilisés
                      </span>
                      <span className="font-medium text-card-foreground">
                        {periodUsage.total_usage}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min((periodUsage.total_usage / 15) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
                {periodUsage.success_rate > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Taux de succès
                      </span>
                      <span className="font-medium text-card-foreground">
                        {periodUsage.success_rate}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${periodUsage.success_rate}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
