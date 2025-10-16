import type { Result } from "@oppsys/types";
import { tryCatch } from "src/lib/try-catch";
import type {
  SocialProvider,
  SocialProviderTokenData,
} from "./social-provider";

interface YouTubeUserProfile {
  id: string;
  name: string;
  username: string;
  description?: string;
  picture?: string;
  subscriberCount?: string;
  videoCount?: string;
  viewCount?: string;
  country?: string;
  publishedAt?: string;
}

interface VideoData {
  title: string;
  description?: string;
  tags?: string[];
  categoryId?: string;
  language?: string;
  privacyStatus?: "private" | "unlisted" | "public";
  embeddable?: boolean;
  license?: string;
  publicStatsViewable?: boolean;
  mimeType?: string;
  fileSize: number;
  fileBuffer: ArrayBuffer | Uint8Array;
}

interface UploadResult {
  success: boolean;
  videoId: string;
  platform: string;
  url: string;
  title?: string;
  status?: string;
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  publishedAt: string;
  url: string;
}

interface VideoStatistics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  title?: string;
  publishedAt?: string;
}

// Types pour les réponses des API YouTube
type YouTubeApiError = { error?: { message: string } };
type YouTubeTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};
type YouTubeThumbnail = { url: string; width: number; height: number };
type YouTubeChannel = {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: YouTubeThumbnail;
      medium: YouTubeThumbnail;
      high: YouTubeThumbnail;
    };
    country?: string;
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
};
type YouTubeChannelListResponse = { items: YouTubeChannel[] } & YouTubeApiError;
type YouTubeSearchItem = {
  id: { videoId: string };
  snippet: {
    publishedAt: string;
    title: string;
    description: string;
    thumbnails: { default: YouTubeThumbnail; high: YouTubeThumbnail };
  };
};
type YouTubeSearchListResponse = {
  items: YouTubeSearchItem[];
} & YouTubeApiError;
type YouTubeVideoItem = {
  id: string;
  snippet: { title: string; publishedAt: string };
  statistics: { viewCount: string; likeCount: string; commentCount: string };
  status: { uploadStatus: string };
};
type YouTubeVideoListResponse = { items: YouTubeVideoItem[] } & YouTubeApiError;
type YouTubeAnalyticsReport = {
  columnHeaders: { name: string }[];
  rows: (string | number)[][];
} & YouTubeApiError;

export class YouTubeProvider implements SocialProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private tokenUrl: string;
  private apiUrl: string;
  private analyticsApiUrl: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    this.baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    this.tokenUrl = "https://oauth2.googleapis.com/token";
    this.apiUrl = "https://www.googleapis.com/youtube/v3";
    this.analyticsApiUrl = "https://youtubeanalytics.googleapis.com/v2";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("Google OAuth credentials not configured for YouTube");
    }
  }

  async getAuthUrl(state: string, redirectUri?: string): Promise<string> {
    const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
    const redirect = redirectUri || defaultRedirectUri;

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirect,
      state: state,
      scope:
        "openid profile email https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/youtubepartner",
      response_type: "code",
      access_type: "offline",
      prompt: "consent",
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
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirect,
        }),
      });

      if (!response.ok)
        throw new Error(
          `YouTube token exchange failed: ${await response.text()}`
        );

      const data = (await response.json()) as YouTubeTokenResponse &
        YouTubeApiError;
      if (data.error) throw new Error(`YouTube error: ${data.error.message}`);

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
  ): Promise<Result<YouTubeUserProfile, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/channels?part=snippet,statistics&mine=true`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`YouTube API error: ${response.status}`);

      const channelData = (await response.json()) as YouTubeChannelListResponse;
      if (channelData.error)
        throw new Error(`YouTube API error: ${channelData.error.message}`);

      const channel = channelData.items?.[0];
      if (!channel)
        throw new Error("No YouTube channel found for this account");

      return {
        success: true,
        data: {
          id: channel.id,
          name: channel.snippet.title,
          username: channel.snippet.customUrl || channel.snippet.title,
          description: channel.snippet.description,
          picture:
            channel.snippet.thumbnails?.high?.url ||
            channel.snippet.thumbnails?.default?.url,
          subscriberCount: channel.statistics?.subscriberCount,
          videoCount: channel.statistics?.videoCount,
          viewCount: channel.statistics?.viewCount,
          country: channel.snippet.country,
          publishedAt: channel.snippet.publishedAt,
        },
      };
    });
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<Result<SocialProviderTokenData, Error>> {
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

      if (!response.ok)
        throw new Error(`YouTube token refresh failed: ${response.status}`);

      const data = (await response.json()) as YouTubeTokenResponse &
        YouTubeApiError;
      if (data.error)
        throw new Error(`YouTube refresh error: ${data.error.message}`);

      const expiresAt = data.expires_in
        ? new Date(Date.now() + data.expires_in * 1000).getTime()
        : null;

      return {
        success: true,
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token || refreshToken,
          expiresAt: expiresAt,
          tokenType: data.token_type || "Bearer",
        },
      };
    });
  }

  async validateToken(accessToken: string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const response = await fetch(
        `${this.apiUrl}/channels?part=id&mine=true`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!response.ok) return { success: true, data: false };

      const data = (await response.json()) as YouTubeChannelListResponse;
      return {
        success: true,
        data: !data.error && (data.items?.length ?? 0) > 0,
      };
    });
  }

  async uploadVideo(
    accessToken: string,
    videoData: VideoData
  ): Promise<Result<UploadResult, Error>> {
    return tryCatch(async () => {
      const metadata = {
        snippet: {
          title: videoData.title,
          description: videoData.description || "",
          tags: videoData.tags || [],
          categoryId: videoData.categoryId || "22",
          defaultLanguage: videoData.language || "en",
          defaultAudioLanguage: videoData.language || "en",
        },
        status: {
          privacyStatus: videoData.privacyStatus || "private",
          embeddable: videoData.embeddable !== false,
          license: videoData.license || "youtube",
          publicStatsViewable: videoData.publicStatsViewable !== false,
        },
      };

      const initResponse = await fetch(
        `${this.apiUrl}/videos?uploadType=resumable&part=snippet,status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Upload-Content-Type": videoData.mimeType || "video/*",
            "X-Upload-Content-Length": videoData.fileSize.toString(),
          },
          body: JSON.stringify(metadata),
        }
      );
      if (!initResponse.ok) {
        const errorData = (await initResponse.json()) as YouTubeApiError;
        throw new Error(
          `YouTube upload init failed: ${errorData.error?.message || initResponse.status}`
        );
      }

      const uploadUrl = initResponse.headers.get("Location");
      if (!uploadUrl) throw new Error("No upload URL received from YouTube");

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": videoData.mimeType || "video/*" },
        body: videoData.fileBuffer as BodyInit,
      });
      if (!uploadResponse.ok)
        throw new Error(
          `YouTube video upload failed: ${uploadResponse.status}`
        );

      const uploadResult = (await uploadResponse.json()) as YouTubeVideoItem;

      return {
        success: true,
        data: {
          success: true,
          videoId: uploadResult.id,
          platform: "youtube",
          url: `https://www.youtube.com/watch?v=${uploadResult.id}`,
          title: uploadResult.snippet?.title,
          status: uploadResult.status?.uploadStatus,
        },
      };
    });
  }

  async getChannelVideos(
    accessToken: string,
    maxResults: number = 25
  ): Promise<Result<VideoInfo[], Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/search?part=snippet&forMine=true&type=video&maxResults=${maxResults}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get channel videos: ${response.status}`);

      const data = (await response.json()) as YouTubeSearchListResponse;
      if (data.error)
        throw new Error(`Failed to get channel videos: ${data.error.message}`);

      const videos =
        data.items?.map((video: YouTubeSearchItem) => ({
          id: video.id.videoId,
          title: video.snippet.title,
          description: video.snippet.description,
          thumbnail:
            video.snippet.thumbnails?.high?.url ||
            video.snippet.thumbnails?.default?.url,
          publishedAt: video.snippet.publishedAt,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
        })) || [];

      return {
        success: true,
        data: videos,
      };
    });
  }

  async getVideoStatistics(
    accessToken: string,
    videoId: string
  ): Promise<Result<VideoStatistics, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/videos?part=statistics,snippet&id=${videoId}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get video statistics: ${response.status}`);

      const data = (await response.json()) as YouTubeVideoListResponse;
      const video = data.items?.[0];
      if (!video) throw new Error("Video not found");

      return {
        success: true,
        data: {
          viewCount: parseInt(video.statistics?.viewCount || "0", 10),
          likeCount: parseInt(video.statistics?.likeCount || "0", 10),
          commentCount: parseInt(video.statistics?.commentCount || "0", 10),
          title: video.snippet?.title,
          publishedAt: video.snippet?.publishedAt,
        },
      };
    });
  }

  async getChannelAnalytics(
    accessToken: string,
    metrics: string[],
    startDate: string,
    endDate: string
  ): Promise<Result<Record<string, number>, Error>> {
    return tryCatch(async () => {
      const metricsParam = metrics.join(",");
      const url = `${this.analyticsApiUrl}/reports?ids=channel==MINE&metrics=${metricsParam}&startDate=${startDate}&endDate=${endDate}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get channel analytics: ${response.status}`);

      const data = (await response.json()) as YouTubeAnalyticsReport;
      if (data.error)
        throw new Error(`YouTube analytics error: ${data.error.message}`);

      const result: Record<string, number> = {};
      data.columnHeaders?.forEach((header, index) => {
        result[header.name] = (data.rows?.[0]?.[index] as number) || 0;
      });

      return {
        success: true,
        data: result,
      };
    });
  }
}
