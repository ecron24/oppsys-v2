import { Target } from "lucide-react";
import type { DashboardContentData, PeriodUsage } from "../type";
import { H3 } from "@oppsys/ui";

interface GeneralStatsProps {
  content: DashboardContentData;
  periodUsage: PeriodUsage;
}

export function GeneralStats({ content, periodUsage }: GeneralStatsProps) {
  const hasStats =
    (content.totalGenerated && content.totalGenerated > 0) ||
    (periodUsage.totalUsage && periodUsage.totalUsage > 0) ||
    (periodUsage.successRate && periodUsage.successRate > 0);

  if (!hasStats) {
    return null;
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <H3 className="text-lg font-semibold text-card-foreground">
          Statistiques
        </H3>
        <Target className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-5">
        {content.totalGenerated > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Contenu généré</span>
              <span className="font-medium text-card-foreground">
                {content.totalGenerated}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((content.totalGenerated / 10) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        {periodUsage.totalUsage > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Modules utilisés</span>
              <span className="font-medium text-card-foreground">
                {periodUsage.totalUsage}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((periodUsage.totalUsage / 15) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        {periodUsage.successRate > 0 && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Taux de succès</span>
              <span className="font-medium text-card-foreground">
                {periodUsage.successRate}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${periodUsage.successRate}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
