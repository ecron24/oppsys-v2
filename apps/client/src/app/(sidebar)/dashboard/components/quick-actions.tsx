import { Link } from "react-router";
import {
  Plus,
  FileText,
  Share2,
  BarChart3,
  Sparkles,
  Calendar,
  ArrowUpRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { H3, H4, P } from "@oppsys/ui";

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  premiumOnly?: boolean;
  badge?: React.ReactNode;
}

interface QuickActionsProps {
  isPremium: boolean;
}

export function QuickActions({ isPremium }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      title: "Créer un article",
      description: "Générez un article optimisé SEO en quelques clics.",
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
      description: "Obtenez un rapport SEO détaillé pour votre site.",
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
  ];

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <H3 className="text-lg font-semibold text-card-foreground">
          Actions rapides
        </H3>
        <Plus className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 gap-3">
        {actions.map((action, index) => {
          if (action.premiumOnly && !isPremium) {
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
                  <H4 className="font-medium text-card-foreground group-hover:text-primary transition-colors">
                    {action.title}
                  </H4>
                  {action.badge && action.badge}
                </div>
                <P className="text-sm text-muted-foreground">
                  {action.description}
                </P>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
