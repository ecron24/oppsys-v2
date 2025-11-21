import { CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import type { Platform, SocialConnection } from "../social-types";

// Types de statut
const STATUS_TYPES = {
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  EXPIRED: "expired",
  ERROR: "error",
  LOADING: "loading",
  REFRESHING: "refreshing",
};

// Configuration des statuts
const STATUS_CONFIG = {
  [STATUS_TYPES.CONNECTED]: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    label: "Connecté",
    badgeVariant: "default",
  },
  [STATUS_TYPES.DISCONNECTED]: {
    icon: XCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    label: "Déconnecté",
    badgeVariant: "secondary",
  },
  [STATUS_TYPES.EXPIRED]: {
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
    label: "Expiré",
    badgeVariant: "destructive",
  },
  [STATUS_TYPES.ERROR]: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    label: "Erreur",
    badgeVariant: "destructive",
  },
  [STATUS_TYPES.LOADING]: {
    icon: RefreshCw,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    label: "Connexion...",
    badgeVariant: "default",
  },
  [STATUS_TYPES.REFRESHING]: {
    icon: RefreshCw,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-300",
    label: "Actualisation...",
    badgeVariant: "default",
  },
};

// Fonction pour déterminer le statut basé sur les données de connexion
const getConnectionStatus = (connection: SocialConnection) => {
  if (!connection) {
    return STATUS_TYPES.DISCONNECTED;
  }

  //   if (connection.is_loading || connection.loading) {
  //     return STATUS_TYPES.LOADING;
  //   }

  //   if (connection.is_refreshing || connection.refreshing) {
  //     return STATUS_TYPES.REFRESHING;
  //   }

  //   if (connection.error) {
  //     return STATUS_TYPES.ERROR;
  //   }

  if (!connection.isValid) {
    return STATUS_TYPES.DISCONNECTED;
  }

  // Vérifier si le token est expiré ou va expirer bientôt
  if (connection.expiresAt) {
    const expirationTime = new Date(connection.expiresAt).getTime();
    const currentTime = Date.now();
    const warningTime = 7 * 24 * 60 * 60 * 1000; // 7 jours

    if (currentTime >= expirationTime) {
      return STATUS_TYPES.EXPIRED;
    }

    if (currentTime >= expirationTime - warningTime) {
      return STATUS_TYPES.EXPIRED; // Considérer comme expiré si expire dans moins de 7 jours
    }
  }

  return STATUS_TYPES.CONNECTED;
};

const sizeClasses = {
  sm: {
    container: "px-2 py-1",
    icon: "h-3 w-3",
    text: "text-xs",
  },
  md: {
    container: "px-3 py-2",
    icon: "h-4 w-4",
    text: "text-sm",
  },
  lg: {
    container: "px-4 py-3",
    icon: "h-5 w-5",
    text: "text-base",
  },
};

type SocialStatusIndicatorProps = {
  connection: SocialConnection;
  platform: Platform;
  size?: keyof typeof sizeClasses;
  variant?: "default" | "icon" | "dot";
  showLabel?: boolean;
  showTooltip?: boolean;
  className?: string;
};

const SocialStatusIndicator = ({
  connection,
  platform,
  variant = "default",
  size = "md",
  showLabel = true,
  showTooltip = true,
  className = "",
}: SocialStatusIndicatorProps) => {
  const status = getConnectionStatus(connection);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  // Classes CSS selon la taille

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // Variantes d'affichage
  if (variant === "dot") {
    const DotComponent = (
      <div className={`relative ${className}`}>
        <div
          className={`w-3 h-3 rounded-full ${config.bgColor} ${config.borderColor} border-2`}
          title={showTooltip ? `${platform}: ${config.label}` : undefined}
        >
          {(status === STATUS_TYPES.LOADING ||
            status === STATUS_TYPES.REFRESHING) && (
            <div className="absolute inset-0 w-3 h-3 rounded-full border-2 border-t-transparent border-current animate-spin" />
          )}
        </div>
      </div>
    );

    return showTooltip ? (
      <div title={`${platform}: ${config.label}`}>{DotComponent}</div>
    ) : (
      DotComponent
    );
  }

  if (variant === "icon") {
    const IconComponent = (
      <div className={`${config.color} ${className}`}>
        <Icon
          className={`${currentSize.icon} ${
            status === STATUS_TYPES.LOADING ||
            status === STATUS_TYPES.REFRESHING
              ? "animate-spin"
              : ""
          }`}
        />
      </div>
    );

    return showTooltip ? (
      <div title={`${platform}: ${config.label}`}>{IconComponent}</div>
    ) : (
      IconComponent
    );
  }

  // Variante par défaut (badge complet)
  const BadgeComponent = (
    <div
      className={`
      inline-flex items-center rounded-full border
      ${config.bgColor} ${config.borderColor} ${config.color}
      ${currentSize.container} ${currentSize.text}
      ${className}
    `}
    >
      <Icon
        className={`${currentSize.icon} mr-1.5 ${
          status === STATUS_TYPES.LOADING || status === STATUS_TYPES.REFRESHING
            ? "animate-spin"
            : ""
        }`}
      />
      {showLabel && <span className="font-medium">{config.label}</span>}

      {/* Afficher le temps d'expiration si pertinent */}
      {status === STATUS_TYPES.EXPIRED && connection?.expiresAt && (
        <span className="ml-1 opacity-75">
          ({getTimeUntilExpiration(connection.expiresAt)})
        </span>
      )}
    </div>
  );

  return showTooltip ? (
    <div title={getTooltipMessage(connection, platform, status)}>
      {BadgeComponent}
    </div>
  ) : (
    BadgeComponent
  );
};

// Fonction utilitaire pour le message du tooltip
const getTooltipMessage = (
  connection: SocialConnection,
  platform: Platform,
  status: keyof typeof STATUS_CONFIG
) => {
  let message = `${platform}: ${STATUS_CONFIG[status].label}`;

  if (connection?.platformUsername) {
    message += ` (@${connection.platformUsername})`;
  }

  if (connection?.lastUsed) {
    const lastUsed = new Date(connection.lastUsed);
    const timeDiff = Date.now() - lastUsed.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
      message += ` • Utilisé aujourd'hui`;
    } else if (daysDiff === 1) {
      message += ` • Utilisé hier`;
    } else if (daysDiff < 7) {
      message += ` • Utilisé il y a ${daysDiff} jours`;
    }
  }

  if (connection?.expiresAt) {
    const timeLeft = getTimeUntilExpiration(connection.expiresAt);
    message += ` • Expire ${timeLeft}`;
  }

  //   if (connection?.error) {
  //     message += ` • Erreur: ${connection.error}`;
  //   }

  return message;
};

// Fonction utilitaire pour calculer le temps jusqu'à expiration
const getTimeUntilExpiration = (expiresAt: string) => {
  if (!expiresAt) return null;

  const expirationTime = new Date(expiresAt).getTime();
  const currentTime = Date.now();
  const timeDiff = expirationTime - currentTime;

  if (timeDiff <= 0) {
    return "expiré";
  }

  const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
  const hours = Math.floor(
    (timeDiff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );

  if (days > 0) {
    return `dans ${days} jour${days > 1 ? "s" : ""}`;
  } else if (hours > 0) {
    return `dans ${hours} heure${hours > 1 ? "s" : ""}`;
  } else {
    const minutes = Math.floor((timeDiff % (60 * 60 * 1000)) / (60 * 1000));
    return `dans ${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
};

// Composant pour afficher une liste de statuts (pour la sidebar par exemple)
type SocialStatusListProps = {
  connections: SocialConnection[];
  variant?: "dot" | "default" | "icon";
  className?: string;
};

export const SocialStatusList = ({
  connections,
  variant = "dot",
  className = "",
}: SocialStatusListProps) => {
  const platforms = [
    "facebook",
    "instagram",
    "linkedin",
    "twitter",
    "youtube",
    "tiktok",
  ] as const;

  return (
    <div className={`flex space-x-1 ${className}`}>
      {platforms.map((platform) => {
        const connection = connections?.find((c) => c.platform === platform);
        if (!connection) return null;
        return (
          <SocialStatusIndicator
            key={connection.id}
            connection={connection}
            platform={platform}
            variant={variant}
            size="sm"
            showLabel={false}
            showTooltip={true}
          />
        );
      })}
    </div>
  );
};
