import { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { contentService } from "./contentService";
import { supabase } from "../lib/supabase";
import { getModuleBySlug } from "../config/modules.config.jsx";

import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@oppsys/ui";
import ContentCard from "./ContentCard";
import Input from "@oppsys/ui";
import Label from "@oppsys/ui";
import { LoadingSpinner } from "@/components/loading";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import apiService from "../services/apiService";

import {
  FileText,
  Video,
  Image as ImageIcon,
  Mic,
  BarChart3,
  Search,
  Folder,
  Clock,
  Plus,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Share2,
  XCircle,
  Eye,
  Calendar,
  Crown,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Download,
  ExternalLink,
  Edit,
  Trash,
} from "lucide-react";

// =====================================================
// CONSTANTES
// =====================================================
const CONTENT_TYPES = [
  {
    id: "all",
    label: "Tout le contenu",
    icon: Folder,
    color: "text-muted-foreground",
  },
  { id: "article", label: "Articles", icon: FileText, color: "text-primary" },
  { id: "video", label: "Vidéos", icon: Video, color: "text-red-600" },
  { id: "image", label: "Images", icon: ImageIcon, color: "text-green-600" },
  { id: "audio", label: "Audio", icon: Mic, color: "text-purple-600" },
  { id: "data", label: "Données", icon: BarChart3, color: "text-orange-600" },
  {
    id: "social-post",
    label: "Posts réseaux",
    icon: Share2,
    color: "text-blue-600",
  },
];
const LOADING_STATES = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

const Tooltip = ({ children, content, disabled }) => {
  if (disabled) return children;

  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-2 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
};

// =====================================================
// FONCTIONS UTILITAIRES
// =====================================================
const getCorrectModuleSlug = (content) => {
  if (content.metadata?.target_module_slug) {
    return content.metadata.target_module_slug;
  }
  if (content.module_slug) {
    return content.module_slug;
  }
  if (content.modules?.slug) {
    return content.modules.slug;
  }

  const title = (content.title || "").toLowerCase();
  if (title.includes("facebook")) return "facebook";
  if (title.includes("instagram")) return "instagram-post";
  if (title.includes("linkedin")) return "linkedin-article";
  if (title.includes("twitter") || title.includes("x ")) return "x-twitter";

  if (content.type === "social_post" || content.type === "social-post") {
    if (content.metadata) {
      const networks =
        content.metadata.networks || content.metadata.selectedNetworks;
      if (networks && Array.isArray(networks)) {
        if (networks.includes("facebook")) return "facebook";
        if (networks.includes("instagram")) return "instagram-post";
        if (networks.includes("linkedin")) return "linkedin-article";
        if (networks.includes("twitter") || networks.includes("x"))
          return "x-twitter";
      }
      if (content.metadata.target_platform) {
        const platform = content.metadata.target_platform.toLowerCase();
        const platformMapping = {
          facebook: "facebook",
          instagram: "instagram-post",
          linkedin: "linkedin-article",
          twitter: "x-twitter",
          x: "x-twitter",
        };
        const mappedModule = platformMapping[platform];
        if (mappedModule) return mappedModule;
      }
    }
    return "social-factory";
  }

  const typeMapping = {
    article: "ai-writer",
    document: "document-generator",
    video: "youtube-uploader",
    audio: "transcription",
  };

  if (content.type && typeMapping[content.type]) {
    return typeMapping[content.type];
  }

  return "social-factory";
};

// =====================================================
// COMPOSANT PREVIEW CONTENU
// =====================================================
const ContentPreview = ({ content }) => {
  const moduleSlug = getCorrectModuleSlug(content);

  // DEBUG COMPLET - À garder temporairement
  console.log("🔍 ContentPreview DEBUG COMPLET:", {
    content: content,
    moduleSlug,
    contentType: content.type,
    hasMetadata: !!content.metadata,
    metadataType: typeof content.metadata,
    metadataKeys: content.metadata ? Object.keys(content.metadata) : [],
    hasHtmlPreview: !!content.html_preview,
  });

  // Pour le module real-estate-lease-generator
  if (moduleSlug === "real-estate-lease-generator") {
    return (
      <div className="space-y-4">
        <div className="bg-muted/50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center">
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Document généré
            </h4>
            <div className="text-xs text-muted-foreground">
              {new Date(content.created_at).toLocaleDateString()}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div>
              <strong>Titre :</strong> {content.title}
            </div>
            <div>
              <strong>Type :</strong>{" "}
              {content.metadata?.leaseType || "Bail immobilier"}
            </div>
            <div>
              <strong>Format :</strong>{" "}
              {content.metadata?.outputFormat?.toUpperCase() || "DOCX"}
            </div>
            {content.metadata?.propertyInfo?.address && (
              <div>
                <strong>Adresse :</strong>{" "}
                {content.metadata.propertyInfo.address}
              </div>
            )}
          </div>
        </div>

        {content.metadata && (
          <div className="space-y-3">
            {(content.metadata.ownerInfo || content.metadata.tenantInfo) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.metadata.ownerInfo && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-medium text-blue-800 mb-2">
                      Propriétaire
                    </h5>
                    <div className="text-sm space-y-1">
                      <div>{content.metadata.ownerInfo.name}</div>
                      {content.metadata.ownerInfo.email && (
                        <div className="text-muted-foreground">
                          {content.metadata.ownerInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {content.metadata.tenantInfo && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-2">
                      Locataire
                    </h5>
                    <div className="text-sm space-y-1">
                      <div>{content.metadata.tenantInfo.name}</div>
                      {content.metadata.tenantInfo.email && (
                        <div className="text-muted-foreground">
                          {content.metadata.tenantInfo.email}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {content.metadata.leaseInfo && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <h5 className="font-medium text-amber-800 mb-2">
                  Détails du bail
                </h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {content.metadata.leaseInfo.duration && (
                    <div>
                      <strong>Durée :</strong>{" "}
                      {content.metadata.leaseInfo.duration} an(s)
                    </div>
                  )}
                  {content.metadata.leaseInfo.startDate && (
                    <div>
                      <strong>Début :</strong>{" "}
                      {content.metadata.leaseInfo.startDate}
                    </div>
                  )}
                  {content.metadata.propertyInfo?.rent && (
                    <div>
                      <strong>Loyer :</strong>{" "}
                      {content.metadata.propertyInfo.rent}€
                    </div>
                  )}
                  {content.metadata.propertyInfo?.deposit && (
                    <div>
                      <strong>Dépôt :</strong>{" "}
                      {content.metadata.propertyInfo.deposit}€
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {content.file_url && (
              <a
                href={content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger le document
              </a>
            )}

            {content.file_url && content.metadata?.outputFormat === "pdf" && (
              <a
                href={content.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévisualiser
              </a>
            )}
          </div>

          {!content.file_url && (
            <div className="text-center py-4">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Document en cours de génération...
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Pour les posts de réseaux sociaux
  if (
    content.type === "social-post" ||
    content.type === "social_post" ||
    moduleSlug === "social-factory"
  ) {
    console.log("📱 Traitement post social...");

    // Parsing sécurisé et exhaustif des métadonnées
    let metadata = {};
    try {
      if (typeof content.metadata === "string") {
        console.log(
          "📝 Parsing string metadata:",
          content.metadata.substring(0, 200) + "..."
        );
        metadata = JSON.parse(content.metadata);
      } else if (content.metadata && typeof content.metadata === "object") {
        console.log("📝 Using object metadata directly");
        metadata = content.metadata;
      }
    } catch (e) {
      console.error("❌ Erreur parsing metadata:", e);
      metadata = {};
    }

    console.log("✅ Metadata parsée:", metadata);

    // Recherche exhaustive du contenu dans TOUS les endroits possibles
    let postContent = "";
    let hashtags = [];
    let callToAction = "";
    let description = "";
    let emojis = "";
    let platform = "Social Media";
    let hasError = false;

    // TOUTES les sources possibles pour le contenu
    const contentSources = [
      // Dans les métadonnées
      { source: "metadata.post_content", value: metadata.post_content },
      { source: "metadata.content", value: metadata.content },
      { source: "metadata.caption", value: metadata.caption },
      {
        source: "metadata.generated_content.post",
        value: metadata.generated_content?.post,
      },
      {
        source: "metadata.generated_content.caption",
        value: metadata.generated_content?.caption,
      },
      {
        source: "metadata.generated_content.content",
        value: metadata.generated_content?.content,
      },

      // Directement dans l'objet content
      { source: "content.content", value: content.content },
      { source: "content.html_preview", value: content.html_preview },
      { source: "content.preview", value: content.preview },

      // Dans les résultats/output
      { source: "metadata.output.post", value: metadata.output?.post },
      { source: "metadata.result.post", value: metadata.result?.post },
      { source: "metadata.result.content", value: metadata.result?.content },

      // Format workflow
      {
        source: "metadata.workflow_result.post",
        value: metadata.workflow_result?.post,
      },
      {
        source: "metadata.execution_result.content",
        value: metadata.execution_result?.content,
      },
    ];

    console.log("🔍 Recherche de contenu dans les sources:", contentSources);

    // Trouver la première source qui contient du contenu
    let foundSource = null;
    for (const sourceInfo of contentSources) {
      const value = sourceInfo.value;
      if (value && typeof value === "string" && value.trim().length > 0) {
        console.log(`✅ Contenu trouvé dans: ${sourceInfo.source}`);
        console.log(`📝 Contenu: ${value.substring(0, 200)}...`);

        // Si c'est du HTML, essayer d'extraire le texte
        if (value.includes("<") && value.includes(">")) {
          try {
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = value;
            const extractedText =
              tempDiv.textContent || tempDiv.innerText || "";
            if (extractedText.trim()) {
              postContent = extractedText.trim();
              foundSource = `${sourceInfo.source} (extracted from HTML)`;
              break;
            }
          } catch (e) {
            console.error("Erreur extraction HTML:", e);
          }
        }

        // Si c'est du JSON, essayer de le parser
        if (value.startsWith("{") && value.endsWith("}")) {
          try {
            const parsedValue = JSON.parse(value);
            const possibleContent =
              parsedValue.post || parsedValue.caption || parsedValue.content;
            if (possibleContent) {
              postContent = possibleContent;
              foundSource = `${sourceInfo.source} (parsed JSON)`;

              // Extraire aussi les autres données du JSON
              hashtags = parsedValue.hashtags
                ? parsedValue.hashtags
                    .split(" ")
                    .filter((tag) => tag.startsWith("#"))
                : [];
              callToAction =
                parsedValue.call_to_action || parsedValue.cta || "";
              emojis = Array.isArray(parsedValue.emojis)
                ? parsedValue.emojis.join(" ")
                : parsedValue.emojis || "";
              break;
            }
          } catch (e) {
            console.error("Erreur parsing JSON:", e);
          }
        }

        // Sinon, utiliser la valeur directement
        postContent = value;
        foundSource = sourceInfo.source;
        break;
      }
    }

    // Recherche des métadonnées complémentaires si pas encore trouvées
    if (!hashtags.length) {
      const hashtagSources = [
        metadata.hashtags,
        metadata.generated_content?.hashtags,
        metadata.tags,
      ];
      for (const tags of hashtagSources) {
        if (tags) {
          if (Array.isArray(tags)) {
            hashtags = tags;
            break;
          } else if (typeof tags === "string") {
            hashtags = tags.split(/\s+/).filter((tag) => tag.startsWith("#"));
            if (hashtags.length) break;
          }
        }
      }
    }

    if (!callToAction) {
      callToAction =
        metadata.call_to_action ||
        metadata.callToAction ||
        metadata.cta ||
        metadata.generated_content?.call_to_action ||
        "";
    }

    if (!emojis) {
      const emojiValue = metadata.emojis || metadata.generated_content?.emojis;
      if (Array.isArray(emojiValue)) {
        emojis = emojiValue.join(" ");
      } else if (emojiValue) {
        emojis = emojiValue;
      }
    }

    // Déterminer la plateforme
    platform =
      metadata.platform ||
      metadata.target_platform ||
      (metadata.networks && metadata.networks[0]) ||
      (metadata.selectedNetworks && metadata.selectedNetworks[0]) ||
      "Social Media";

    // Vérifier les erreurs
    hasError =
      !postContent ||
      postContent === "Contenu non disponible" ||
      postContent.toLowerCase().includes("erreur") ||
      metadata.error_details;

    console.log("📊 RÉSULTAT FINAL:", {
      foundSource,
      postContent: postContent.substring(0, 100) + "...",
      hashtags,
      callToAction,
      emojis,
      platform,
      hasError,
    });

    return (
      <div className="space-y-4">
        {/* Section DEBUG temporaire - SUPPRIMER après résolution */}
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-xs">
          <details>
            <summary className="cursor-pointer font-bold text-yellow-700 mb-2">
              🔧 DEBUG INFO (cliquez pour voir) - À supprimer une fois résolu
            </summary>
            <div className="space-y-1 text-yellow-800">
              <div>
                <strong>Source trouvée:</strong>{" "}
                {foundSource || "AUCUNE SOURCE TROUVÉE"}
              </div>
              <div>
                <strong>Contenu extrait:</strong>{" "}
                {postContent.substring(0, 200)}...
              </div>
              <div>
                <strong>Plateforme:</strong> {platform}
              </div>
              <div>
                <strong>Hashtags:</strong> {hashtags.join(", ")}
              </div>
              <div>
                <strong>Call to Action:</strong> {callToAction}
              </div>
              <div>
                <strong>Emojis:</strong> {emojis}
              </div>
              <div>
                <strong>A une erreur:</strong> {hasError ? "OUI" : "NON"}
              </div>
            </div>
          </details>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium flex items-center">
              <Share2 className="h-4 w-4 mr-2 text-blue-600" />
              Post {platform}
            </h4>
            <div className="text-xs text-muted-foreground">
              {new Date(content.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Contenu principal du post */}
          <div
            className={`p-4 rounded-lg border mb-4 ${hasError ? "bg-red-50 border-red-200" : "bg-white"}`}
          >
            {hasError || !postContent ? (
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    Problème d'affichage du contenu
                  </p>
                  <p className="text-sm text-red-600">
                    {postContent || "Aucun contenu trouvé dans les métadonnées"}
                  </p>
                  {!foundSource && (
                    <p className="text-xs text-red-500 mt-1">
                      Aucune source de contenu détectée. Vérifiez la structure
                      des données dans la console.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line text-sm font-medium">
                    {postContent}
                  </p>
                </div>

                {emojis && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Emojis :</span>
                    <span className="text-lg">{emojis}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Hashtags */}
          {!hasError && hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              <span className="text-sm font-medium text-muted-foreground mr-2">
                Hashtags :
              </span>
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Call to Action */}
          {!hasError && callToAction && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-3">
              <div className="flex items-center mb-1">
                <TrendingUp className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-sm font-medium text-amber-800">
                  Call to Action :
                </span>
              </div>
              <p className="text-sm text-amber-700">{callToAction}</p>
            </div>
          )}

          {/* Informations techniques */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t">
            <div>
              <strong>Plateforme :</strong> {platform}
            </div>
            <div>
              <strong>Statut :</strong> {content.status}
            </div>
            <div>
              <strong>Source de contenu :</strong>{" "}
              {foundSource || "Non trouvée"}
            </div>
            <div>
              <strong>Taille métadonnées :</strong>{" "}
              {JSON.stringify(metadata).length} caractères
            </div>
          </div>
        </div>

        {/* Actions de gestion */}
        {content.status === "pending" && (
          <div
            className={`border-t pt-4 flex items-center justify-center p-4 rounded-lg ${
              hasError
                ? "bg-red-50 border border-red-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            {hasError ? (
              <>
                <XCircle className="h-4 w-4 text-red-600 mr-2" />
                <span className="text-sm text-red-800">
                  Ce contenu a rencontré une erreur lors de l'extraction. Vous
                  pouvez le refuser et réessayer.
                </span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Ce contenu est en attente d'approbation. Utilisez les boutons
                  ci-dessous pour l'approuver ou le refuser.
                </span>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // Pour les posts avec html_preview
  if (content.html_preview) {
    return (
      <div
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: content.html_preview }}
      />
    );
  }

  // Fallback générique
  return (
    <div className="text-center py-8">
      <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
      <p className="text-sm text-muted-foreground">Aucun aperçu disponible.</p>
      <p className="text-xs text-muted-foreground mt-1">
        Type: {content.type} | Module: {moduleSlug}
      </p>

      {content.file_url && (
        <div className="mt-4">
          <a
            href={content.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Voir le fichier
          </a>
        </div>
      )}
    </div>
  );
};

// =====================================================
// COMPOSANTS D'ÉTAT ET D'ERREUR
// =====================================================
const LoadingScreen = ({ message }) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  </div>
);

const ErrorScreen = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
    <h3 className="text-lg font-medium">Erreur de chargement</h3>
    <p className="text-muted-foreground mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all"
    >
      Réessayer
    </button>
  </div>
);

// =====================================================
// HOOK POUR ACTIVITÉ RÉCENTE
// =====================================================
const useRecentActivity = (limit = 15) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.get("/dashboard/activity", { limit });
      if (response && response.success) {
        setActivities(response.data || []);
      } else {
        setActivities([]);
      }
    } catch (err) {
      setError(err.message);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  return { activities, loading, error, refetch: fetchActivity };
};

// =====================================================
// COMPOSANT ACTIVITÉ RÉCENTE
// =====================================================
const RecentActivityHorizontal = () => {
  const { activities, loading, error } = useRecentActivity(15);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return "Date inconnue";
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "à l'instant";
    if (diffInMinutes < 60) return `il y a ${diffInMinutes}min`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInMinutes / 1440);
    return `il y a ${diffInDays}j`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "failed":
        return <XCircle className="h-3 w-3 text-red-500" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const formatActivity = (activity) => {
    if (activity.type === "usage") {
      return {
        title: activity.module_name || "Module",
        description: `${activity.credits_used || 0} crédits`,
        icon: activity.module_type === "ai" ? Sparkles : BarChart3,
        status: activity.status,
      };
    } else if (activity.type === "content") {
      return {
        title: activity.title || "Contenu",
        description:
          activity.content_type === "social_post"
            ? "Post social"
            : activity.content_type || "Contenu",
        icon: FileText,
        status: "success",
      };
    }
    return {
      title: activity.title || "Activité",
      description: activity.description || "",
      icon: Clock,
      status: "pending",
    };
  };

  if (loading) {
    return (
      <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activité récente</h3>
          <Clock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 p-3 border border-border rounded-lg animate-pulse"
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-muted rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-card rounded-xl p-6 border border-destructive/20 bg-destructive/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activité récente</h3>
          <AlertCircle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">Erreur de chargement: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Activité récente</h3>
        <div className="flex items-center space-x-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <Link
            to="/dashboard"
            className="text-primary hover:text-primary/80 text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <span>Voir dashboard</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Aucune activité récente
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Votre activité apparaîtra ici lorsque vous utiliserez les modules.
          </p>
        </div>
      ) : (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {activities.map((activity, index) => {
            const formattedActivity = formatActivity(activity);
            const Icon = formattedActivity.icon;
            return (
              <div
                key={activity.id || `activity-${index}`}
                className="flex-shrink-0 w-64 p-3 border border-border rounded-lg hover:border-primary/50 transition-all bg-background/50"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-primary to-orange-600 p-2 rounded-lg">
                      <Icon className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {formattedActivity.title}
                      </p>
                      {getStatusIcon(formattedActivity.status)}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {formattedActivity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTimeAgo(activity.created_at || activity.date)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// =====================================================
// HOOKS PERSONNALISÉS
// =====================================================
const useContentState = (user) => {
  const [state, setState] = useState({
    contents: [],
    loadingState: LOADING_STATES.IDLE,
    error: null,
  });
  const fetchContent = async (limit = 1000) => {
    if (!user?.id) return;
    setState((prev) => ({ ...prev, loadingState: LOADING_STATES.LOADING }));
    try {
      const data = await contentService.getUserContent(user.id, limit);
      if (Array.isArray(data)) {
        setState({
          contents: data,
          loadingState: LOADING_STATES.SUCCESS,
          error: null,
        });
      } else {
        setState({
          contents: [],
          loadingState: LOADING_STATES.SUCCESS,
          error: null,
        });
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        contents: [],
        loadingState: LOADING_STATES.ERROR,
        error: error.message || "Erreur",
      }));
    }
  };
  const updateContent = (contentId, updates) => {
    setState((prev) => ({
      ...prev,
      contents: prev.contents.map((c) =>
        c.id === contentId ? { ...c, ...updates } : c
      ),
    }));
  };
  const removeContent = (contentId) => {
    setState((prev) => ({
      ...prev,
      contents: prev.contents.filter((c) => c.id !== contentId),
    }));
  };
  return { ...state, fetchContent, updateContent, removeContent };
};

const useRealtimeSubscription = (user, updateContent) => {
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`content_changes_${user.id}`);
    const handleDbChange = (payload) => {
      const updatedContent = payload.new;
      if (updatedContent && updatedContent.user_id === user.id) {
        updateContent(updatedContent.id, updatedContent);
        if (
          payload.eventType === "UPDATE" &&
          payload.old.status !== "published" &&
          updatedContent.status === "published"
        ) {
          toast.success(
            `Votre contenu "${contentService.getModuleDisplayName(updatedContent.module_slug)}" a été publié !`
          );
        }
      }
    };
    channel
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "generated_content",
          filter: `user_id=eq.${user.id}`,
        },
        handleDbChange
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, updateContent]);
};

// =====================================================
// COMPOSANT DE PAGINATION
// =====================================================
const PaginationControls = ({ currentPage, pageCount, setCurrentPage }) => {
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-center space-x-4 mt-8">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="inline-flex items-center justify-center p-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-muted-foreground">
        Page {currentPage} sur {pageCount}
      </span>
      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, pageCount))}
        disabled={currentPage === pageCount}
        className="inline-flex items-center justify-center p-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

// =====================================================
// COMPOSANT MODAL DE PLANIFICATION
// =====================================================
const SchedulingDialog = ({ isOpen, onClose, content, onSchedule }) => {
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [loading, setLoading] = useState(false);
  const permissions = usePremiumFeatures();

  const handleSchedule = async () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error("Veuillez sélectionner une date et une heure.");
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error("La date doit être dans le futur.");
      return;
    }

    setLoading(true);
    try {
      await onSchedule(content.id, scheduledDateTime.toISOString());
      toast.success("Contenu planifié avec succès !", {
        description: `Publication prévue le ${scheduledDateTime.toLocaleString()}`,
      });
      onClose();
    } catch (error) {
      toast.error("Erreur lors de la planification.");
    } finally {
      setLoading(false);
    }
  };

  if (!permissions.scheduling.canSchedule) {
    return (
      <Dialog isOpen={isOpen} onClose={onClose}>
        <DialogHeader onClose={onClose}>
          <DialogTitle>Planification Premium</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="text-center py-8">
            <Crown className="h-16 w-16 mx-auto mb-4 text-amber-500" />
            <h3 className="text-lg font-bold mb-2">Fonctionnalité Premium</h3>
            <p className="text-muted-foreground mb-4">
              La planification de contenu est réservée aux abonnés Premium.
            </p>
          </div>
        </DialogContent>
        <DialogFooter>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Fermer
          </button>
          <Link
            to="/billing"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Crown className="h-4 w-4 mr-2" />
            Passer à Premium
          </Link>
        </DialogFooter>
      </Dialog>
    );
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <DialogTitle>Planifier la publication</DialogTitle>
        <DialogDescription>
          {content?.title || "Contenu sélectionné"}
        </DialogDescription>
      </DialogHeader>
      <DialogContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleDate">Date de publication</Label>
              <Input
                id="scheduleDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleTime">Heure de publication</Label>
              <Input
                id="scheduleTime"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
            </div>
          </div>

          {scheduledDate && scheduledTime && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Publication prévue le{" "}
                  {new Date(
                    `${scheduledDate}T${scheduledTime}`
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <button
          onClick={onClose}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-muted-foreground bg-background border border-border rounded-lg hover:bg-muted transition-colors"
          disabled={loading}
        >
          Annuler
        </button>
        <button
          onClick={handleSchedule}
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          disabled={loading || !scheduledDate || !scheduledTime}
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Planifier
            </>
          )}
        </button>
      </DialogFooter>
    </Dialog>
  );
};

// =====================================================
// COMPOSANT PRINCIPAL
// =====================================================
export default function ContentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    contents,
    loadingState,
    error,
    fetchContent,
    updateContent,
    removeContent,
  } = useContentState(user);
  const permissions = usePremiumFeatures();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [selectedContent, setSelectedContent] = useState(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [schedulingContent, setSchedulingContent] = useState(null);
  const [processingDecisions, setProcessingDecisions] = useState(new Set());

  useRealtimeSubscription(user, updateContent);

  useEffect(() => {
    if (user?.id) fetchContent();
  }, [user?.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  // Fonction corrigée avec métadonnées enrichies
  const handleUserDecision = async (contentId, isApproved) => {
    if (processingDecisions.has(contentId)) {
      return;
    }

    setProcessingDecisions((prev) => new Set([...prev, contentId]));
    setApprovalLoading(true);

    try {
      const content = contents.find((c) => c.id === contentId);
      if (!content) throw new Error("Contenu non trouvé");

      const enrichedMetadata = {
        ...(content.metadata || {}),
        user_id: content.user_id,
        client_email: user?.email,
        client_name: user?.full_name,
        client_id: user?.id,
        plan_id: user?.plan_id,
        title: content.title,
        type: content.type,
        module_slug: content.module_slug,
        decision_timestamp: new Date().toISOString(),
        approved_by: user?.id,
        original_status: content.status,
      };

      const result = await contentService.processContentDecision(
        contentId,
        user.id,
        isApproved,
        isApproved ? "Approuvé par l'utilisateur" : "Refusé par l'utilisateur",
        enrichedMetadata
      );

      if (isApproved) {
        updateContent(contentId, result.content);
        toast.success("Contenu approuvé ! Publication en cours.", {
          description: "Le workflow va reprendre automatiquement.",
        });
      } else {
        await contentService.deleteContent(contentId);
        removeContent(contentId);
        toast.success("Contenu refusé et supprimé.");
      }

      setSelectedContent(null);
    } catch (err) {
      if (err.message.includes("Timeout") || err.message.includes("422")) {
        toast.error("Le processus prend plus de temps que prévu.", {
          description:
            "Votre contenu sera traité en arrière-plan. Vérifiez dans quelques minutes.",
        });
      } else {
        toast.error(`Une erreur est survenue: ${err.message}`);
      }
    } finally {
      setApprovalLoading(false);
      setProcessingDecisions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(contentId);
        return newSet;
      });
    }
  };

  const handleDeleteContent = async (contentId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      try {
        await contentService.deleteContent(contentId);
        removeContent(contentId);
        toast.success("Contenu supprimé.");
      } catch (err) {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  const handleToggleFavorite = async (contentId, isFavorite) => {
    try {
      await contentService.toggleFavorite(contentId, isFavorite);
      updateContent(contentId, { is_favorite: isFavorite });
    } catch (err) {
      toast.error("Erreur lors de la mise à jour des favoris.");
    }
  };

  const handleScheduleContent = async (contentId, executionTime) => {
    try {
      const content = contents.find((c) => c.id === contentId);
      if (!content) throw new Error("Contenu non trouvé");

      // Utiliser l'endpoint correct selon votre backend
      const response = await apiService.post(
        `/schedule/${content.module_slug}/schedule`,
        {
          input: content.metadata?.input || content.metadata || {},
          execution_time: executionTime,
        }
      );

      if (response.success) {
        updateContent(contentId, {
          status: "scheduled",
          scheduled_at: executionTime,
        });
      } else {
        throw new Error(response.error || "Erreur de planification");
      }
    } catch (error) {
      console.error("Erreur de planification:", error);
      throw error;
    }
  };

  const filteredAndSortedContent = useMemo(() => {
    if (!contents) return [];
    return contents
      .filter((content) => {
        const matchesSearch = content.title
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType =
          selectedType === "all" || content.type === selectedType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [contents, searchTerm, selectedType]);

  const pageCount = Math.ceil(filteredAndSortedContent.length / itemsPerPage);
  const paginatedContent = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedContent.slice(
      startIndex,
      startIndex + itemsPerPage
    );
  }, [currentPage, filteredAndSortedContent, itemsPerPage]);

  if (loadingState === LOADING_STATES.LOADING)
    return <LoadingScreen message="Chargement de vos contenus..." />;
  if (loadingState === LOADING_STATES.ERROR)
    return <ErrorScreen error={error} onRetry={fetchContent} />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Mon Contenu</h1>
          <p className="text-muted-foreground">
            Gérez tout le contenu que vous avez généré.
          </p>
        </div>
        <Link
          to="/modules"
          className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all"
        >
          <Plus className="h-4 w-4 mr-2" />
          <span>Créer</span>
        </Link>
      </div>

      <RecentActivityHorizontal />

      <div className="card">
        <div className="flex space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher par titre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="form-input"
          >
            {CONTENT_TYPES.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {paginatedContent.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Aucun contenu trouvé</h3>
          <p className="text-muted-foreground mb-4">
            Créez du contenu depuis la page des modules.
          </p>
          <Link
            to="/modules"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Commencer à créer
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onView={setSelectedContent}
                onDelete={handleDeleteContent}
                onToggleFavorite={handleToggleFavorite}
                onSchedule={setSchedulingContent}
                showScheduleButton={
                  permissions.scheduling.canSchedule &&
                  content.module_slug === "social-factory"
                }
                getModuleDisplayName={contentService.getModuleDisplayName}
                getContentTypeConfig={(type) =>
                  CONTENT_TYPES.find((t) => t.id === type) || CONTENT_TYPES[0]
                }
              />
            ))}
          </div>
          <PaginationControls
            currentPage={currentPage}
            pageCount={pageCount}
            setCurrentPage={setCurrentPage}
          />
        </>
      )}

      {selectedContent && (
        <Dialog
          isOpen={!!selectedContent}
          onClose={() => setSelectedContent(null)}
        >
          <DialogHeader onClose={() => setSelectedContent(null)}>
            <DialogTitle>{selectedContent.title}</DialogTitle>
            <DialogDescription>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    Réseau :{" "}
                    {(() => {
                      const moduleSlug = getCorrectModuleSlug(selectedContent);
                      const moduleConfig = getModuleBySlug(moduleSlug);
                      return moduleConfig?.name || "Réseau inconnu";
                    })()}
                  </span>
                </div>

                <div className="bg-muted/50 p-3 rounded-lg border">
                  <div className="text-xs font-medium text-muted-foreground mb-1">
                    Informations client :
                  </div>
                  <div className="text-sm space-y-1">
                    <div>
                      <strong>Nom :</strong> {user?.full_name || "Nom inconnu"}
                    </div>
                    <div>
                      <strong>Email :</strong> {user?.email || "Email inconnu"}
                    </div>
                  </div>
                </div>

                {selectedContent.metadata?.target_platform && (
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-xs text-blue-800">
                      <strong>Réseau cible détecté :</strong>{" "}
                      {selectedContent.metadata.target_platform}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    Statut: <strong>{selectedContent.status}</strong>
                  </span>
                  <span>
                    Créé:{" "}
                    {new Date(selectedContent.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogContent>
            <ContentPreview content={selectedContent} />
          </DialogContent>
          <DialogFooter>
            {/* Bouton Modifier pleine largeur au-dessus */}
            <div className="w-full mb-4">
              <Tooltip content="Modifier le contenu dans le module d'origine">
                <button
                  className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-sm hover:shadow-md transition-all"
                  onClick={() => {
                    const moduleSlug = getCorrectModuleSlug(selectedContent);
                    navigate(
                      `/modules/${moduleSlug}?content_id=${selectedContent.id}&action=edit`,
                      {
                        state: {
                          contentData: selectedContent,
                          editMode: true,
                        },
                      }
                    );
                    setSelectedContent(null);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
              </Tooltip>
            </div>

            {/* Boutons icônes horizontaux */}
            <div className="flex justify-center space-x-3">
              {/* Bouton Refuser et Supprimer - seulement pour contenu en attente */}
              {selectedContent.status === "pending" && (
                <Tooltip content="Refuser et supprimer ce contenu">
                  <button
                    onClick={() =>
                      handleUserDecision(selectedContent.id, false)
                    }
                    className="inline-flex items-center justify-center w-12 h-12 text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-all disabled:opacity-50"
                    disabled={approvalLoading}
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </Tooltip>
              )}

              {/* Bouton Télécharger - pour documents avec file_url */}
              {selectedContent.file_url && (
                <Tooltip content="Télécharger le fichier">
                  <a
                    href={selectedContent.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-12 h-12 text-green-600 bg-green-50 border border-green-200 rounded-full hover:bg-green-100 transition-all"
                  >
                    <Download className="h-5 w-5" />
                  </a>
                </Tooltip>
              )}

              {/* Bouton Planifier - seulement pour posts sociaux */}
              {getCorrectModuleSlug(selectedContent) === "social-factory" &&
                permissions.scheduling.canSchedule && (
                  <Tooltip content="Planifier la publication">
                    <button
                      onClick={() => {
                        setSchedulingContent(selectedContent);
                        // Optionnel : fermer la modale de détails
                        setSelectedContent(null);
                      }}
                      className="inline-flex items-center justify-center w-12 h-12 text-blue-600 bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-all"
                    >
                      <Calendar className="h-5 w-5" />
                    </button>
                  </Tooltip>
                )}

              {/* Bouton Publier sur les réseaux - pour posts sociaux en attente ou approuvés */}
              {(selectedContent.type === "social-post" ||
                selectedContent.type === "social_post") &&
                (selectedContent.status === "pending" ||
                  selectedContent.status === "approved") && (
                  <Tooltip content="Approuver et publier sur les réseaux sociaux">
                    <button
                      className="inline-flex items-center justify-center w-12 h-12 text-white bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                      disabled={approvalLoading}
                      onClick={async () => {
                        try {
                          setApprovalLoading(true);

                          // Si le contenu est encore pending, l'approuver d'abord
                          if (selectedContent.status === "pending") {
                            const enrichedMetadata = {
                              ...(selectedContent.metadata || {}),
                              user_id: selectedContent.user_id,
                              client_email: user?.email,
                              client_name: user?.full_name,
                              client_id: user?.id,
                              plan_id: user?.plan_id,
                              title: selectedContent.title,
                              type: selectedContent.type,
                              module_slug: selectedContent.module_slug,
                              decision_timestamp: new Date().toISOString(),
                              approved_by: user?.id,
                              original_status: selectedContent.status,
                            };

                            await contentService.processContentDecision(
                              selectedContent.id,
                              user.id,
                              true,
                              "Approuvé et publié par l'utilisateur",
                              enrichedMetadata
                            );
                          }

                          // Déclencher la publication sur les réseaux
                          const response = await apiService.post(
                            `/content/${selectedContent.id}/publish`
                          );
                          if (response.success) {
                            updateContent(selectedContent.id, {
                              status: "publishing",
                            });
                            toast.success(
                              "Contenu approuvé et publication en cours sur les réseaux sociaux..."
                            );
                            setSelectedContent(null);
                          } else {
                            throw new Error(
                              response.error || "Erreur de publication"
                            );
                          }
                        } catch (error) {
                          toast.error(
                            `Erreur lors de l'approbation/publication: ${error.message}`
                          );
                        } finally {
                          setApprovalLoading(false);
                        }
                      }}
                    >
                      {approvalLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Share2 className="h-5 w-5" />
                      )}
                    </button>
                  </Tooltip>
                )}

              {/* Bouton Supprimer - pour tous */}
              <Tooltip content="Supprimer définitivement">
                <button
                  onClick={() => handleDeleteContent(selectedContent.id)}
                  className="inline-flex items-center justify-center w-12 h-12 text-red-600 bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-all"
                >
                  <Trash className="h-5 w-5" />
                </button>
              </Tooltip>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      <SchedulingDialog
        isOpen={!!schedulingContent}
        onClose={() => setSchedulingContent(null)}
        content={schedulingContent}
        onSchedule={handleScheduleContent}
      />
    </div>
  );
}
