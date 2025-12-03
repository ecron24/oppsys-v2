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
import { MODULES_IDS } from "@oppsys/api/client";

const AIWriterModule = lazy(
  () => import("@/components/modules/components/ai-writer-module")
);
const DocumentGeneratorModule = lazy(
  () => import("@/components/modules/components/document-generator-module")
);
const TranscriptionModule = lazy(
  () => import("@/components/modules/components/transcription-module")
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
  () => import("@/components/modules/components/email-campaign-module")
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
  [MODULES_IDS.AI_WRITER]: {
    icon: Sparkles,
    component: AIWriterModule,
    featured: true,
  },
  [MODULES_IDS.SOCIAL_FACTORY]: {
    icon: Share2,
    component: SocialFactoryModule,
    featured: true,
  },
  [MODULES_IDS.DOCUMENT_GENERATOR]: {
    icon: FileText,
    component: DocumentGeneratorModule,
    featured: true,
  },
  [MODULES_IDS.YOUTUBE_UPLOADER]: {
    icon: Youtube,
    component: YouTubeModule,
    featured: true,
  },
  [MODULES_IDS.TRANSCRIPTION]: {
    icon: Mic,
    component: TranscriptionModule,
    featured: true,
  },
  [MODULES_IDS.ARTICLE_WRITER]: {
    icon: FileText,
    component: ArticleWriterModule,
    featured: true,
    estimatedTime: "10-25 min",
  },
  [MODULES_IDS.FORMATION_CHATGPT]: {
    icon: GraduationCap,
    component: FormationChatGPTModule,
    featured: true,
  },
  [MODULES_IDS.FORMATION_PROMPTING]: {
    icon: Settings,
    component: FormationPromptingModule,
    featured: true,
  },
  [MODULES_IDS.REAL_ESTATE_LEASE_GENERATOR]: {
    icon: FileText,
    component: RealEstateLeaseGenerator,
    featured: true,
  },
  [MODULES_IDS.COMPETITOR_ANALYSIS]: {
    icon: BarChart3,
    component: CompetitorAnalysisModule,
    featured: true,
    estimatedTime: "15-40 min",
  },
  [MODULES_IDS.SEO_ANALYZER]: {
    icon: TrendingUp,
    component: SEOAnalyzerModule,
    featured: true,
    isNew: true,
    estimatedTime: "15-50 min",
  },
  [MODULES_IDS.DATA_ANALYZER]: {
    icon: Brain,
    component: DataAnalyzerModule,
    featured: true,
    estimatedTime: "10-30 min",
  },
  [MODULES_IDS.EMAIL_CAMPAIGN]: {
    icon: Mail,
    component: EmailCampaignModule,
    featured: true,
    estimatedTime: "10-30 min",
  },
  [MODULES_IDS.CONTENT_TRANSLATOR]: {
    icon: Languages,
    component: ContentTranslatorModule,
    featured: true,
    estimatedTime: "5-30 min",
  },
  [MODULES_IDS.LEAD_GENERATOR]: {
    icon: Target,
    component: LeadGeneratorModule,
    featured: true,
    estimatedTime: "10-25 min",
  },
  [MODULES_IDS.TALENT_ANALYZER]: {
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
