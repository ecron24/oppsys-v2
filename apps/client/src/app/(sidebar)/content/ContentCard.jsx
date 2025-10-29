// src/components/ContentCard.jsx - Version contrôlée et stylisée avec planification
import {
  Heart,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// Le composant reçoit les données ET les fonctions du parent
const ContentCard = ({
  content,
  onView,
  onDelete,
  onToggleFavorite,
  onSchedule, // ✅ NOUVELLE PROP
  showScheduleButton = false, // ✅ NOUVELLE PROP
  getModuleDisplayName,
  getContentTypeConfig,
}) => {
  // On récupère la configuration de l'icône depuis une fonction passée en prop
  const typeConfig = getContentTypeConfig(content.type);
  const Icon = typeConfig.icon;

  // ✅ FONCTION POUR AFFICHER LE BADGE DE STATUT
  const getStatusBadge = () => {
    switch (content.status) {
      case "published":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Publié
          </span>
        );
      case "scheduled":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Planifié
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <AlertTriangle className="h-3 w-3 mr-1" />
            En attente
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card hover:shadow-lg transition-shadow group flex flex-col justify-between border">
      {/* Contenu du haut (titre, etc.) */}
      <div className="p-4">
        <div className="flex items-start justify-between space-x-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-3 rounded-lg bg-muted flex-shrink-0">
              <Icon className={`h-6 w-6 ${typeConfig.color}`} />
            </div>

            <div className="min-w-0">
              <h3 className="font-semibold text-card-foreground group-hover:text-primary truncate">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {getModuleDisplayName(content.module_slug)}
              </p>

              {/* ✅ BADGE DE STATUT */}
              <div className="mt-2">{getStatusBadge()}</div>

              {/* ✅ AFFICHAGE DATE PLANIFIÉE SI APPLICABLE */}
              {content.scheduled_at && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Planifié pour le{" "}
                    {new Date(content.scheduled_at).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => onToggleFavorite(content.id, !content.is_favorite)}
            className={`p-2 rounded-full hover:bg-muted flex-shrink-0 ${content.is_favorite ? "text-red-500" : "text-muted-foreground"}`}
          >
            <Heart
              className={`h-4 w-4 ${content.is_favorite ? "fill-current" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* ✅ CONTENU DU BAS MODIFIÉ (boutons) */}
      <div className="px-4 pb-4 flex space-x-2">
        <button
          onClick={() => onView(content)}
          className="button-primary flex-1"
        >
          Voir
        </button>

        {/* ✅ BOUTON PLANIFIER CONDITIONNEL */}
        {showScheduleButton && (
          <button
            onClick={() => onSchedule(content)}
            className="button-outline flex items-center space-x-1 px-3 py-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Planifier</span>
          </button>
        )}

        <button
          onClick={() => onDelete(content.id)}
          className="button-outline p-2 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ContentCard;
