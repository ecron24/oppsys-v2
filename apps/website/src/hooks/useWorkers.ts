/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useMemo } from "react";
import {
  PenTool,
  Share2,
  Mic,
  FileText,
  Globe,
  BarChart3,
  TrendingUp,
  Brain,
  Mail,
  Languages,
  Users,
  Zap,
  Camera,
  MessageSquare,
  Target,
} from "lucide-react";

interface Worker {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  icon: any;
  color: string;
  timeToComplete: string;
  time_to_complete?: string;
  rating: number;
  difficulty: string;
  popular: boolean;
  isNew?: boolean; // ✅ AJOUTÉ pour les nouveaux modules
}

interface Category {
  id: string;
  name: string;
  icon: any;
  count: number;
}

interface UseWorkersResult {
  workers: Worker[];
  categories: Category[];
  filteredWorkers: Worker[];
  loading: boolean;
  error: string | null;
  stats: {
    totalWorkers: number;
    popularWorkers: number;
    totalCategories: number;
    averageRating: number;
  };
  selectedCategory: string;
  searchQuery: string;
  sortBy: string;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  resetFilters: () => void;
}

// ✅ WORKERS EXISTANTS + NOUVEAUX MODULES
const STATIC_WORKERS: Worker[] = [
  // ✅ WORKERS EXISTANTS (inchangés)
  {
    id: "37992b12-5064-4b72-8ac8-646eaecdbcdc",
    name: "Social Factory",
    description:
      "Créez des posts engageants pour tous vos réseaux sociaux avec l'IA. Optimisé pour Facebook, Instagram, LinkedIn et X (Twitter).",
    category: "social",
    tags: [
      "réseaux sociaux",
      "content marketing",
      "automation",
      "multi-plateformes",
    ],
    icon: Share2,
    color: "bg-blue-500 text-white",
    timeToComplete: "2-5 min",
    difficulty: "Facile",
    rating: 4.8,
    popular: true,
  },
  {
    id: "7d89e3ac-a455-441e-95ca-f7f773c28edb",
    name: "Article Writer",
    description:
      "Rédigez des articles de blog optimisés SEO avec une structure professionnelle et un contenu de qualité.",
    category: "content",
    tags: ["blog", "seo", "rédaction", "contenu"],
    icon: PenTool,
    color: "bg-green-500 text-white",
    timeToComplete: "5-10 min",
    difficulty: "Facile",
    rating: 4.7,
    popular: true,
  },
  {
    id: "024f675e-945b-4aea-8b57-3151ed1d3cfd",
    name: "AI Copywriter",
    description:
      "Générez des textes marketing percutants pour vos campagnes, emails et pages de vente.",
    category: "marketing",
    tags: ["copywriting", "marketing", "conversion", "emails"],
    icon: Brain,
    color: "bg-orange-500 text-white",
    timeToComplete: "2-3 min",
    difficulty: "Facile",
    rating: 4.6,
    popular: true,
  },
  {
    id: "55ad81eb-375a-488e-9e08-9d064984fcd6",
    name: "Audio Transcription",
    description:
      "Convertissez vos fichiers audio et vidéo en texte avec une précision exceptionnelle.",
    category: "transcription",
    tags: ["audio", "transcription", "vidéo", "sous-titres"],
    icon: Mic,
    color: "bg-purple-500 text-white",
    timeToComplete: "1-15 min",
    difficulty: "Facile",
    rating: 4.5,
    popular: false,
  },
  {
    id: "b54556c4-d874-4f05-9639-1d9f3879daf2",
    name: "Document Generator",
    description:
      "Créez des documents professionnels (PDF, DOCX, ODT) automatiquement à partir de templates.",
    category: "productivity",
    tags: ["documents", "pdf", "templates", "automatisation"],
    icon: FileText,
    color: "bg-indigo-500 text-white",
    timeToComplete: "3-7 min",
    difficulty: "Intermédiaire",
    rating: 4.4,
    popular: false,
  },
  {
    id: "email-marketing-tool",
    name: "Email Marketing IA",
    description:
      "Créez des campagnes email personnalisées et optimisées pour la conversion.",
    category: "marketing",
    tags: ["email", "marketing", "campagnes", "personnalisation"],
    icon: Mail,
    color: "bg-red-500 text-white",
    timeToComplete: "5-8 min",
    difficulty: "Intermédiaire",
    rating: 4.3,
    popular: false,
  },
  {
    id: "video-editor-ai",
    name: "Video Editor IA",
    description:
      "Éditez vos vidéos automatiquement avec l'intelligence artificielle.",
    category: "content",
    tags: ["vidéo", "édition", "montage", "automatique"],
    icon: Camera,
    color: "bg-yellow-500 text-white",
    timeToComplete: "10-30 min",
    difficulty: "Avancé",
    rating: 4.2,
    popular: false,
  },
  {
    id: "chatbot-builder",
    name: "Chatbot Builder",
    description:
      "Créez des chatbots intelligents pour votre site web et vos réseaux sociaux.",
    category: "productivity",
    tags: ["chatbot", "intelligence artificielle", "support", "automatisation"],
    icon: MessageSquare,
    color: "bg-teal-500 text-white",
    timeToComplete: "15-30 min",
    difficulty: "Intermédiaire",
    rating: 4.1,
    popular: false,
  },

  // ✅ NOUVEAUX MODULES AJOUTÉS
  {
    id: "competitor-analysis",
    name: "Analyse Concurrentielle",
    description:
      "Analysez vos concurrents en profondeur et identifiez les opportunités de marché avec surveillance continue.",
    category: "marketing",
    tags: ["concurrents", "veille", "analyse", "surveillance", "opportunités"],
    icon: BarChart3,
    color: "bg-slate-600 text-white",
    timeToComplete: "15-40 min",
    difficulty: "Intermédiaire",
    rating: 4.8,
    popular: true,
  },
  {
    id: "seo-analyzer",
    name: "Analyseur SEO + GEO",
    description:
      "Analysez votre SEO traditionnel + GEO (Generative Engine Optimization) pour les IA génératives comme ChatGPT et Perplexity.",
    category: "seo",
    tags: [
      "seo",
      "geo",
      "optimisation",
      "chatgpt",
      "perplexity",
      "claude",
      "référencement",
    ],
    icon: TrendingUp,
    color: "bg-emerald-600 text-white",
    timeToComplete: "15-50 min",
    difficulty: "Intermédiaire",
    rating: 4.9,
    popular: true,
    isNew: true,
  },
  {
    id: "data-analyzer",
    name: "Analyseur de Données",
    description:
      "Analysez vos données avec notre IA conversationnelle et obtenez des insights exploitables avec Machine Learning.",
    category: "analytics",
    tags: [
      "données",
      "analytics",
      "machine learning",
      "insights",
      "business intelligence",
    ],
    icon: Brain,
    color: "bg-purple-600 text-white",
    timeToComplete: "10-30 min",
    difficulty: "Intermédiaire",
    rating: 4.7,
    popular: true,
  },
  {
    id: "email-campaign",
    name: "Campagne Email",
    description:
      "Créez des campagnes email performantes avec notre assistant IA conversationnel et automation avancée.",
    category: "marketing",
    tags: [
      "email",
      "marketing",
      "campagne",
      "automation",
      "newsletter",
      "a/b testing",
    ],
    icon: Mail,
    color: "bg-blue-600 text-white",
    timeToComplete: "10-30 min",
    difficulty: "Facile",
    rating: 4.6,
    popular: true,
  },
  {
    id: "content-translator",
    name: "Traducteur de Contenu",
    description:
      "Traduisez votre contenu dans plus de 20 langues avec adaptation culturelle et révision humaine experte.",
    category: "content",
    tags: [
      "traduction",
      "localisation",
      "langues",
      "international",
      "culture",
      "révision",
    ],
    icon: Languages,
    color: "bg-green-600 text-white",
    timeToComplete: "5-30 min",
    difficulty: "Facile",
    rating: 4.8,
    popular: true,
  },
  {
    id: "talent-analyzer",
    name: "Talent Analyzer",
    description:
      "Analysez les talents avec notre IA RH conversationnelle : screening, matching, évaluation prédictive.",
    category: "hr",
    tags: [
      "rh",
      "recrutement",
      "talents",
      "cv",
      "matching",
      "prédictif",
      "screening",
    ],
    icon: Users,
    color: "bg-indigo-600 text-white",
    timeToComplete: "5-30 min",
    difficulty: "Intermédiaire",
    rating: 4.7,
    popular: true,
    isNew: true,
  },
];

// ✅ CATÉGORIES ÉTENDUES (avec nouveaux counts)
const STATIC_CATEGORIES: Category[] = [
  {
    id: "all",
    name: "Tous les outils",
    icon: Globe,
    count: STATIC_WORKERS.length,
  },
  {
    id: "social",
    name: "Réseaux sociaux",
    icon: Share2,
    count: STATIC_WORKERS.filter((w) => w.category === "social").length,
  },
  {
    id: "content",
    name: "Création de contenu",
    icon: PenTool,
    count: STATIC_WORKERS.filter((w) => w.category === "content").length,
  },
  {
    id: "marketing",
    name: "Marketing",
    icon: Target, // ✅ Icône plus appropriée
    count: STATIC_WORKERS.filter((w) => w.category === "marketing").length,
  },
  {
    id: "seo", // ✅ NOUVELLE CATÉGORIE
    name: "SEO & Référencement",
    icon: TrendingUp,
    count: STATIC_WORKERS.filter((w) => w.category === "seo").length,
  },
  {
    id: "analytics", // ✅ NOUVELLE CATÉGORIE
    name: "Analytics & Données",
    icon: Brain,
    count: STATIC_WORKERS.filter((w) => w.category === "analytics").length,
  },
  {
    id: "hr", // ✅ NOUVELLE CATÉGORIE
    name: "Ressources Humaines",
    icon: Users,
    count: STATIC_WORKERS.filter((w) => w.category === "hr").length,
  },
  {
    id: "transcription",
    name: "Transcription",
    icon: Mic,
    count: STATIC_WORKERS.filter((w) => w.category === "transcription").length,
  },
  {
    id: "productivity",
    name: "Productivité",
    icon: Zap,
    count: STATIC_WORKERS.filter((w) => w.category === "productivity").length,
  },
];

export function useWorkers(): UseWorkersResult {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular");

  // ✅ FILTRAGE ET TRI (logique identique + support nouveaux modules)
  const filteredWorkers = useMemo(() => {
    let filtered = STATIC_WORKERS;

    // Filtrage par catégorie
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (worker: Worker) => worker.category === selectedCategory
      );
    }

    // Filtrage par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (worker: Worker) =>
          worker.name.toLowerCase().includes(query) ||
          worker.description.toLowerCase().includes(query) ||
          worker.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }

    // Tri
    filtered.sort((a: Worker, b: Worker) => {
      switch (sortBy) {
        case "popular":
          // D'abord nouveaux, puis populaires, puis par rating
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return b.rating - a.rating;
        case "rating":
          return b.rating - a.rating;
        case "name":
          return a.name.localeCompare(b.name);
        case "time":
          const aTime = parseInt(a.timeToComplete.match(/\d+/)?.[0] || "0");
          const bTime = parseInt(b.timeToComplete.match(/\d+/)?.[0] || "0");
          return aTime - bTime;
        case "newest": // ✅ NOUVEAU TRI
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  // ✅ CALCUL DES STATISTIQUES (mis à jour)
  const stats = useMemo(() => {
    return {
      totalWorkers: STATIC_WORKERS.length,
      popularWorkers: STATIC_WORKERS.filter((w) => w.popular).length,
      totalCategories: STATIC_CATEGORIES.filter((c) => c.id !== "all").length,
      averageRating:
        STATIC_WORKERS.reduce((sum, w) => sum + w.rating, 0) /
        STATIC_WORKERS.length,
    };
  }, []);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSortBy("popular");
  };

  return {
    workers: STATIC_WORKERS,
    categories: STATIC_CATEGORIES,
    filteredWorkers,
    loading: false,
    error: null,
    stats,
    selectedCategory,
    searchQuery,
    sortBy,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    resetFilters,
  };
}
