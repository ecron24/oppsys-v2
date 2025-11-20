import { lazy } from "react";
import {
  Sparkles,
  FileText,
  Share2,
  Youtube,
  Mic,
  GraduationCap,
  Settings,
  BarChart3,
  TrendingUp,
  Target,
  Users,
  Languages,
  Mail,
  Brain,
} from "lucide-react";
import type {
  ModuleMapping,
  CategoryMapping,
} from "@/components/modules/module-types";

const AIWriterModule = lazy(
  () => import("@/components/modules/components/ai-writer-module")
);
const DocumentGeneratorModule = lazy(
  () => import("@/components/modules/components/document-generator-module")
);
const TranscriptionModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const SocialFactoryModule = lazy(
  () => import("@/components/modules/components/social-factory-module")
);
const ArticleWriterModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const YouTubeModule = lazy(
  () => import("@/components/modules/components/youtube-module")
);
const FormationChatGPTModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const FormationPromptingModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const RealEstateLeaseGenerator = lazy(
  () => import("@/components/modules/components/real-estate-lease-generator")
);

// ✅ NOUVEAUX MODULES AJOUTÉS
const CompetitorAnalysisModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const SEOAnalyzerModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const DataAnalyzerModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const EmailCampaignModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const ContentTranslatorModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const TalentAnalyzerModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);
const LeadGeneratorModule = lazy(
  () => import("@/components/modules/components/placeholder-module")
);

export const MODULES_CONFIG_MAPPING: Record<string, ModuleMapping> = {
  "ai-writer": {
    icon: Sparkles,
    component: AIWriterModule,
    featured: true,
  },
  "social-factory": {
    icon: Share2,
    component: SocialFactoryModule,
    featured: true,
  },
  "document-generator": {
    icon: FileText,
    component: DocumentGeneratorModule,
    featured: true,
  },
  "youtube-uploader": {
    icon: Youtube,
    component: YouTubeModule,
    featured: true,
  },
  transcription: {
    icon: Mic,
    component: TranscriptionModule,
    featured: true,
  },
  "article-writer": {
    icon: FileText,
    component: ArticleWriterModule,
    featured: true,
    estimatedTime: "10-25 min",
  },
  "formation-chatgpt": {
    icon: GraduationCap,
    component: FormationChatGPTModule,
    featured: true,
  },
  "formation-prompting": {
    icon: Settings,
    component: FormationPromptingModule,
    featured: true,
  },
  "real-estate-lease-generator": {
    icon: FileText,
    component: RealEstateLeaseGenerator,
    featured: true,
  },
  "competitor-analysis": {
    icon: BarChart3,
    component: CompetitorAnalysisModule,
    featured: true,
    estimatedTime: "15-40 min",
  },
  "seo-analyzer": {
    icon: TrendingUp,
    component: SEOAnalyzerModule,
    featured: true,
    isNew: true,
    estimatedTime: "15-50 min",
  },
  "data-analyzer": {
    icon: Brain,
    component: DataAnalyzerModule,
    featured: true,
    estimatedTime: "10-30 min",
  },
  "email-campaign": {
    icon: Mail,
    component: EmailCampaignModule,
    featured: true,
    estimatedTime: "10-30 min",
  },
  "content-translator": {
    icon: Languages,
    component: ContentTranslatorModule,
    featured: true,
    estimatedTime: "5-30 min",
  },
  "lead-generator": {
    icon: Target,
    component: LeadGeneratorModule,
    featured: true,
    estimatedTime: "10-25 min",
  },
  "talent-analyzer": {
    icon: Users,
    component: TalentAnalyzerModule,
    featured: true,
    isNew: true,
    estimatedTime: "5-30 min",
  },
};

export const MODULE_CATEGORIES_MAPPING: Record<string, CategoryMapping> = {
  content: { name: "Création de Contenu" },
  social: { name: "Réseaux Sociaux" },
  media: { name: "Média" },
  marketing: { name: "Marketing" },
  seo: { name: "SEO & Référencement" },
  analytics: { name: "Analytics & Données" },
  hr: { name: "Ressources Humaines" },
  formation: { name: "Formations" },
  real_estate: { name: "Création de Contenu" },
};
