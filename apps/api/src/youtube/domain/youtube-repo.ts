import type { Result } from "@oppsys/shared";
import type { YouTubeUpload, YouTubeStats } from "./youtube-upload";

export type CreateVideoUploadUrlResult = Result<
  { uploadUrl: string; filePath: string },
  Error,
  "UNKNOWN_ERROR"
>;

export type CreateThumbnailUploadUrlResult = Result<
  { uploadUrl: string; filePath: string },
  Error,
  "UNKNOWN_ERROR"
>;

export type CreateYouTubeUploadResult = Result<
  YouTubeUpload,
  Error,
  "UNKNOWN_ERROR"
>;

export type GetYouTubeStatsResult = Result<
  YouTubeStats,
  Error,
  "UNKNOWN_ERROR"
>;

export type GetYouTubeUploadByIdResult = Result<
  YouTubeUpload,
  Error,
  "UNKNOWN_ERROR" | "UPLOAD_NOT_FOUND"
>;

export type UpdateYouTubeUploadByIdResult = Result<
  YouTubeUpload,
  Error,
  "UNKNOWN_ERROR" | "UPLOAD_NOT_FOUND"
>;

export type InsertYouTubeAnalyticsResult = Result<void, Error, "UNKNOWN_ERROR">;

export type CleanupExpiredUploadsResult = Result<void, Error, "UNKNOWN_ERROR">;

export type GetTrendingTopicsResult = Result<string[], Error, "UNKNOWN_ERROR">;

export type ListYouTubeUploadsResult = Result<
  { data: YouTubeUpload[]; total: number },
  Error,
  "UNKNOWN_ERROR"
>;

export type DeleteYouTubeUploadResult = Result<
  void,
  Error,
  "UNKNOWN_ERROR" | "UPLOAD_NOT_FOUND"
>;

export interface YouTubeRepo {
  createVideoUploadUrl(params: {
    userId: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  }): Promise<CreateVideoUploadUrlResult>;

  createThumbnailUploadUrl(params: {
    userId: string;
    fileName: string;
    fileType: string;
  }): Promise<CreateThumbnailUploadUrlResult>;

  createYouTubeUpload(
    data: Omit<YouTubeUpload, "id">
  ): Promise<CreateYouTubeUploadResult>;

  getYouTubeStats(
    userId: string,
    period: number
  ): Promise<GetYouTubeStatsResult>;

  getYouTubeUploadById(
    uploadId: string,
    userId: string
  ): Promise<GetYouTubeUploadByIdResult>;

  updateYouTubeUploadById(
    uploadId: string,
    data: Partial<YouTubeUpload>
  ): Promise<UpdateYouTubeUploadByIdResult>;

  insertYouTubeAnalytics(data: {
    uploadId: string;
    viewCount?: number;
    likeCount?: number;
    commentCount?: number;
    watchTimeMinutes?: number;
    averageViewDuration?: number;
    topCountries?: Record<string, unknown>;
    trafficSources?: Record<string, unknown>;
    periodStart?: string;
    periodEnd?: string;
    detailed?: boolean;
  }): Promise<InsertYouTubeAnalyticsResult>;

  cleanupExpiredUploads(): Promise<CleanupExpiredUploadsResult>;

  getTrendingTopics(category: string): Promise<GetTrendingTopicsResult>;

  listYouTubeUploads(
    userId: string,
    query: {
      limit?: number;
      offset?: number;
      status?: string;
      videoType?: string;
    }
  ): Promise<ListYouTubeUploadsResult>;

  deleteYouTubeUpload(
    uploadId: string,
    userId: string
  ): Promise<DeleteYouTubeUploadResult>;
}
