import type { Result } from "@oppsys/utils";
import { tryCatch } from "src/lib/try-catch";
import type {
  SocialProvider,
  SocialProviderTokenData,
} from "./social-provider";

interface TikTokTokenData extends SocialProviderTokenData {
  openId?: string;
}

interface TikTokUserProfile {
  id: string;
  name: string;
  username?: string;
  picture?: string;
  followerCount?: number;
  followingCount?: number;
  likesCount?: number;
  videoCount?: number;
  unionId?: string;
}

interface VideoData {
  fileSize: number;
  chunkSize?: number;
  mimeType?: string;
  title?: string;
  description?: string;
  privacyLevel?: "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "SELF_ONLY";
  disableDuet?: boolean;
  disableComment?: boolean;
  disableStitch?: boolean;
  coverTimestamp?: number;
  fileBuffer: ArrayBuffer | Uint8Array;
}

interface UploadResult {
  success: boolean;
  videoId: string;
  platform: string;
  status: string;
  message: string;
}

interface TikTokVideo {
  id: string;
  title: string;
  video_description: string;
  duration: number;
  cover_image_url: string;
  embed_link: string;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
}

interface VideoListResult {
  videos: TikTokVideo[];
  cursor: number;
  hasMore: boolean;
}

// Types pour les réponses des API TikTok
type TikTokApiError = {
  error?: { code: string; message: string; log_id: string };
};
type TikTokTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  open_id?: string;
};
type TikTokUser = {
  open_id: string;
  union_id: string;
  avatar_url: string;
  display_name: string;
  username: string;
  follower_count?: number;
  following_count?: number;
  likes_count?: number;
  video_count?: number;
};
type TikTokUserResponseWrapper = {
  data: { user: TikTokUser };
} & TikTokApiError;
type TikTokUploadInitResponse = {
  data: { publish_id: string; upload_url: string };
} & TikTokApiError;
type TikTokVideoListResponse = {
  data: { videos: TikTokVideo[]; cursor: number; has_more: boolean };
} & TikTokApiError;
type TikTokAnalyticsResponse = {
  data: { videos: TikTokVideo[] };
} & TikTokApiError;
type TikTokHashtagResponse = { data: { hashtags: string[] } } & TikTokApiError;

export class TikTokProvider implements SocialProvider {
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private tokenUrl: string;
  private apiUrl: string;

  constructor() {
    this.clientId = process.env.TIKTOK_CLIENT_ID!;
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
    this.baseUrl = "https://www.tiktok.com/v2/auth/authorize";
    this.tokenUrl = "https://open.tiktokapis.com/v2/oauth/token";
    this.apiUrl = "https://open.tiktokapis.com/v2";

    if (!this.clientId || !this.clientSecret) {
      throw new Error("TikTok OAuth credentials not configured");
    }
  }

  async getAuthUrl(state: string, redirectUri?: string): Promise<string> {
    const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
    const redirect = redirectUri || defaultRedirectUri;

    const params = new URLSearchParams({
      client_key: this.clientId,
      redirect_uri: redirect,
      state: state,
      scope:
        "user.info.basic,user.info.profile,user.info.stats,video.list,video.upload",
      response_type: "code",
    });

    return `${this.baseUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(
    code: string,
    redirectUri?: string
  ): Promise<Result<TikTokTokenData, Error>> {
    return tryCatch(async () => {
      const defaultRedirectUri = `${process.env.FRONTEND_URL}/auth/social/callback`;
      const redirect = redirectUri || defaultRedirectUri;

      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: this.clientId,
          client_secret: this.clientSecret,
          code: code,
          grant_type: "authorization_code",
          redirect_uri: redirect,
        }),
      });

      if (!response.ok)
        throw new Error(
          `TikTok token exchange failed: ${await response.text()}`
        );

      const data = (await response.json()) as TikTokTokenResponse &
        TikTokApiError;
      if (data.error) throw new Error(`TikTok error: ${data.error.message}`);

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
          openId: data.open_id,
        },
      };
    });
  }

  async getUserProfile(
    accessToken: string
  ): Promise<Result<TikTokUserProfile, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/user/info/?fields=open_id,union_id,avatar_url,display_name,username,follower_count,following_count,likes_count,video_count`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error(`TikTok API error: ${response.status}`);

      const result = (await response.json()) as TikTokUserResponseWrapper;
      if (result.error)
        throw new Error(`TikTok API error: ${result.error.message}`);

      const userData = result.data.user;

      return {
        success: true,
        data: {
          id: userData.open_id,
          name: userData.display_name,
          username: userData.username,
          picture: userData.avatar_url,
          followerCount: userData.follower_count,
          followingCount: userData.following_count,
          likesCount: userData.likes_count,
          videoCount: userData.video_count,
          unionId: userData.union_id,
        },
      };
    });
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<Result<TikTokTokenData, Error>> {
    return tryCatch(async () => {
      const response = await fetch(this.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (!response.ok)
        throw new Error(`TikTok token refresh failed: ${response.status}`);

      const data = (await response.json()) as TikTokTokenResponse &
        TikTokApiError;
      if (data.error)
        throw new Error(`TikTok refresh error: ${data.error.message}`);

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
          openId: data.open_id,
        },
      };
    });
  }

  async validateToken(accessToken: string): Promise<Result<boolean, Error>> {
    return tryCatch(async () => {
      const response = await fetch(`${this.apiUrl}/user/info/?fields=open_id`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) return { success: true, data: false };

      const data = (await response.json()) as TikTokUserResponseWrapper;
      return {
        success: true,
        data: !data.error && !!data.data?.user?.open_id,
      };
    });
  }

  async uploadVideo(
    accessToken: string,
    videoData: VideoData
  ): Promise<Result<UploadResult, Error>> {
    return tryCatch(async () => {
      const initResponse = await fetch(
        `${this.apiUrl}/post/publish/video/init/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            source_info: {
              source: "FILE_UPLOAD",
              video_size: videoData.fileSize,
            },
          }),
        }
      );
      if (!initResponse.ok) {
        const errorData = (await initResponse.json()) as TikTokApiError;
        throw new Error(
          `TikTok upload init failed: ${errorData.error?.message || initResponse.status}`
        );
      }
      const initData = (await initResponse.json()) as TikTokUploadInitResponse;
      const { publish_id, upload_url } = initData.data;

      let bodyData: Blob;

      if (videoData.fileBuffer instanceof ArrayBuffer) {
        bodyData = new Blob([videoData.fileBuffer]);
      } else if (videoData.fileBuffer instanceof Uint8Array) {
        const arrayBuffer = new ArrayBuffer(videoData.fileBuffer.length);
        const view = new Uint8Array(arrayBuffer);
        view.set(videoData.fileBuffer);
        bodyData = new Blob([arrayBuffer]);
      } else {
        throw new Error("Type de buffer non supporté pour TikTok upload");
      }

      const uploadResponse = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": videoData.mimeType || "video/mp4" },
        body: bodyData,
      });

      if (!uploadResponse.ok)
        throw new Error(`TikTok video upload failed: ${uploadResponse.status}`);

      const publishResponse = await fetch(
        `${this.apiUrl}/post/publish/status/fetch/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ publish_id }),
        }
      );

      if (!publishResponse.ok) {
        const errorData = (await publishResponse.json()) as TikTokApiError;
        throw new Error(
          `TikTok publish failed: ${errorData.error?.message || publishResponse.status}`
        );
      }

      const publishResult = (await publishResponse.json()) as {
        data: { status: string };
      } & TikTokApiError;

      return {
        success: true,
        data: {
          success: true,
          videoId: publish_id,
          platform: "tiktok",
          status: publishResult.data.status,
          message: "Video uploaded successfully and is being processed",
        },
      };
    });
  }

  async getUserVideos(
    accessToken: string,
    cursor: number = 0,
    maxCount: number = 20
  ): Promise<Result<VideoListResult, Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/video/list/?fields=id,title,video_description,duration,cover_image_url,embed_link,like_count,comment_count,share_count,view_count&max_count=${maxCount}&cursor=${cursor}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(`Failed to get user videos: ${response.status}`);

      const data = (await response.json()) as TikTokVideoListResponse;
      if (data.error)
        throw new Error(`TikTok API error: ${data.error.message}`);

      return {
        success: true,
        data: {
          videos: data.data.videos || [],
          cursor: data.data.cursor,
          hasMore: data.data.has_more,
        },
      };
    });
  }

  async getVideoAnalytics(
    accessToken: string,
    videoIds: string[]
  ): Promise<Result<TikTokVideo[], Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/video/query/?fields=id,title,like_count,comment_count,share_count,view_count`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filters: { video_ids: videoIds } }),
      });
      if (!response.ok)
        throw new Error(`Failed to get video analytics: ${response.status}`);

      const data = (await response.json()) as TikTokAnalyticsResponse;
      if (data.error)
        throw new Error(`TikTok analytics error: ${data.error.message}`);

      return {
        success: true,
        data: data.data.videos || [],
      };
    });
  }

  async getHashtagSuggestions(
    accessToken: string,
    keyword: string
  ): Promise<Result<string[], Error>> {
    return tryCatch(async () => {
      const url = `${this.apiUrl}/research/hashtag/suggest/?keyword=${encodeURIComponent(keyword)}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok)
        throw new Error(
          `Failed to get hashtag suggestions: ${response.status}`
        );

      const data = (await response.json()) as TikTokHashtagResponse;
      if (data.error)
        throw new Error(`TikTok hashtag error: ${data.error.message}`);

      return {
        success: true,
        data: data.data.hashtags || [],
      };
    });
  }
}
