import { Badge, H4, P } from "@oppsys/ui";
import type { Module } from "@/components/modules/module-types";

interface CompactModuleCardProps {
  module: Module;
  onModuleClick: (slug: string) => void;
  currentBalance: number;
}

export const CompactModuleCard = ({
  module,
  onModuleClick,
  currentBalance,
}: CompactModuleCardProps) => {
  const Icon = module.icon;
  const canAfford = currentBalance >= module.creditCost;

  return (
    <div
      className={`bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-all cursor-pointer group ${
        !canAfford ? "opacity-70" : "hover:border-primary/50"
      }`}
      onClick={() => canAfford && onModuleClick(module.slug)}
    >
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 p-2 rounded-md flex-shrink-0 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <H4 className="font-medium text-foreground text-sm sm:text-sm truncate mb-0">
              {module.name}
            </H4>
            {module.isNew && <Badge variant="success">Nouveau</Badge>}
          </div>
          <P className="text-xs text-muted-foreground mt-3 line-clamp-2">
            {module.description}
          </P>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {module.creditCost} crédits
              </Badge>
              <span className="text-xs text-muted-foreground capitalize">
                {module.category}
              </span>
            </div>
            {!canAfford && (
              <span className="text-xs text-red-500">Insuffisant</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
