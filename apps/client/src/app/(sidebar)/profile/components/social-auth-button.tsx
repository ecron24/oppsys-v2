// components/social/SocialAuthButton.jsx
import { useState } from "react";
import { Button } from "@oppsys/ui";
import {
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Music,
  Youtube,
  Chrome,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import type {
  Platform,
  SocialConnection,
} from "@/components/social/social-types";

// Configuration des plateformes
const PLATFORM_CONFIG = {
  facebook: {
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    bgColor: "bg-blue-600",
    hoverColor: "hover:bg-blue-700",
  },
  instagram: {
    name: "Instagram",
    icon: Instagram,
    color: "text-pink-600",
    bgColor: "bg-gradient-to-r from-pink-500 to-purple-600",
    hoverColor: "hover:from-pink-600 hover:to-purple-700",
  },
  linkedin: {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    bgColor: "bg-blue-700",
    hoverColor: "hover:bg-blue-800",
  },
  twitter: {
    name: "X (Twitter)",
    icon: Twitter,
    color: "text-gray-900",
    bgColor: "bg-gray-900",
    hoverColor: "hover:bg-gray-800",
  },
  tiktok: {
    name: "TikTok",
    icon: Music,
    color: "text-black",
    bgColor: "bg-black",
    hoverColor: "hover:bg-gray-800",
  },
  google: {
    name: "Google",
    icon: Chrome,
    color: "text-red-600",
    bgColor: "bg-red-600",
    hoverColor: "hover:bg-red-700",
  },
  youtube: {
    name: "YouTube",
    icon: Youtube,
    color: "text-red-600",
    bgColor: "bg-red-600",
    hoverColor: "hover:bg-red-700",
  },
};

export function SocialAuthButton({
  platform,
  onConnect,
  loading = false,
  disabled = false,
  size = "default",
  variant = "default",
  showIcon = true,
  showText = true,
  className = "",
}: SocialAuthButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const config = PLATFORM_CONFIG[platform];

  if (!config) {
    console.error(`Platform ${platform} not supported`);
    return null;
  }

  const Icon = config.icon;

  const handleConnect = async () => {
    if (disabled || loading || isConnecting) return;

    setIsConnecting(true);
    try {
      await onConnect(platform);
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
    } finally {
      setIsConnecting(false);
    }
  };

  const isLoading = loading || isConnecting;

  // Variantes de style
  const getVariantClasses = () => {
    switch (variant) {
      case "branded":
        return `${config.bgColor} ${config.hoverColor} text-white border-0`;
      case "outline":
        return `border-2 border-current ${config.color} bg-transparent hover:bg-current hover:text-white`;
      case "ghost":
        return `${config.color} bg-transparent hover:bg-current/10`;
      default:
        return "bg-muted text-foreground hover:bg-muted/80";
    }
  };

  // Tailles
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-sm";
      case "lg":
        return "px-6 py-3 text-lg";
      default:
        return "px-4 py-2.5";
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={disabled || isLoading}
      className={`
        ${getVariantClasses()}
        ${getSizeClasses()}
        transition-all duration-200
        ${className}
      `}
      title={`Connecter ${config.name}`}
    >
      <div className="flex items-center space-x-2">
        {showIcon && (
          <div className="flex-shrink-0">
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Icon className="h-4 w-4" />
            )}
          </div>
        )}

        {showText && (
          <span className="font-medium">
            {isLoading ? "Connexion..." : `Connecter ${config.name}`}
          </span>
        )}

        {!isLoading && !showText && showIcon && (
          <ExternalLink className="h-3 w-3 opacity-70" />
        )}
      </div>
    </Button>
  );
}
type SocialAuthButtonProps = {
  platform: Platform;
  onConnect: (platform: Platform) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  size: "default" | "sm" | "lg";
  variant: "default" | "branded" | "outline" | "ghost";
  showIcon?: boolean;
  showText?: boolean;
  className?: string;
};

export function SocialAuthButtons({
  platforms = [],
  onConnect,
  loading = false,
  variant = "branded",
  size = "default",
  className = "",
  columns = 2,
}: SocialAuthButtonsProps) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-3 ${className}`}>
      {platforms.map((platform) => (
        <SocialAuthButton
          key={platform}
          platform={platform}
          onConnect={onConnect}
          loading={loading}
          variant={variant}
          size={size}
        />
      ))}
    </div>
  );
}
type SocialAuthButtonsProps = {
  platforms: Platform[];
  onConnect: (platform: Platform) => Promise<void>;
  loading?: boolean;
  variant?: "default" | "branded" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
  columns?: 1 | 2 | 3 | 4;
};

export function SocialAuthButtonWithStatus({
  platform,
  connection,
  onConnect,
  onDisconnect,
  loading = false,
}: SocialAuthButtonWithStatusProps) {
  const config = PLATFORM_CONFIG[platform];
  const isConnected = connection?.isValid;
  const isExpiring =
    connection?.expiresAt &&
    new Date(connection.expiresAt) <
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  if (isConnected) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
        <div className="flex items-center space-x-3">
          <div
            className={`h-8 w-8 rounded-full ${config.bgColor} flex items-center justify-center`}
          >
            <config.icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-900">{config.name}</p>
            <p className="text-xs text-green-700">
              {connection.platformUsername
                ? `@${connection.platformUsername}`
                : "Connecté"}
            </p>
            {isExpiring && (
              <p className="mt-1 flex items-center text-xs text-orange-600">
                <AlertCircle className="mr-1 h-3 w-3" />
                Expire bientôt
              </p>
            )}
          </div>
        </div>

        <Button
          onClick={() => onDisconnect(platform)}
          disabled={loading}
          variant="outline"
          size="sm"
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Déconnecter
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full border bg-muted`}
          >
            <config.icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">{config.name}</p>
            <p className="text-xs text-muted-foreground">Non connecté</p>
          </div>
        </div>

        <SocialAuthButton
          platform={platform}
          onConnect={onConnect}
          loading={loading}
          variant="branded"
          size="sm"
          showText={false}
        />
      </div>
    </div>
  );
}
type SocialAuthButtonWithStatusProps = {
  platform: Platform;
  connection: SocialConnection | null;
  onConnect: (platform: Platform) => Promise<void>;
  onDisconnect: (platform: Platform) => Promise<void>;
  loading?: boolean;
};
