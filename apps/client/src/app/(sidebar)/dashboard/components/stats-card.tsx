import { P } from "@oppsys/ui";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, AlertCircle } from "lucide-react";

export function StatsCard({ stat }: StatsCardProps) {
  if (stat.isLoading) {
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

  if (stat.error) {
    return (
      <div className="text-card-foreground rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <P className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </P>
            <P className="text-sm text-destructive mt-2">Erreur API</P>
            <P className="text-xs text-destructive/80 mt-1">{stat.error}</P>
          </div>
          <div className="bg-destructive/10 p-3 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <P className="text-sm font-medium text-muted-foreground">
            {stat.title}
          </P>
          <P className="text-2xl font-bold text-card-foreground mt-2">
            {stat.value}
          </P>
          {stat.description && (
            <P className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </P>
          )}
        </div>
        <div className="bg-gradient-primary p-3 rounded-lg">
          <stat.icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {stat.trend && (
        <div
          className={`flex items-center mt-4 text-sm ${
            stat.trend.isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          <TrendingUp
            className={`h-4 w-4 mr-1 ${stat.trend.isPositive ? "" : "rotate-180"}`}
          />
          <span>{stat.trend.value}</span>
        </div>
      )}
    </div>
  );
}

type Trend = {
  value: string;
  isPositive: boolean;
};

type Stat = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: Trend | null;
  description?: string;
  isLoading: boolean;
  error: string | null;
};

type StatsCardProps = {
  stat: Stat;
};
