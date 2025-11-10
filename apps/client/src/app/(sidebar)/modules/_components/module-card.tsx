import { Button, Badge, P } from "@oppsys/ui";
import { Clock, AlertCircle, Star } from "lucide-react";
import type { Module, ViewMode } from "../types";
import { Card } from "@oppsys/ui/components/card";
import { MODULE_CATEGORIES_MAPPING } from "../modules-config";

export function ModuleCard({
  module,
  onModuleClick,
  viewMode,
  currentBalance,
}: ModuleCardProps) {
  const Icon = module.icon;
  const canAfford = currentBalance >= module.creditCost;
  const categoryInfo = module.category
    ? MODULE_CATEGORIES_MAPPING[module.category]
    : null;
  const featured = module.featured;

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4 flex-1">
            <div className="bg-muted p-3 rounded-lg">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-semibold mb-2">{module.name}</h5>
                <Badge variant="outline">{module.creditCost} crédits</Badge>
                {module.isNew && <Badge variant="success">Nouveau</Badge>}
                {!canAfford && (
                  <Badge variant="destructive" className="text-xs">
                    Crédits insuffisants
                  </Badge>
                )}
              </div>
              <P className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-6">
                {module.description}
              </P>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground capitalize">
                  {categoryInfo?.name || module.category}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {module.estimatedTime}
                </span>
              </div>
            </div>
          </div>
          <Button
            onClick={() => canAfford && onModuleClick(module.slug)}
            disabled={!canAfford}
            className="ml-4"
          >
            Utiliser
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`hover:shadow-md transition-shadow h-full flex flex-col ${
        featured ? "border border-primary/30" : ""
      } ${!canAfford ? "opacity-70" : ""}`}
    >
      <div
        onClick={() => canAfford && onModuleClick(module.slug)}
        className={`flex flex-col flex-grow ${
          canAfford ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <div className="flex items-start justify-between gap-4 p-4 pt-0">
          <div className="flex items-center gap-3">
            <div className="bg-muted p-3 rounded-lg">
              {Icon && <Icon className="h-5 w-5 text-primary" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="font-semibold mb-2">{module.name}</h5>
              </div>
              <P className="text-sm text-muted-foreground capitalize">
                {categoryInfo?.name || module.category}
              </P>
            </div>
          </div>
          <div className="grid gap-2">
            {module.isNew && <Badge variant="success">Nouveau</Badge>}
            {featured && (
              <Badge variant="muted">
                <Star className="h-3 w-3 mr-1" />
                Populaire
              </Badge>
            )}
          </div>
        </div>

        <div className="px-4 space-y-3 flex flex-col flex-grow">
          <P className="text-sm text-muted-foreground line-clamp-3 flex-grow mt-2 mb-6">
            {module.description}
          </P>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-1" />
              {module.estimatedTime || "~2-3 min"}
            </div>
            <Badge variant="outline">{module.creditCost} crédits</Badge>
          </div>

          {!canAfford && (
            <div className="flex items-center text-sm text-red-500 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 mr-1" />
              Il vous manque {module.creditCost - currentBalance} crédits
            </div>
          )}

          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (canAfford) {
                onModuleClick(module.slug);
              }
            }}
            disabled={!canAfford}
            className="w-full mt-auto"
          >
            {canAfford
              ? "Utiliser ce module"
              : `+${module.creditCost - currentBalance} crédits requis`}
          </Button>
        </div>
      </div>
    </Card>
  );
}

type ModuleCardProps = {
  module: Module;
  onModuleClick: (slug: string) => void;
  viewMode: ViewMode;
  currentBalance: number;
};
