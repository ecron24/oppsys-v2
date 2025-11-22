import type { Result } from "@oppsys/utils";
import { tryCatch } from "src/lib/try-catch";
import type {
  SocialProvider,
  SocialProviderTokenData,
} from "./social-provider";

interface FacebookUserProfile {
  id: string;
  name: string;
  email?: string;
  username: string;
  picture: string;
  pages: FacebookPage[];
}

interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category: string;
}

interface PublishContent {
  text: string;
  link?: string;
  picture?: string;
}

interface PublishResult {
  success: boolean;
  postId: string;
  platform: string;
  url: string;
}

type FacebookApiError = { error?: { message: string } };
type FacebookTokenResponse = {
  access_token: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
};
type FacebookUserResponse = { id: string; name: string; email?: string };
type FacebookPagesResponse = { data?: FacebookPage[] };
type FacebookPublishResponse = { id: string };

export class FacebookProvider implements SocialProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private tokenUrl: string;
  private apiUrl: string;

  constructor() {
    this.clientId = process.env.FACEBOOK_APP_ID!;
    this.clientSecret = process.env.FACEBOOK_APP_SECRET!;
    this.baseUrl = "https://www.facebook.com/v18.0/dialog/oauth";
    this.tokenUrl = "https://graph.facebook.com/v18.0/oauth/access_token";
    this.apiUrl = "https://graph.facebook.com/v18.0";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Facebook OAuth credentials not configured");
    }
  }

  async getAuthUrl(state: string, redirectUri?: string): Promise<string> {
    const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
    const redirect = redirectUri || defaultRedirectUri;

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirect,
      state: state,
      scope: [
        "pages_manage_posts",
        "pages_read_engagement",
        "pages_show_list",
        "business_management",
        "public_profile",
      ].join(","),
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
          redirect_uri: redirect,
          code: code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Facebook token exchange failed: ${errorData}`);
      }

      const data = (await response.json()) as FacebookTokenResponse &
        FacebookApiError;

      if (data.error) {
        throw new Error(`Facebook error: ${data.error.message}`);
      }

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : null;

      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refresh_token: null,
          expiresAt: expiresAt,
          tokenType: data.token_type || "bearer",
          scope: data.scope,
        },
      } as const;
    });
  }

  async getUserProfile(
    accessToken: string
  ): Promise<Result<FacebookUserProfile, Error>> {
    return tryCatch(async () => {
      const userResponse = await fetch(
        `${this.apiUrl}/me?fields=id,name,email&access_token=${accessToken}`
      );
      if (!userResponse.ok)
        throw new Error(`Facebook API error: ${userResponse.status}`);

      const userData = (await userResponse.json()) as FacebookUserResponse &
        FacebookApiError;
      if (userData.error)
        throw new Error(`Facebook API error: ${userData.error.message}`);

      const pagesResponse = await fetch(
        `${this.apiUrl}/me/accounts?access_token=${accessToken}`
      );
      let pages: FacebookPage[] = [];
      if (pagesResponse.ok) {
        const pagesData = (await pagesResponse.json()) as FacebookPagesResponse;
        pages = pagesData.data || [];
      }

      return {
        success: true,
        data: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          username: userData.name?.toLowerCase().replace(/\s+/g, "_") || "",
          picture: `https://graph.facebook.com/${userData.id}/picture?type=large`,
          pages,
        },
      };
    });
  }

  async refreshAccessToken(
    shortLivedToken: string
  ): Promise<Result<SocialProviderTokenData, Error>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/oauth/access_token?` +
          `grant_type=fb_exchange_token&` +
          `client_id=${this.clientId}&` +
          `client_secret=${this.clientSecret}&` +
          `fb_exchange_token=${shortLivedToken}`
      );
      if (!response.ok)
        throw new Error(`Facebook token refresh failed: ${response.status}`);

      const data = (await response.json()) as FacebookTokenResponse &
        FacebookApiError;
      if (data.error)
        throw new Error(`Facebook refresh error: ${data.error.message}`);

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).getTime();

      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: null,
          expiresAt: expiresAt,
          tokenType: data.token_type || "bearer",
        },
      } as const;
    });
  }

  async validateToken(accessToken: string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/me?access_token=${accessToken}`
      );
      // FIXME: I'm badway -----  success: true, data: false
      if (!response.ok) return { success: true, data: false };

      const data = (await response.json()) as FacebookApiError;
      return {
        success: true,
        data: !data.error,
      };
    });
  }

  async publishPost(
    accessToken: string,
    pageId: string,
    content: PublishContent
  ): Promise<Result<PublishResult, Error>> {
    return tryCatch(async () => {
      const pageAccessToken = await this.getPageAccessToken(
        accessToken,
        pageId
      );
      const response = await fetch(`${this.apiUrl}/${pageId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.text,
          accessToken: pageAccessToken,
          ...(content.link && { link: content.link }),
          ...(content.picture && { picture: content.picture }),
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as FacebookApiError;
        throw new Error(
          `Facebook publish error: ${errorData.error?.message || response.status}`
        );
      }

      const data = (await response.json()) as FacebookPublishResponse;
      return {
        success: true,
        data: {
          success: true,
          postId: data.id,
          platform: "facebook",
          url: `https://facebook.com/${data.id}`,
        },
      };
    });
  }

  async getPageAccessToken(
    userAccessToken: string,
    pageId: string
  ): Promise<Result<string, Error>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/me/accounts?access_token=${userAccessToken}`
      );
      if (!response.ok)
        throw new Error(`Failed to get page access token: ${response.status}`);

      const data = (await response.json()) as FacebookPagesResponse &
        FacebookApiError;
      if (data.error) throw new Error(data.error.message);

      const page = data.data?.find((p: FacebookPage) => p.id === pageId);
      if (!page) throw new Error("Page not found or no permission");

      return { success: true, data: page.access_token };
    });
  }

  async getUserPages(
    accessToken: string
  ): Promise<Result<FacebookPage[], Error>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/me/accounts?fields=id,name,category,access_token&access_token=${accessToken}`
      );
      if (!response.ok)
        throw new Error(`Failed to get user pages: ${response.status}`);

      const data = (await response.json()) as FacebookPagesResponse &
        FacebookApiError;
      if (data.error) throw new Error(data.error.message);

      return {
        success: true,
        data: data.data || [],
      };
    });
  }

  async getPageInsights(
    pageAccessToken: string,
    pageId: string,
    metrics: string[] = ["page_impressions", "page_engaged_users"]
  ): Promise<Result<Record<string, number>, Error>> {
    return tryCatch(async () => {
      const metricsParam = metrics.join(",");
      const response = await fetch(
        `${this.apiUrl}/${pageId}/insights?metric=${metricsParam}&access_token=${pageAccessToken}`
      );
      if (!response.ok)
        throw new Error(`Failed to get page insights: ${response.status}`);

      const data = (await response.json()) as {
        data: { name: string; values: { value: number }[] }[];
      } & FacebookApiError;
      if (data.error) throw new Error(data.error.message);

      return {
        success: true,
        data:
          data.data?.reduce((acc: Record<string, number>, metric) => {
            acc[metric.name] = metric.values?.[0]?.value || 0;
            return acc;
          }, {}) || {},
      };
    });
  }
}
