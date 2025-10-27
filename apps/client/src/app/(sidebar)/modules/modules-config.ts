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
  Headphones,
  Video,
  Users,
  Languages,
  Mail,
  Brain,
} from "lucide-react";
import type { Module, Category } from "@/app/(sidebar)/modules/types";

// Placeholder component for missing modules
const PlaceholderModule = lazy(() => import("./placeholder-module"));

const AIWriterModule = PlaceholderModule;
const DocumentGeneratorModule = PlaceholderModule;
const TranscriptionModule = PlaceholderModule;
const SocialFactoryModule = PlaceholderModule;
const ArticleWriterModule = PlaceholderModule;
const YouTubeModule = PlaceholderModule;
const FormationChatGPTModule = PlaceholderModule;
const FormationPromptingModule = PlaceholderModule;
const RealEstateLeaseGenerator = PlaceholderModule;

// ✅ NOUVEAUX MODULES AJOUTÉS
const CompetitorAnalysisModule = PlaceholderModule;
const SEOAnalyzerModule = PlaceholderModule;
const DataAnalyzerModule = PlaceholderModule;
const EmailCampaignModule = PlaceholderModule;
const ContentTranslatorModule = PlaceholderModule;
const TalentAnalyzerModule = PlaceholderModule;
const LeadGeneratorModule = PlaceholderModule;

const WEBHOOK_URLS: Record<string, string> = {
  REACT_APP_N8N_AI_WRITER_WEBHOOK:
    "https://n8n.oppsys.io/webhook/20e1fa12-c122-49ec-90aa-ad3a6c9c726d",
  REACT_APP_N8N_SOCIAL_FACTORY_WEBHOOK:
    "https://n8n.oppsys.io/webhook/5e710158-a890-469a-9738-1553e7943c84/chat",
  REACT_APP_N8N_DOCUMENT_GENERATOR_WEBHOOK:
    "https://n8n.oppsys.io/webhook/1802d840-9c9e-45a5-b17b-6e064f7d511a",
  REACT_APP_N8N_YOUTUBE_WEBHOOK:
    "https://n8n.oppsys.io/webhook/259fc9ab-88d1-41dc-ab78-3d733e720476",
  REACT_APP_N8N_TRANSCRIPTION_WEBHOOK:
    "https://n8n.oppsys.io/webhook/3e57d4be-23a5-4aab-afd7-93d225d9a80c",
  REACT_APP_N8N_ARTICLE_WRITER_WEBHOOK:
    "https://n8n.oppsys.io/webhook/e51fbbe7-e3eb-4f15-9ee3-ab1a4ad4b16f/chat",
  REACT_APP_N8N_FORMATION_CHATGPT_WEBHOOK:
    "https://n8n.oppsys.io/webhook/formation-chatgpt-update",
  REACT_APP_N8N_FORMATION_PROMPTING_WEBHOOK:
    "https://n8n.oppsys.io/webhook/formation-prompting-update",
  REACT_APP_N8N_REAL_ESTATE_WEBHOOK:
    "https://n8n.oppsys.io/webhook/e06ee234-50ee-433e-964f-8d714349adcf",

  // ✅ NOUVEAUX WEBHOOKS
  REACT_APP_N8N_COMPETITOR_ANALYSIS_WEBHOOK:
    "https://n8n.oppsys.io/webhook/competitor-analysis-standard",
  REACT_APP_N8N_LEAD_GENERATOR_WEBHOOK:
    "https://n8n.oppsys.io/webhook/lead-generator-chat",
  REACT_APP_N8N_SEO_ANALYZER_WEBHOOK:
    "https://n8n.oppsys.io/webhook/seo-analyzer-standard",
  REACT_APP_N8N_DATA_ANALYZER_WEBHOOK:
    "https://n8n.oppsys.io/webhook/data-analyzer-chat",
  REACT_APP_N8N_EMAIL_CAMPAIGN_WEBHOOK:
    "https://n8n.oppsys.io/webhook/31c96558-8b84-4a8a-bb9a-c78892680a67/chat",
  REACT_APP_N8N_CONTENT_TRANSLATOR_WEBHOOK:
    "https://n8n.oppsys.io/webhook/content-translator-chat",
  REACT_APP_N8N_TALENT_ANALYZER_WEBHOOK:
    "https://n8n.oppsys.io/webhook/talent-analyzer-chat",
};

function getWebhookUrl(key: string): string | null {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  if (typeof window !== "undefined") {
    const win = window as { env?: Record<string, string> };
    if (win.env && win.env[key]) {
      return win.env[key];
    }
  }
  return WEBHOOK_URLS[key] || null;
}

export const MODULES_CONFIG: Record<string, Module> = {
  "ai-writer": {
    id: "ai-writer",
    slug: "ai-writer",
    name: "Rédacteur IA",
    description: "Génération de contenu avec IA",
    icon: Sparkles,
    component: AIWriterModule,
    category: "content",
    baseCost: 25,
    featured: true,
    dbId: "807cbb24-7772-42d3-ada1-afcaba517b7c",
    dbSlug: "ai-writer",
    apiEndpoint: "/api/modules/807cbb24-7772-42d3-ada1-afcaba517b7c/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_AI_WRITER_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_AI_WRITER_WEBHOOK",
  },
  "social-factory": {
    id: "social-factory",
    slug: "social-factory",
    name: "Générateur de Posts Sociaux",
    description: "Génération de posts réseaux sociaux",
    icon: Share2,
    component: SocialFactoryModule,
    category: "social",
    baseCost: 8,
    featured: true,
    dbId: "0ef559af-410f-464c-9d64-d9d7db414dee",
    dbSlug: "social-factory",
    apiEndpoint: "/api/modules/social-factory/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_SOCIAL_FACTORY_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_SOCIAL_FACTORY_WEBHOOK",
    n8n_trigger_type: "CHAT",
  },
  "document-generator": {
    id: "document-generator",
    slug: "document-generator",
    name: "Générateur de Documents",
    description: "Création de documents professionnels",
    icon: FileText,
    component: DocumentGeneratorModule,
    category: "content",
    baseCost: 18,
    featured: true,
    dbId: "af53ce58-de49-4a5b-aa88-661b5ac0e72e",
    dbSlug: "document-generator",
    apiEndpoint: "/api/modules/af53ce58-de49-4a5b-aa88-661b5ac0e72e/execute",
    n8nWebhookUrl:
      getWebhookUrl("REACT_APP_N8N_DOCUMENT_GENERATOR_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_DOCUMENT_GENERATOR_WEBHOOK",
  },
  "youtube-uploader": {
    id: "youtube-uploader",
    slug: "youtube-uploader",
    name: "Upload YouTube",
    description: "Upload de vidéos YouTube optimisé avec IA",
    icon: Youtube,
    component: YouTubeModule,
    category: "social",
    baseCost: 100,
    featured: true,
    dbId: "3173bec3-0114-4dc0-83a1-ab369505bdc4",
    dbSlug: "youtube-uploader",
    apiEndpoint: "/api/youtube",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_YOUTUBE_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_YOUTUBE_WEBHOOK",
  },
  transcription: {
    id: "transcription",
    slug: "transcription",
    name: "Transcription Audio/Vidéo",
    description: "Transcription automatique avec IA avancée",
    icon: Mic,
    component: TranscriptionModule,
    category: "media",
    baseCost: 25,
    featured: true,
    dbId: "cb47170b-2f43-497d-b0bb-cf39ac5c4e6f",
    dbSlug: "transcription",
    apiEndpoint: "/api/transcriptions",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_TRANSCRIPTION_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_TRANSCRIPTION_WEBHOOK",
  },
  "article-writer": {
    id: "article-writer",
    slug: "article-writer",
    name: "Rédacteur d'Articles IA",
    description: "Création d'articles avec assistant IA conversationnel",
    icon: FileText,
    component: ArticleWriterModule,
    category: "content",
    baseCost: 30,
    featured: true,
    dbId: "a0189b52-1601-4958-85b6-a11104790b3e",
    dbSlug: "article-writer",
    apiEndpoint: "/api/modules/a0189b52-1601-4958-85b6-a11104790b3e/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_ARTICLE_WRITER_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_ARTICLE_WRITER_WEBHOOK",
    estimatedTime: "10-25 min",
    n8n_trigger_type: "CHAT",
  },
  "formation-chatgpt": {
    id: "formation-chatgpt",
    slug: "formation-chatgpt",
    name: "Formation ChatGPT",
    description: "Formation complète sur ChatGPT, de débutant à expert.",
    icon: GraduationCap,
    component: FormationChatGPTModule,
    category: "formation",
    baseCost: 0,
    featured: true,
    dbId: "f0b4a1b3-c8e9-4f6a-9d2b-5e7c8f1a2b3c",
    dbSlug: "formation-chatgpt",
    apiEndpoint: "/api/modules/f0b4a1b3-c8e9-4f6a-9d2b-5e7c8f1a2b3c/execute",
    n8nWebhookUrl:
      getWebhookUrl("REACT_APP_N8N_FORMATION_CHATGPT_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_FORMATION_CHATGPT_WEBHOOK",
    config: {
      id: "formation-chatgpt-01",
      levels: {
        debutant: {
          id: "debutant",
          label: "Niveau Débutant",
          description:
            "Acquérez les bases solides pour utiliser ChatGPT efficacement au quotidien.",
          premium: false,
          chapters: 8,
          duration: "3h",
          icon: BarChart3,
          objectives: [
            "Comprendre le fonctionnement de ChatGPT",
            "Écrire des prompts clairs et efficaces",
            "Utiliser l'IA pour la rédaction et la synthèse",
            "Éviter les erreurs communes",
          ],
          formats: {
            pdf: {
              id: "pdf_debutant",
              label: "Document PDF",
              description:
                "Un guide complet de 80 pages avec exemples et exercices.",
              cost: 0,
              premium: false,
              icon: FileText,
              source: {
                type: "supabase",
                path: "formations/chatgpt/debutant_guide.pdf",
              },
            },
            podcast: {
              id: "podcast_debutant",
              label: "Podcast Audio",
              description: "3 heures d'écoute pour apprendre en déplacement.",
              cost: 10,
              premium: true,
              icon: Headphones,
              source: {
                type: "supabase",
                path: "formations/chatgpt/debutant_podcast.mp3",
              },
            },
            video: {
              id: "video_debutant",
              label: "Cours Vidéo HD",
              description:
                "Accès à 25 leçons vidéo avec démonstrations pratiques.",
              cost: 25,
              premium: true,
              icon: Video,
              source: { type: "vimeo", id: "123456789" },
            },
          },
        },
        middle: {
          id: "middle",
          label: "Niveau Intermédiaire",
          description:
            "Passez à la vitesse supérieure avec des techniques de prompting avancées.",
          premium: true,
          chapters: 12,
          duration: "5h",
          icon: TrendingUp,
          objectives: [
            'Maîtriser les techniques de "Chain of Thought"',
            'Créer des "personas" pour l\'IA',
            "Utiliser les instructions personnalisées (Custom Instructions)",
            "Automatiser des tâches complexes",
          ],
          formats: {
            pdf: {
              id: "pdf_middle",
              label: "Document PDF",
              description: "Guide technique de 120 pages.",
              cost: 15,
              premium: true,
              icon: FileText,
              source: {
                type: "supabase",
                path: "formations/chatgpt/middle_guide.pdf",
              },
            },
            podcast: {
              id: "podcast_middle",
              label: "Podcast Audio",
              description: "Analyses de cas et interviews d'experts.",
              cost: 20,
              premium: true,
              icon: Headphones,
              source: {
                type: "supabase",
                path: "formations/chatgpt/middle_podcast.mp3",
              },
            },
            video: {
              id: "video_middle",
              label: "Ateliers Vidéo",
              description: "Ateliers pratiques et projets guidés.",
              cost: 40,
              premium: true,
              icon: Video,
              source: { type: "youtube", id: "dQw4w9WgXcQ" },
            },
          },
        },
        advanced: {
          id: "advanced",
          label: "Niveau Avancé",
          description:
            "Devenez un expert et intégrez l'IA dans vos processus métier.",
          premium: true,
          chapters: 10,
          duration: "6h",
          icon: Target,
          objectives: [
            "Fine-tuning de modèles (bases)",
            "Intégration de ChatGPT via API",
            "Création de GPTs personnalisés",
            "Stratégies de déploiement",
          ],
          formats: {
            pdf: {
              id: "pdf_advanced",
              label: "Livre Blanc PDF",
              description: "Dossier stratégique et technique.",
              cost: 25,
              premium: true,
              icon: FileText,
              source: {
                type: "supabase",
                path: "formations/chatgpt/advanced_whitepaper.pdf",
              },
            },
            podcast: {
              id: "podcast_advanced",
              label: "Podcast Masterclass",
              description: "Discussions approfondies.",
              cost: 30,
              premium: true,
              icon: Headphones,
              source: {
                type: "supabase",
                path: "formations/chatgpt/advanced_masterclass.mp3",
              },
            },
            video: {
              id: "video_advanced",
              label: "Projet de A à Z",
              description: "Développez une application avec l'API.",
              cost: 60,
              premium: true,
              icon: Video,
              source: { type: "vimeo", id: "987654321" },
            },
          },
        },
      },
    },
  },
  "formation-prompting": {
    id: "formation-prompting",
    slug: "formation-prompting",
    name: "Formation au Prompting",
    description:
      "Apprenez à dialoguer avec l'IA pour des résultats exceptionnels.",
    icon: Settings,
    component: FormationPromptingModule,
    category: "formation",
    baseCost: 0,
    featured: true,
    dbId: "a1b2c3d4-e5f6-7890-1234-567890abcdef",
    dbSlug: "formation-prompting",
    apiEndpoint: "/api/modules/a1b2c3d4-e5f6-7890-1234-567890abcdef/execute",
    n8nWebhookUrl:
      getWebhookUrl("REACT_APP_N8N_FORMATION_PROMPTING_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_FORMATION_PROMPTING_WEBHOOK",
    config: {
      id: "formation-prompting-01",
      levels: {
        debutant: {
          id: "debutant",
          label: "Niveau Débutant",
          description:
            "Apprenez à formuler des instructions claires pour obtenir des résultats précis de l'IA.",
          premium: false,
          chapters: 7,
          duration: "2.5h",
          icon: BarChart3,
          objectives: [
            "Définir ce qu'est un prompt",
            "Structurer un prompt (Rôle, Contexte, Tâche)",
            "Utiliser des verbes d'action efficaces",
            "Demander des formats de sortie spécifiques",
          ],
          formats: {
            pdf: {
              id: "pdf_prompt_debutant",
              label: "Guide PDF",
              description: "Guide d'initiation de 60 pages.",
              cost: 0,
              premium: false,
              icon: FileText,
              source: {
                type: "supabase",
                path: "formations/prompting/debutant_guide.pdf",
              },
            },
            podcast: {
              id: "podcast_prompt_debutant",
              label: "Podcast Audio",
              description: "Études de cas audio de prompts.",
              cost: 10,
              premium: true,
              icon: Headphones,
              source: {
                type: "supabase",
                path: "formations/prompting/debutant_podcast.mp3",
              },
            },
            video: {
              id: "video_prompt_debutant",
              label: "Tutoriels Vidéo",
              description: "Démonstrations de construction de prompts.",
              cost: 20,
              premium: true,
              icon: Video,
              source: { type: "vimeo", id: "234567890" },
            },
          },
        },
        middle: {
          id: "middle",
          label: "Niveau Intermédiaire",
          description:
            "Maîtrisez les techniques avancées comme le Few-Shot, le Chain-of-Thought et les Personas.",
          premium: true,
          chapters: 10,
          duration: "4h",
          icon: TrendingUp,
          objectives: [
            'Appliquer le "Few-Shot Prompting"',
            "Construire des Personas d'IA complexes",
            'Utiliser la technique "Chain-of-Thought"',
            "Gérer des conversations multi-tours",
          ],
          formats: {
            pdf: {
              id: "pdf_prompt_middle",
              label: "Document PDF",
              description: "Recueil de techniques avancées.",
              cost: 15,
              premium: true,
              icon: FileText,
              source: {
                type: "supabase",
                path: "formations/prompting/middle_techniques.pdf",
              },
            },
            podcast: {
              id: "podcast_prompt_middle",
              label: "Podcast Audio",
              description: 'Interviews de "Prompt Engineers".',
              cost: 20,
              premium: true,
              icon: Headphones,
              source: {
                type: "supabase",
                path: "formations/prompting/middle_podcast.mp3",
              },
            },
            video: {
              id: "video_prompt_middle",
              label: "Ateliers Vidéo",
              description: "Ateliers sur des cas d'usage réels.",
              cost: 35,
              premium: true,
              icon: Video,
              source: { type: "youtube", id: "y6120QOlsfU" },
            },
          },
        },
        advanced: {
          id: "advanced",
          label: "Niveau Avancé",
          description:
            "Développez des systèmes de prompts complexes et évaluez leur performance.",
          premium: true,
          chapters: 8,
          duration: "5h",
          icon: Target,
          objectives: [
            'Créer des "mega-prompts"',
            "Développer des chaînes de prompts (agents)",
            "Mettre en place des systèmes d'évaluation",
            "Comprendre les limites et les biais",
          ],
          formats: {
            pdf: {
              id: "pdf_prompt_advanced",
              label: "Livre Blanc PDF",
              description: 'Frameworks pour le "Prompt Engineering".',
              cost: 25,
              premium: true,
              icon: FileText,
              source: {
                type: "supabase",
                path: "formations/prompting/advanced_frameworks.pdf",
              },
            },
            podcast: {
              id: "podcast_prompt_advanced",
              label: "Podcast Masterclass",
              description: "Sujets de pointe en ingénierie de prompts.",
              cost: 30,
              premium: true,
              icon: Headphones,
              source: {
                type: "supabase",
                path: "formations/prompting/advanced_masterclass.mp3",
              },
            },
            video: {
              id: "video_prompt_advanced",
              label: "Projet Guidé",
              description: "Construisez un agent autonome simple.",
              cost: 50,
              premium: true,
              icon: Video,
              source: { type: "vimeo", id: "345678901" },
            },
          },
        },
      },
    },
  },
  // ✅ VERSION SIMPLIFIÉE qui récupère la config depuis la BDD
  "real-estate-lease-generator": {
    id: "real-estate-lease-generator",
    slug: "real-estate-lease-generator",
    name: "Générateur de Baux Immobiliers",
    description: "Création de baux immobiliers conformes",
    icon: FileText,
    component: RealEstateLeaseGenerator,
    category: "content",
    baseCost: 35, // Fallback si BDD indisponible
    featured: true,
    dbId: "36ea2db5-249a-4b81-ba18-0c316b844771",
    dbSlug: "real-estate-lease-generator",
    apiEndpoint: "/api/modules/real-estate-lease-generator/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_REAL_ESTATE_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_REAL_ESTATE_WEBHOOK",
    // Config sera récupérée depuis la BDD via useModuleConfig
  },
  "competitor-analysis": {
    id: "competitor-analysis",
    slug: "competitor-analysis",
    name: "Analyse Concurrentielle",
    description:
      "Analysez vos concurrents en profondeur et identifiez les opportunités de marché avec surveillance continue.",
    icon: BarChart3,
    component: CompetitorAnalysisModule,
    category: "marketing",
    baseCost: 45,
    featured: true,
    dbId: "comp-analysis-uuid", // À remplacer par l'UUID réel de la BDD
    dbSlug: "competitor-analysis",
    apiEndpoint: "/api/modules/competitor-analysis/execute",
    n8nWebhookUrl:
      getWebhookUrl("REACT_APP_N8N_COMPETITOR_ANALYSIS_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_COMPETITOR_ANALYSIS_WEBHOOK",
    estimatedTime: "15-40 min",
    n8n_trigger_type: "STANDARD",
  },

  "seo-analyzer": {
    id: "seo-analyzer",
    slug: "seo-analyzer",
    name: "Analyseur SEO + GEO",
    description:
      "Analysez et optimisez votre SEO traditionnel + GEO (Generative Engine Optimization) pour les IA génératives.",
    icon: TrendingUp,
    component: SEOAnalyzerModule,
    category: "seo",
    baseCost: 35,
    featured: true,
    isNew: true,
    dbId: "seo-analyzer-uuid", // À remplacer par l'UUID réel de la BDD
    dbSlug: "seo-analyzer",
    apiEndpoint: "/api/modules/seo-analyzer/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_SEO_ANALYZER_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_SEO_ANALYZER_WEBHOOK",
    estimatedTime: "15-50 min",
    n8n_trigger_type: "STANDARD",
  },

  "data-analyzer": {
    id: "data-analyzer",
    slug: "data-analyzer",
    name: "Analyseur de Données",
    description:
      "Analysez vos données avec notre IA conversationnelle et obtenez des insights exploitables avec Machine Learning.",
    icon: Brain,
    component: DataAnalyzerModule,
    category: "analytics",
    baseCost: 40,
    featured: true,
    dbId: "data-analyzer-uuid", // À remplacer par l'UUID réel de la BDD
    dbSlug: "data-analyzer",
    apiEndpoint: "/api/modules/data-analyzer/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_DATA_ANALYZER_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_DATA_ANALYZER_WEBHOOK",
    estimatedTime: "10-30 min",
    n8n_trigger_type: "CHAT",
  },

  "email-campaign": {
    id: "email-campaign",
    slug: "email-campaign",
    name: "Campagne Email",
    description:
      "Créez des campagnes email performantes avec notre assistant IA conversationnel et automation avancée.",
    icon: Mail,
    component: EmailCampaignModule,
    category: "marketing",
    baseCost: 30,
    featured: true,
    dbId: "email-campaign-uuid", // À remplacer par l'UUID réel de la BDD
    dbSlug: "email-campaign",
    apiEndpoint: "/api/modules/email-campaign/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_EMAIL_CAMPAIGN_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_EMAIL_CAMPAIGN_WEBHOOK",
    estimatedTime: "10-30 min",
    n8n_trigger_type: "CHAT",
  },

  "content-translator": {
    id: "content-translator",
    slug: "content-translator",
    name: "Traducteur de Contenu",
    description:
      "Traduisez votre contenu dans plus de 20 langues avec adaptation culturelle et révision humaine experte.",
    icon: Languages,
    component: ContentTranslatorModule,
    category: "content",
    baseCost: 25,
    featured: true,
    dbId: "content-translator-uuid", // À remplacer par l'UUID réel de la BDD
    dbSlug: "content-translator",
    apiEndpoint: "/api/modules/content-translator/execute",
    n8nWebhookUrl:
      getWebhookUrl("REACT_APP_N8N_CONTENT_TRANSLATOR_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_CONTENT_TRANSLATOR_WEBHOOK",
    estimatedTime: "5-30 min",
    n8n_trigger_type: "CHAT",
  },

  "lead-generator": {
    id: "lead-generator",
    slug: "lead-generator",
    name: "Générateur de Leads",
    description:
      "Générez des listes de prospects qualifiés avec notre IA conversationnelle et enrichissement automatique.",
    icon: Target,
    component: LeadGeneratorModule,
    category: "marketing",
    baseCost: 50,
    featured: true,
    dbId: "a5c6012a-db16-4fa0-a2ac-64fffcc44de4",
    dbSlug: "lead-generator",
    apiEndpoint: "/api/modules/lead-generator/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_LEAD_GENERATOR_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_LEAD_GENERATOR_WEBHOOK",
    estimatedTime: "10-25 min",
    n8n_trigger_type: "CHAT",
  },

  "talent-analyzer": {
    id: "talent-analyzer",
    slug: "talent-analyzer",
    name: "Talent Analyzer",
    description:
      "Analysez les talents avec notre IA RH conversationnelle : screening, matching, évaluation prédictive.",
    icon: Users,
    component: TalentAnalyzerModule,
    category: "hr",
    baseCost: 35,
    featured: true,
    isNew: true,
    dbId: "talent-analyzer-uuid", // À remplacer par l'UUID réel de la BDD
    dbSlug: "talent-analyzer",
    apiEndpoint: "/api/modules/talent-analyzer/execute",
    n8nWebhookUrl: getWebhookUrl("REACT_APP_N8N_TALENT_ANALYZER_WEBHOOK") || "",
    type: "n8n",
    webhookKey: "REACT_APP_N8N_TALENT_ANALYZER_WEBHOOK",
    estimatedTime: "5-30 min",
    n8n_trigger_type: "CHAT",
  },
};

export const MODULE_CATEGORIES: Record<string, Category> = {
  content: { name: "Création de Contenu" },
  social: { name: "Réseaux Sociaux" },
  media: { name: "Média" },
  marketing: { name: "Marketing" },
  seo: { name: "SEO & Référencement" },
  analytics: { name: "Analytics & Données" },
  hr: { name: "Ressources Humaines" },
  formation: { name: "Formations" },
};

export function getFeaturedModules(): Module[] {
  return Object.values(MODULES_CONFIG).filter((mod) => mod.featured);
}

export function getModulesByCategory(category: string): Module[] {
  return Object.values(MODULES_CONFIG).filter(
    (mod) => mod.category === category
  );
}

export function searchModules(searchTerm: string): Module[] {
  const lowercasedTerm = searchTerm.toLowerCase();
  return Object.values(MODULES_CONFIG).filter(
    (mod) =>
      mod.name.toLowerCase().includes(lowercasedTerm) ||
      mod.description.toLowerCase().includes(lowercasedTerm)
  );
}

export function getModuleBySlug(slug: string): Module | null {
  return MODULES_CONFIG[slug] || null;
}

export function moduleExists(slug: string): boolean {
  return slug in MODULES_CONFIG;
}

export function getN8NModules(): Module[] {
  return Object.values(MODULES_CONFIG).filter((mod) => mod.type === "n8n");
}

export function getModuleN8NUrl(slug: string): string | null {
  const module = MODULES_CONFIG[slug];
  if (!module || !module.webhookKey) return module?.n8nWebhookUrl || null;
  return getWebhookUrl(module.webhookKey) || module.n8nWebhookUrl;
}

export function isN8NModule(slug: string): boolean {
  const module = MODULES_CONFIG[slug];
  return module?.type === "n8n";
}

export function logModulesConfiguration(): void {
  console.log("📋 Configuration des modules:");
  Object.values(MODULES_CONFIG).forEach((module) => {
    if (module.type === "n8n") {
      console.log(`🔗 ${module.name}:`, {
        slug: module.slug,
        dbId: module.dbId,
        n8nUrl: getModuleN8NUrl(module.slug),
        cost: module.baseCost,
      });
    }
  });
}

export function updateWebhookUrls(): void {
  Object.keys(MODULES_CONFIG).forEach((key) => {
    const module = MODULES_CONFIG[key];
    if (module.webhookKey) {
      const envUrl = getWebhookUrl(module.webhookKey);
      if (envUrl) {
        module.n8nWebhookUrl = envUrl;
      }
    }
  });
}

export default MODULES_CONFIG;
