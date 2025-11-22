import type { Result } from "@oppsys/utils";
import { tryCatch } from "src/lib/try-catch";
import type {
  SocialProvider,
  SocialProviderTokenData,
} from "./social-provider";

interface InstagramUserProfile {
  id: string;
  name: string;
  username: string;
  accountType?: string;
  mediaCount?: number;
  picture?: string | null;
}

interface InstagramContent {
  text: string;
  imageUrl?: string;
  videoUrl?: string;
}

interface PublishResult {
  success: boolean;
  postId: string;
  platform: string;
  url: string;
}

interface MediaContainer {
  id: string;
}

// Types pour les réponses des API Instagram
type InstagramApiError = { error?: { message: string } };
type InstagramTokenResponse = {
  access_token: string;
  user_id: string;
  token_type?: string;
  scope?: string;
};
type InstagramLongLivedTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
};
type InstagramUserResponse = {
  id: string;
  username: string;
  account_type?: string;
  media_count?: number;
};
type InstagramPublishResponse = { id: string };
type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  timestamp: string;
  permalink: string;
};
type InstagramMediaListResponse = { data: InstagramMedia[] };
type InstagramInsight = { name: string; values: { value: number }[] };
type InstagramInsightsResponse = { data: InstagramInsight[] };

export class InstagramProvider implements SocialProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private tokenUrl: string;
  private apiUrl: string;

  constructor() {
    this.clientId = process.env.INSTAGRAM_CLIENT_ID!;
    this.clientSecret = process.env.INSTAGRAM_CLIENT_SECRET!;
    this.baseUrl = "https://api.instagram.com/oauth/authorize";
    this.tokenUrl = "https://api.instagram.com/oauth/access_token";
    this.apiUrl = "https://graph.instagram.com";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Instagram OAuth credentials not configured");
    }
  }

  async getAuthUrl(state: string, redirectUri?: string): Promise<string> {
    const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
    const redirect = redirectUri || defaultRedirectUri;

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirect,
      state: state,
      scope: "user_profile,user_media", // Simplifié, les autres scopes sont pour l'API Graph de Facebook
      response_type: "code",
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri?: string
  ): Promise<Result<SocialProviderTokenData, Error>> {
    return tryCatch(async () => {
      const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
      const redirect = redirectUri || defaultRedirectUri;

      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: "authorization_code",
          redirect_uri: redirect,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Instagram token exchange failed: ${errorData}`);
      }

      const data = (await response.json()) as InstagramTokenResponse &
        InstagramApiError;
      if (data.error) throw new Error(`Instagram error: ${data.error.message}`);

      const longLivedTokenResult = await this.getLongLivedToken(
        data.access_token
      );

      if (!longLivedTokenResult.success) {
        throw longLivedTokenResult.error;
      }

      const longLivedToken = longLivedTokenResult.data;

      return {
        success: true,
        data: {
          accessToken: longLivedToken.access_token,
          refreshToken: longLivedToken.access_token, // Le long-lived token sert de refresh token
          expiresAt: longLivedToken.expires_at,
          tokenType: longLivedToken.token_type,
          user_id: data.user_id,
        },
      };
    });
  }

  async getLongLivedToken(
    shortLivedToken: string
  ): Promise<
    Result<
      { access_token: string; expires_at: number; token_type: string },
      Error
    >
  > {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/access_token?grant_type=ig_exchange_token&client_secret=${this.clientSecret}&access_token=${shortLivedToken}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(
          `Instagram long-lived token failed: ${response.status}`
        );

      const data = (await response.json()) as InstagramLongLivedTokenResponse &
        InstagramApiError;
      if (data.error)
        throw new Error(
          `Instagram long-lived token error: ${data.error.message}`
        );

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).getTime();

      return {
        success: true,
        data: {
          access_token: data.access_token,
          token_type: data.token_type,
          expires_at: expiresAt,
        },
      };
    });
  }

  async getUserProfile(
    accessToken: string
  ): Promise<Result<InstagramUserProfile, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Instagram API error: ${response.status}`);

      const userData = (await response.json()) as InstagramUserResponse &
        InstagramApiError;
      if (userData.error)
        throw new Error(`Instagram API error: ${userData.error.message}`);

      return {
        success: true,
        data: {
          id: userData.id,
          name: userData.username,
          username: userData.username,
          accountType: userData.account_type,
          mediaCount: userData.media_count,
          picture: null,
        },
      };
    });
  }

  async refreshAccessToken(
    accessToken: string
  ): Promise<Result<SocialProviderTokenData, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Instagram token refresh failed: ${response.status}`);

      const data = (await response.json()) as InstagramLongLivedTokenResponse &
        InstagramApiError;
      if (data.error)
        throw new Error(`Instagram refresh error: ${data.error.message}`);

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).getTime();

      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: data.access_token,
          expiresAt: expiresAt,
          tokenType: data.token_type,
        },
      };
    });
  }

  async validateToken(accessToken: string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/me?fields=id&access_token=${accessToken}`
      );
      if (!response.ok) return { success: true, data: false };
      const data = (await response.json()) as InstagramApiError;
      return {
        success: true,
        data: !data.error,
      };
    });
  }

  async publishPost(
    accessToken: string,
    userId: string,
    content: InstagramContent
  ): Promise<Result<PublishResult, Error>> {
    return tryCatch(async () => {
      const containerResult = await this.createMediaContainer(
        accessToken,
        userId,
        content
      );

      if (!containerResult.success) {
        throw containerResult.error;
      }
      const container = containerResult.data;

      let attempts = 0;
      const maxAttempts = 10;
      while (attempts < maxAttempts) {
        const statusResult = await this.checkContainerStatus(
          accessToken,
          container.id
        );

        if (!statusResult.success) {
          throw statusResult.error;
        }
        const status = statusResult.data;

        if (status === "FINISHED") {
          const publishResponse = await fetch(
            `${this.apiUrl}/${userId}/media_publish?creation_id=${container.id}&access_token=${accessToken}`,
            { method: "POST" }
          );
          if (!publishResponse.ok)
            throw new Error(
              `Instagram publish error: ${await publishResponse.text()}`
            );
          const publishData =
            (await publishResponse.json()) as InstagramPublishResponse;
          return {
            success: true,
            data: {
              success: true,
              postId: publishData.id,
              platform: "instagram",
              url: `https://instagram.com/p/${publishData.id}`,
            },
          };
        }
        if (status === "ERROR")
          throw new Error("Media container processing failed.");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;
      }
      throw new Error("Media container processing timed out.");
    });
  }

  async createMediaContainer(
    accessToken: string,
    userId: string,
    content: InstagramContent
  ): Promise<Result<MediaContainer, Error>> {
    return tryCatch(async () => {
      const params = new URLSearchParams({
        access_token: accessToken,
        caption: content.text,
      });
      if (content.imageUrl) {
        params.append("image_url", content.imageUrl);
      } else if (content.videoUrl) {
        params.append("video_url", content.videoUrl);
        params.append("media_type", "VIDEO");
      } else {
        throw new Error("Instagram requires either image_url or video_url");
      }

      const response = await fetch(
        `${this.apiUrl}/${userId}/media?${params.toString()}`,
        { method: "POST" }
      );
      if (!response.ok)
        throw new Error(`Container creation failed: ${await response.text()}`);

      const data = (await response.json()) as MediaContainer;
      return {
        success: true,
        data,
      };
    });
  }

  async checkContainerStatus(
    accessToken: string,
    containerId: string
  ): Promise<Result<string, Error>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/${containerId}?fields=status_code&access_token=${accessToken}`
      );
      if (!response.ok)
        throw new Error(
          `Failed to check container status: ${await response.text()}`
        );
      const data = (await response.json()) as { status_code: string };
      return {
        success: true,
        data: data.status_code,
      };
    });
  }

  async getUserMedia(
    accessToken: string,
    limit: number = 25
  ): Promise<Result<InstagramMedia[], Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,permalink&limit=${limit}&access_token=${accessToken}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to get user media: ${response.status}`);

      const data = (await response.json()) as InstagramMediaListResponse &
        InstagramApiError;
      if (data.error)
        throw new Error(`Instagram media fetch error: ${data.error.message}`);

      return {
        success: true,
        data: data.data || [],
      };
    });
  }

  async getMediaInsights(
    accessToken: string,
    mediaId: string,
    metrics: string[] = ["impressions", "reach", "engagement"]
  ): Promise<Result<Record<string, number>, Error>> {
    return tryCatch(async () => {
      const metricsParam = metrics.join(",");
      const url = `${this.apiUrl}/${mediaId}/insights?metric=${metricsParam}&access_token=${accessToken}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Failed to get media insights: ${response.status}`);

      const data = (await response.json()) as InstagramInsightsResponse &
        InstagramApiError;
      if (data.error)
        throw new Error(`Instagram insights error: ${data.error.message}`);

      const insights =
        data.data?.reduce(
          (acc: Record<string, number>, metric: InstagramInsight) => {
            acc[metric.name] = metric.values?.[0]?.value || 0;
            return acc;
          },
          {}
        ) || {};

      return {
        success: true,
        data: insights,
      };
    });
  }
}
