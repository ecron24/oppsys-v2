// apps/client/src/services/socialService.js
import apiService from "./apiService";

export class SocialService {
  /**
   * ✅ NOUVEAU: Initier une connexion OAuth avec popup en utilisant votre backend existant
   */
  static async authenticateWithPopup(platform) {
    return new Promise(async (resolve, reject) => {
      try {
        // Utiliser votre service existant pour initier l'auth
        const authUrl = await this.initAuth(platform);

        // Ouvrir la popup
        const popup = window.open(
          authUrl,
          `${platform}_oauth`,
          "width=600,height=700,scrollbars=yes,resizable=yes"
        );

        // Écouter les messages de la popup
        const messageListener = (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === "SOCIAL_AUTH_SUCCESS") {
            window.removeEventListener("message", messageListener);
            popup.close();
            resolve({
              success: true,
              platform: event.data.platform,
            });
          } else if (event.data.type === "SOCIAL_AUTH_ERROR") {
            window.removeEventListener("message", messageListener);
            popup.close();
            reject(new Error(event.data.error || "Erreur OAuth"));
          }
        };

        window.addEventListener("message", messageListener);

        // Vérifier si la popup est fermée manuellement
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener("message", messageListener);
            reject(new Error("Authentification annulée"));
          }
        }, 1000);

        // Timeout après 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener("message", messageListener);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error("Timeout d'authentification"));
        }, 300000);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * ✅ NOUVEAU: Finaliser l'authentification OAuth (pour AuthCallbackPage)
   */
  static async completeAuth(code, state, platform) {
    try {
      // Utiliser votre backend existant pour finaliser l'auth
      const response = await apiService.post("/social/callback", {
        code,
        state,
        platform: platform.toLowerCase(),
      });

      if (response.success) {
        return response.data;
      } else {
        throw new Error(
          response.error || "Erreur lors de la finalisation OAuth"
        );
      }
    } catch (error) {
      console.error("Social auth completion error:", error);
      throw error;
    }
  }

  /**
   * Initier une connexion OAuth pour une plateforme (EXISTANT - gardé tel quel)
   */
  static async initAuth(platform, redirectUri = null) {
    try {
      const response = await apiService.post("/social/init", {
        platform,
        redirectUri: redirectUri || `${window.location.origin}/auth/callback`,
      });

      if (response.success) {
        return response.data.authUrl;
      } else {
        throw new Error(response.error || "Failed to initiate OAuth");
      }
    } catch (error) {
      console.error(`Error initiating OAuth for ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les connexions de l'utilisateur (EXISTANT)
   */
  static async getConnections() {
    try {
      const response = await apiService.get("/social/connections");

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to fetch connections");
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Vérifier le statut d'une connexion spécifique
   */
  static async checkConnectionStatus(platform) {
    try {
      const response = await apiService.get(
        `/social/connections/${platform}/status`
      );

      if (response.success) {
        return response.data;
      } else {
        return { connected: false };
      }
    } catch (error) {
      console.error("Check connection status error:", error);
      return { connected: false };
    }
  }

  /**
   * Supprimer une connexion (EXISTANT)
   */
  static async disconnect(platform) {
    try {
      const response = await apiService.delete(
        `/social/connections/${platform}`
      );

      if (response.success) {
        return true;
      } else {
        throw new Error(response.error || "Failed to disconnect");
      }
    } catch (error) {
      console.error(`Error disconnecting ${platform}:`, error);
      throw error;
    }
  }

  /**
   * Actualiser un token (EXISTANT)
   */
  static async refreshToken(platform) {
    try {
      const response = await apiService.post(
        `/social/connections/${platform}/refresh`
      );

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to refresh token");
      }
    } catch (error) {
      console.error(`Error refreshing ${platform} token:`, error);
      throw error;
    }
  }

  /**
   * Obtenir les statistiques des connexions (EXISTANT)
   */
  static async getStats() {
    try {
      const response = await apiService.get("/social/connections/stats");

      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.error || "Failed to get stats");
      }
    } catch (error) {
      console.error("Error getting connection stats:", error);
      throw error;
    }
  }

  /**
   * Obtenir un token valide pour N8N (EXISTANT)
   */
  static async getValidTokenForN8N(platform) {
    try {
      const connections = await this.getConnections();
      const connection = connections.find((c) => c.platform === platform);

      if (!connection || !connection.is_valid) {
        throw new Error(`${platform} connection is not valid`);
      }

      // Vérifier si le token va expirer bientôt
      if (connection.expires_at) {
        const expirationTime = new Date(connection.expires_at).getTime();
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (now >= expirationTime - fiveMinutes) {
          // Token proche de l'expiration, essayer de le rafraîchir
          await this.refreshToken(platform);
        }
      }

      return true; // Le token est valide et peut être utilisé
    } catch (error) {
      console.error(`Token validation failed for ${platform}:`, error);
      throw error;
    }
  }

  /**
   * ✅ NOUVEAU: Obtenir la liste des plateformes supportées
   */
  static getSupportedPlatforms() {
    const platforms = [];

    if (process.env.REACT_APP_GOOGLE_CLIENT_ID) {
      platforms.push({
        key: "google",
        name: "Google",
        icon: "🟢",
        description: "Connectez votre compte Google",
      });
    }

    if (process.env.REACT_APP_FACEBOOK_APP_ID) {
      platforms.push({
        key: "facebook",
        name: "Facebook",
        icon: "🔵",
        description: "Connectez votre page Facebook",
      });
    }

    if (process.env.REACT_APP_LINKEDIN_CLIENT_ID) {
      platforms.push({
        key: "linkedin",
        name: "LinkedIn",
        icon: "🔷",
        description: "Connectez votre profil LinkedIn",
      });
    }

    if (process.env.REACT_APP_TWITTER_CLIENT_ID) {
      platforms.push({
        key: "twitter",
        name: "Twitter/X",
        icon: "⚫",
        description: "Connectez votre compte X (Twitter)",
      });
    }

    if (process.env.REACT_APP_INSTAGRAM_CLIENT_ID) {
      platforms.push({
        key: "instagram",
        name: "Instagram",
        icon: "🟣",
        description: "Connectez votre compte Instagram",
      });
    }

    if (
      process.env.REACT_APP_YOUTUBE_CLIENT_ID ||
      process.env.REACT_APP_GOOGLE_CLIENT_ID
    ) {
      platforms.push({
        key: "youtube",
        name: "YouTube",
        icon: "🔴",
        description: "Connectez votre chaîne YouTube",
      });
    }

    if (process.env.REACT_APP_TIKTOK_CLIENT_ID) {
      platforms.push({
        key: "tiktok",
        name: "TikTok",
        icon: "⚪",
        description: "Connectez votre compte TikTok",
      });
    }

    return platforms;
  }

  /**
   * ✅ NOUVEAU: Vérifier si l'OAuth social est activé
   */
  static isOAuthEnabled() {
    return process.env.REACT_APP_ENABLE_SOCIAL_AUTH === "true";
  }
}

// Export par défaut et nommé pour compatibilité
export default SocialService;
export const socialService = SocialService;
