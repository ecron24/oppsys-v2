import type { Result } from "@oppsys/shared";
import * as crypto from "crypto";
import FormData from "form-data";
import { tryCatch } from "src/lib/try-catch";
import type {
  SocialProvider,
  SocialProviderTokenData,
} from "./social-provider";

interface TwitterTokenData extends SocialProviderTokenData {
  scope?: string;
}

interface TwitterUserProfile {
  id: string;
  name: string;
  username: string;
  picture?: string;
  description?: string;
  verified?: boolean;
  followersCount?: number;
  followingCount?: number;
  tweetCount?: number;
  listedCount?: number;
  created_at?: string;
}

interface TwitterContent {
  text: string;
  media_ids?: string[];
  poll?: {
    options: string[];
    duration_minutes?: number;
  };
}

interface PublishResult {
  success: boolean;
  tweetId: string;
  platform: string;
  url: string;
}

interface MediaUploadResult {
  media_id_string: string;
  expires_after_secs?: number;
}

interface TweetStatistics {
  retweet_count: number;
  like_count: number;
  reply_count: number;
  quote_count: number;
  bookmark_count: number;
  impression_count: number;
}

interface MediaData {
  buffer: Buffer;
  mimeType: string;
}

// Types pour les réponses des API Twitter
type TwitterApiError = {
  error?: string;
  error_description?: string;
  errors?: { message: string }[];
};
type TwitterTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};
type TwitterUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url?: string;
  description?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  created_at?: string;
};
type TwitterUserResponseWrapper = { data: TwitterUser } & TwitterApiError;
type TwitterTweet = {
  id: string;
  text: string;
  public_metrics: TweetStatistics;
  created_at: string;
  attachments?: { media_keys: string[] };
};
type TwitterTweetResponseWrapper = { data: TwitterTweet } & TwitterApiError;
type TwitterTweetListResponseWrapper = {
  data: TwitterTweet[];
} & TwitterApiError;

// Stockage en mémoire pour les code verifiers (à remplacer par Redis/DB en production)
const codeVerifierStore: Record<string, string> = {};

export class TwitterProvider implements SocialProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private tokenUrl: string;
  private apiUrl: string;
  private uploadApiUrl: string;

  constructor() {
    this.clientId = process.env.TWITTER_CLIENT_ID!;
    this.clientSecret = process.env.TWITTER_CLIENT_SECRET!;
    this.baseUrl = "https://twitter.com/i/oauth2/authorize";
    this.tokenUrl = "https://api.twitter.com/2/oauth2/token";
    this.apiUrl = "https://api.twitter.com/2";
    this.uploadApiUrl = "https://upload.twitter.com/1.1";

    if (!this.clientId) {
      throw new Error("Twitter Client ID not configured");
    }
  }

  async getAuthUrl(state: string, redirectUri?: string): Promise<string> {
    const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
    const redirect = redirectUri || defaultRedirectUri;

    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    codeVerifierStore[state] = codeVerifier;

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.clientId,
      redirect_uri: redirect,
      state: state,
      scope: "tweet.read tweet.write users.read offline.access",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri?: string,
    state?: string
  ): Promise<Result<TwitterTokenData, Error>> {
    return tryCatch(async () => {
      const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
      const redirect = redirectUri || defaultRedirectUri;

      const codeVerifier = codeVerifierStore[state || ""];
      if (!codeVerifier)
        throw new Error(
          "Code verifier not found for this state. It may have expired."
        );
      delete codeVerifierStore[state || ""];

      const authHeader = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`;

      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authHeader,
        },
        body: new URLSearchParams({
          code,
          grant_type: "authorization_code",
          redirect_uri: redirect,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok)
        throw new Error(
          `Twitter token exchange failed: ${await response.text()}`
        );

      const data = (await response.json()) as TwitterTokenResponse &
        TwitterApiError;
      if (data.error)
        throw new Error(
          `Twitter error: ${data.error_description || data.error}`
        );

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : null;

      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: expiresAt,
          tokenType: data.token_type,
          scope: data.scope,
        },
      };
    });
  }

  async getUserProfile(
    accessToken: string
  ): Promise<Result<TwitterUserProfile, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/users/me?user.fields=id,name,username,profile_image_url,public_metrics,description,verified,created_at`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Twitter API error: ${response.status}`);

      const result = (await response.json()) as TwitterUserResponseWrapper;
      if (result.errors)
        throw new Error(`Twitter API error: ${result.errors[0].message}`);

      const userData = result.data;
      return {
        success: true,
        data: {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          picture: userData.profile_image_url,
          description: userData.description,
          verified: userData.verified,
          followersCount: userData.public_metrics?.followers_count,
          followingCount: userData.public_metrics?.following_count,
          tweetCount: userData.public_metrics?.tweet_count,
          listedCount: userData.public_metrics?.listed_count,
          created_at: userData.created_at,
        },
      };
    });
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<Result<TwitterTokenData, Error>> {
    return tryCatch(async () => {
      const authHeader = `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64")}`;
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: authHeader,
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok)
        throw new Error(
          `Twitter token refresh failed: ${await response.text()}`
        );

      const data = (await response.json()) as TwitterTokenResponse &
        TwitterApiError;
      if (data.error)
        throw new Error(
          `Twitter refresh error: ${data.error_description || data.error}`
        );

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : null;

      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          expiresAt: expiresAt,
          tokenType: data.token_type,
          scope: data.scope,
        },
      };
    });
  }

  async validateToken(accessToken: string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const response = await fetch(`${this.apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return { success: true, data: false };
      const data = (await response.json()) as TwitterUserResponseWrapper;
      return {
        success: true,
        data: !data.errors && !!data.data?.id,
      };
    });
  }

  async publishTweet(
    accessToken: string,
    content: TwitterContent
  ): Promise<Result<PublishResult, Error>> {
    return tryCatch(async () => {
      const tweetPayload: {
        text: string;
        media?: { media_ids: string[] };
        poll?: { options: string[]; duration_minutes: number };
      } = {
        text: content.text,
      };

      if (content.media_ids?.length) {
        tweetPayload.media = { media_ids: content.media_ids };
      }

      if (content.poll) {
        tweetPayload.poll = {
          options: content.poll.options,
          duration_minutes: content.poll.duration_minutes || 1440,
        };
      }

      const response = await fetch(`${this.apiUrl}/tweets`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tweetPayload),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as TwitterApiError;
        throw new Error(
          `Twitter publish error: ${errorData.errors?.[0]?.message || response.status}`
        );
      }

      const publishData =
        (await response.json()) as TwitterTweetResponseWrapper;
      const tweetId = publishData.data.id;
      return {
        success: true,
        data: {
          success: true,
          tweetId: tweetId,
          platform: "twitter",
          url: `https://twitter.com/anyuser/status/${tweetId}`,
        },
      };
    });
  }

  async uploadMedia(
    accessToken: string,
    mediaData: MediaData
  ): Promise<Result<MediaUploadResult, Error>> {
    return tryCatch(async () => {
      const formData = new FormData();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formData.append("media", mediaData.buffer as any);

      const response = await fetch(`${this.uploadApiUrl}/media/upload.json`, {
        method: "POST",
        headers: {
          Authorization: `OAuth oauth_consumer_key="${this.clientId}", oauth_token="${accessToken}"`,
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        body: formData as any,
      });

      if (!response.ok)
        throw new Error(
          `Twitter media upload failed: ${await response.text()}`
        );

      const data = (await response.json()) as MediaUploadResult;
      return {
        success: true,
        data,
      };
    });
  }

  async getUserTweets(
    accessToken: string,
    userId: string,
    maxResults: number = 10
  ): Promise<Result<TwitterTweet[], Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/users/${userId}/tweets?max_results=${maxResults}&tweet.fields=created_at,public_metrics,attachments`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get user tweets: ${response.status}`);

      const data = (await response.json()) as TwitterTweetListResponseWrapper;
      if (data.errors)
        throw new Error(`Twitter API error: ${data.errors[0].message}`);

      return {
        success: true,
        data: data.data || [],
      };
    });
  }

  async getTweetStatistics(
    accessToken: string,
    tweetId: string
  ): Promise<Result<TweetStatistics, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/tweets/${tweetId}?tweet.fields=public_metrics`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get tweet statistics: ${response.status}`);

      const data = (await response.json()) as TwitterTweetResponseWrapper;
      if (data.errors)
        throw new Error(`Twitter API error: ${data.errors[0].message}`);

      const metrics = data.data.public_metrics;
      return {
        success: true,
        data: {
          retweet_count: metrics.retweet_count,
          like_count: metrics.like_count,
          reply_count: metrics.reply_count,
          quote_count: metrics.quote_count,
          bookmark_count: metrics.bookmark_count,
          impression_count: metrics.impression_count,
        },
      };
    });
  }

  private generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url");
  }

  private generateCodeChallenge(codeVerifier: string): string {
    return crypto.createHash("sha256").update(codeVerifier).digest("base64url");
  }
}
