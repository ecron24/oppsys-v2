import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Badge, Input, P, H2, H3, H4 } from "@oppsys/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@oppsys/ui";
import {
  Search,
  Filter,
  Star,
  Zap,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "@/components/auth/hooks/use-auth";
import {
  MODULES_CONFIG,
  MODULE_CATEGORIES,
  getFeaturedModules,
  searchModules,
} from "./modules-config";
import { CompactModuleCard } from "./_components/compact-module-card";
import { ViewToggle } from "./_components/view-toggle";
import { CategoryFilter } from "./_components/category-filter";
import { ModuleCard } from "./_components/module-card";
import type { ViewMode, TabValue } from "@/app/(sidebar)/modules/types";
import { routes } from "@/routes";
import { WithHeader } from "../_components/with-header";
import { LinkButton } from "@/components/link-button";

export default function ModulesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabValue>(
    searchParams.get("tab") === "formation" ? "formation" : "modules"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const actualBalance = user?.creditBalance || 0;

  useEffect(() => {
    const currentTab = searchParams.get("tab");
    setActiveTab(currentTab === "formation" ? "formation" : "modules");
  }, [searchParams]);

  const { iaModules, formationModules, iaCategories } = useMemo(() => {
    const allModules = Object.values(MODULES_CONFIG);
    const searched = searchTerm ? searchModules(searchTerm) : allModules;

    const iaFiltered = searched.filter((m) => m.category !== "formation");
    const formationFiltered = searched.filter(
      (m) => m.category === "formation"
    );

    const iaCats = [
      "all",
      ...Object.keys(MODULE_CATEGORIES).filter((cat) => cat !== "formation"),
    ];

    return {
      iaModules:
        selectedCategory === "all" || selectedCategory === "formation"
          ? iaFiltered
          : iaFiltered.filter((m) => m.category === selectedCategory),
      formationModules: formationFiltered,
      iaCategories: iaCats,
    };
  }, [searchTerm, selectedCategory]);

  const allFeaturedModules = useMemo(() => getFeaturedModules(), []);
  const featuredIaModules = useMemo(
    () => allFeaturedModules.filter((m) => m.category !== "formation"),
    [allFeaturedModules]
  );
  const featuredFormations = useMemo(
    () => allFeaturedModules.filter((m) => m.category === "formation"),
    [allFeaturedModules]
  );

  const handleModuleClick = (slug: string) => navigate(routes.modules.id(slug));

  const handleTabChange = (tabValue: string) => {
    const value = tabValue as TabValue;
    setActiveTab(value);
    setSelectedCategory("all");
    setSearchTerm("");
    setSearchParams(value === "modules" ? {} : { tab: value });
  };

  return (
    <WithHeader title="Modules">
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <H2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
              Catalogue & Formations
            </H2>

            <P className="text-muted-foreground mt-2">
              Découvrez nos modules d'intelligence artificielle et nos
              formations
            </P>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              <Zap className="h-3 w-3 mr-1" />
              {actualBalance} crédits disponibles
            </Badge>
            <LinkButton
              to={routes.billing.index()}
              variant="default-outline"
              size="sm"
            >
              Recharger
            </LinkButton>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="modules"
              className="flex items-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Modules IA ({iaModules.length})</span>
            </TabsTrigger>
            <TabsTrigger
              value="formation"
              className="flex items-center space-x-2"
            >
              <GraduationCap className="h-4 w-4" />
              <span>Formations ({formationModules.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 items-center">
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
                <CategoryFilter
                  categories={iaCategories}
                  selected={selectedCategory}
                  onChange={setSelectedCategory}
                />
              </div>
            </div>

            {selectedCategory === "all" &&
              searchTerm === "" &&
              featuredIaModules.length > 0 && (
                <div className="bg-gradient-to-r from-primary/5 to-orange-600/5 border border-primary/20 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <H3 className="text-lg font-semibold text-foreground mb-0">
                        Modules populaires
                      </H3>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {featuredIaModules.length} modules
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredIaModules.slice(0, 6).map((module) => (
                      <CompactModuleCard
                        key={module.id}
                        module={module}
                        onModuleClick={handleModuleClick}
                        currentBalance={actualBalance}
                      />
                    ))}
                  </div>
                </div>
              )}

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <H3 className="text-xl font-semibold text-foreground">
                    {searchTerm
                      ? `Résultats pour "${searchTerm}"`
                      : "Tous les modules"}
                  </H3>
                  <P className="text-sm text-muted-foreground mt-1">
                    {iaModules.length} module{iaModules.length !== 1 ? "s" : ""}
                    {selectedCategory !== "all"
                      ? ` dans ${MODULE_CATEGORIES[selectedCategory]?.name || ""}`
                      : " disponible"}
                    {iaModules.length !== 1 ? "s" : ""}
                  </P>
                </div>
              </div>

              <div id="all-modules">
                {iaModules.length === 0 ? (
                  <div className="card text-center py-12">
                    <div>
                      <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <H4 className="text-lg font-medium mb-2">
                        Aucun résultat
                      </H4>
                      <P className="text-muted-foreground">
                        Essayez de modifier vos critères de recherche
                      </P>
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }
                  >
                    {iaModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onModuleClick={handleModuleClick}
                        featured={module.featured}
                        viewMode={viewMode}
                        currentBalance={actualBalance}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="formation" className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une formation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 items-center">
                <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
              </div>
            </div>

            {searchTerm === "" && featuredFormations.length > 0 && (
              <div className="rounded-xl p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 dark:from-green-950 dark:to-blue-950 dark:border-green-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <H3 className="text-lg font-semibold text-foreground mb-0">
                      Formations populaires
                    </H3>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {featuredFormations.length} formations
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {featuredFormations.slice(0, 3).map((module) => (
                    <CompactModuleCard
                      key={module.id}
                      module={module}
                      onModuleClick={handleModuleClick}
                      currentBalance={actualBalance}
                    />
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <H3 className="text-xl font-semibold text-foreground">
                    {searchTerm
                      ? `Résultats pour "${searchTerm}"`
                      : "Tous les formations"}
                  </H3>
                  <P className="text-sm text-muted-foreground mt-1">
                    {formationModules.length} formation
                    {formationModules.length !== 1 ? "s " : " "}
                    disponible{formationModules.length !== 1 ? "s" : ""}
                  </P>
                </div>
              </div>

              <div id="all-formations">
                {formationModules.length === 0 ? (
                  <div className="card text-center py-12">
                    <div>
                      <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <H4 className="text-lg font-medium mb-2">
                        Aucun résultat
                      </H4>
                      <p className="text-muted-foreground">
                        Essayez de modifier vos critères de recherche
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        : "space-y-4"
                    }
                  >
                    {formationModules.map((module) => (
                      <ModuleCard
                        key={module.id}
                        module={module}
                        onModuleClick={handleModuleClick}
                        featured={module.featured}
                        viewMode={viewMode}
                        currentBalance={actualBalance}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </WithHeader>
  );
}
