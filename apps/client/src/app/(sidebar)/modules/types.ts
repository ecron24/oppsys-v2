import type { LucideIcon } from "lucide-react";
import { lazy } from "react";

export interface ModuleFormat {
  id: string;
  label: string;
  description: string;
  cost: number;
  premium: boolean;
  icon: LucideIcon;
  source: {
    type: string;
    path?: string;
    id?: string;
  };
}

export interface ModuleLevel {
  id: string;
  label: string;
  description: string;
  premium: boolean;
  chapters: number;
  duration: string;
  icon: LucideIcon;
  objectives: string[];
  formats: {
    pdf: ModuleFormat;
    podcast: ModuleFormat;
    video: ModuleFormat;
  };
}

export interface ModuleConfig {
  id: string;
  levels: {
    debutant: ModuleLevel;
    middle: ModuleLevel;
    advanced: ModuleLevel;
  };
}

export interface Module {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
  component: ReturnType<typeof lazy>;
  category: string;
  baseCost: number;
  featured: boolean;
  dbId: string;
  dbSlug: string;
  apiEndpoint: string;
  n8nWebhookUrl: string;
  type: string;
  webhookKey: string;
  estimatedTime?: string;
  n8n_trigger_type?: string;
  isNew?: boolean;
  config?: ModuleConfig;
}

export interface Category {
  name: string;
}

export type ViewMode = "grid" | "list";

export type TabValue = "modules" | "formation";
