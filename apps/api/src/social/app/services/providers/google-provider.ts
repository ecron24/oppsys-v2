import type { Result } from "@oppsys/types";
import { tryCatch } from "src/lib/try-catch";
import type {
  SocialProvider,
  SocialProviderTokenData,
} from "./social-provider";
import type { ScopeLevel } from "src/social/domain/social-connection";

const GOOGLE_BASIC_SCOPES = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

const GOOGLE_ADVANCED_SCOPES = [
  // Google Calendar
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",

  // Gmail
  "https://www.googleapis.com/auth/gmail.send",

  // Google Drive
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",

  // Google Sheets
  "https://www.googleapis.com/auth/spreadsheets",
];

interface GoogleUserProfile {
  id: string;
  name: string;
  email?: string;
  username: string;
  picture?: string;
  verifiedEmail?: boolean;
  locale?: string;
}

type GoogleApiError = { error?: string; error_description?: string };
type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};
type GoogleUserInfoResponse = {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  verified_email?: boolean;
  locale?: string;
};
type GoogleTokenInfoResponse = {
  audience?: string;
  user_id?: string;
};

export class GoogleProvider implements SocialProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private tokenUrl: string;
  private apiUrl: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    this.baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    this.tokenUrl = "https://oauth2.googleapis.com/token";
    this.apiUrl = "https://www.googleapis.com/oauth2/v2";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }
  }

  /**
   * ✅ Nouvelle méthode : Obtenir l'URL d'auth avec scopes personnalisés
   */
  async getAuthUrl(
    state: string,
    redirectUri?: string,
    scopeLevel: ScopeLevel = "basic"
  ): Promise<string> {
    const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
    const redirect = redirectUri || defaultRedirectUri;
    const scopes =
      scopeLevel === "advanced"
        ? [...GOOGLE_BASIC_SCOPES, ...GOOGLE_ADVANCED_SCOPES]
        : GOOGLE_BASIC_SCOPES;
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirect,
      state: state,
      scope: scopes.join(" "),
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
    });
    return `${this.baseUrl}?${params.toString()}`;
  }

  /**
   * ✅ Méthode helper pour obtenir uniquement les scopes de base
   */
  async getBasicAuthUrl(state: string, redirectUri?: string): Promise<string> {
    return this.getAuthUrl(state, redirectUri, "basic");
  }

  /**
   * ✅ Méthode helper pour obtenir tous les scopes avancés
   */
  async getAdvancedAuthUrl(
    state: string,
    redirectUri?: string
  ): Promise<string> {
    return this.getAuthUrl(state, redirectUri, "advanced");
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri?: string
  ): Promise<Result<SocialProviderTokenData>> {
    return tryCatch(async () => {
      const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
      const redirect = redirectUri || defaultRedirectUri;
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirect,
        }),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Google token exchange failed: ${errorData}`);
      }
      const data = (await response.json()) as GoogleTokenResponse &
        GoogleApiError;
      if (data.error) {
        throw new Error(
          `Google error: ${data.error_description || data.error}`
        );
      }
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : null;
      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: expiresAt,
          tokenType: data.token_type || "Bearer",
          scope: data.scope,
        },
      };
    });
  }

  async getUserProfile(
    accessToken: string
  ): Promise<Result<GoogleUserProfile>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/userinfo?access_token=${accessToken}`
      );
      if (!response.ok) throw new Error(`Google API error: ${response.status}`);
      const userData = (await response.json()) as GoogleUserInfoResponse &
        GoogleApiError;
      if (userData.error) {
        throw new Error(
          `Google API error: ${userData.error_description || userData.error}`
        );
      }
      return {
        success: true,
        data: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username:
            userData.email?.split("@")[0] ||
            userData.name.replace(/\s/g, "").toLowerCase(),
          picture: userData.picture,
          verifiedEmail: userData.verified_email,
          locale: userData.locale,
        },
      };
    });
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<Result<SocialProviderTokenData>> {
    return tryCatch(async () => {
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Google token refresh failed: ${response.status} - ${errorText}`
        );
      }
      const data = (await response.json()) as GoogleTokenResponse &
        GoogleApiError;
      if (data.error) {
        throw new Error(
          `Google refresh error: ${data.error_description || data.error}`
        );
      }
      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : null;
      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: refreshToken,
          expiresAt: expiresAt,
          tokenType: data.token_type || "Bearer",
          scope: data.scope,
        },
      };
    });
  }

  async validateToken(accessToken: string): Promise<Result<boolean>> {
    return tryCatch(async () => {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
      );
      if (!response.ok) return { success: true, data: false };
      const data = (await response.json()) as GoogleTokenInfoResponse &
        GoogleApiError;
      return {
        success: true,
        data: !data.error && data.audience === this.clientId,
      } as const;
    });
  }
}
