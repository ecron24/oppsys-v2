import type { Json, OppSysSupabaseClient } from "@oppsys/supabase";
import type {
  YouTubeRepo,
  CreateVideoUploadUrlResult,
  CreateThumbnailUploadUrlResult,
  CreateYouTubeUploadResult,
  GetYouTubeStatsResult,
  GetYouTubeUploadByIdResult,
  CleanupExpiredUploadsResult,
  GetTrendingTopicsResult,
  ListYouTubeUploadsResult,
  DeleteYouTubeUploadResult,
  UpdateYouTubeUploadByIdResult,
  InsertYouTubeAnalyticsResult,
} from "../domain/youtube-repo";
import {
  YouTubeUploadSchema,
  type YouTubeUpload,
  type YouTubeStats,
} from "../domain/youtube-upload";
import { tryCatch } from "src/lib/try-catch";
import type { Logger } from "src/logger/domain/logger";
import { toCamelCase } from "src/lib/to-camel-case";
import { toSnakeCase } from "src/lib/to-snake-case";

export class YouTubeRepoSupabase implements YouTubeRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async createVideoUploadUrl(params: {
    userId: string;
    fileName: string;
    fileType: string;
    fileSize?: number;
  }): Promise<CreateVideoUploadUrlResult> {
    return await tryCatch(async () => {
      const { fileName, fileType, userId, fileSize } = params;
      const { data, error } = await this.supabase.rpc(
        "create_youtube_video_upload_url",
        {
          file_name: fileName,
          file_type: fileType,
          file_size: fileSize,
        }
      );

      if (error) {
        this.logger.error("[createVideoUploadUrl]: ", error, {
          userId,
          fileName,
          fileType,
        });
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from RPC");
      }

      const created = data as {
        signed_url: string;
        file_path: string;
      };
      return {
        success: true,
        data: {
          uploadUrl: created.signed_url,
          filePath: created.file_path,
        },
      } as const;
    });
  }

  async createThumbnailUploadUrl(params: {
    userId: string;
    fileName: string;
    fileType: string;
  }): Promise<CreateThumbnailUploadUrlResult> {
    return await tryCatch(async () => {
      const { fileName, fileType, userId } = params;
      const { data, error } = await this.supabase.rpc(
        "create_youtube_thumbnail_upload_url",
        {
          file_name: fileName,
          file_type: fileType,
        }
      );

      if (error) {
        this.logger.error("[createThumbnailUploadUrl]: ", error, {
          userId,
          fileName,
          fileType,
        });
        throw error;
      }

      if (!data) {
        throw new Error("No data returned from RPC");
      }

      const created = data as {
        signed_url: string;
        file_path: string;
      };

      return {
        success: true,
        data: {
          uploadUrl: created.signed_url,
          filePath: created.file_path,
        },
      } as const;
    });
  }

  async createYouTubeUpload(
    createData: Omit<YouTubeUpload, "id">
  ): Promise<CreateYouTubeUploadResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("youtube_uploads")
        .insert(toSnakeCase(createData))
        .select()
        .single();

      if (error) {
        this.logger.error("[createYouTubeUpload]: ", error, {
          data,
        });
        throw error;
      }

      return {
        success: true,
        data: YouTubeUploadSchema.parse(toCamelCase(data) as YouTubeUpload),
      } as const;
    });
  }

  async updateYouTubeUploadById(
    uploadId: string,
    updateData: Partial<YouTubeUpload>
  ): Promise<UpdateYouTubeUploadByIdResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("youtube_uploads")
        .update(toSnakeCase(updateData))
        .eq("id", uploadId)
        .select()
        .maybeSingle();

      if (error) {
        this.logger.error("[getYouTubeUploadById]: ", error, {
          uploadId,
          updateData,
        });
        throw error;
      }
      if (!data) {
        return {
          success: false,
          kind: "UPLOAD_NOT_FOUND",
          error: new Error("YouTube upload not found"),
        } as const;
      }

      const mapped = toCamelCase(data) as YouTubeUpload;
      return {
        success: true,
        data: YouTubeUploadSchema.parse(toCamelCase(mapped)),
      } as const;
    });
  }

  async getYouTubeStats(
    userId: string,
    period: number = 30
  ): Promise<GetYouTubeStatsResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase.rpc(
        "get_youtube_user_stats",
        {
          period_days: period,
        }
      );

      if (error) {
        this.logger.error("[getYouTubeStats]: ", error, { userId, period });
        throw error;
      }

      const stat = data as {
        period_days: number;
        total_uploads: number;
        published_count: number;
        failed_count: number;
        pending_count: number;
        total_views: number;
        total_likes: number;
        total_comments: number;
        avg_views_per_video: number;
        by_video_type: Record<string, unknown>;
        by_privacy: Record<string, unknown>;
        recent_uploads: unknown[];
      };

      return {
        success: true,
        data: toCamelCase(stat) as YouTubeStats,
      } as const;
    });
  }

  async getYouTubeUploadById(
    uploadId: string,
    userId: string
  ): Promise<GetYouTubeUploadByIdResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("youtube_uploads")
        .select("*")
        .eq("id", uploadId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        this.logger.error("[getYouTubeUploadById]: ", error, {
          uploadId,
          userId,
        });
        throw error;
      }
      if (!data) {
        return {
          success: false,
          kind: "UPLOAD_NOT_FOUND",
          error: new Error("YouTube upload not found"),
        } as const;
      }

      const mapped = toCamelCase(data) as YouTubeUpload;
      return {
        success: true,
        data: YouTubeUploadSchema.parse(toCamelCase(mapped)),
      } as const;
    });
  }

  async cleanupExpiredUploads(): Promise<CleanupExpiredUploadsResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.rpc(
        "cleanup_expired_youtube_uploads"
      );

      if (error) {
        this.logger.error("[cleanupExpiredUploads]: ", error);
        throw error;
      }

      return { success: true, data: undefined } as const;
    });
  }

  async getTrendingTopics(category: string): Promise<GetTrendingTopicsResult> {
    return await tryCatch(async () => {
      const trendingByCategory: Record<string, string[]> = {
        "22": ["gaming", "streaming", "esport", "gameplay"], // Entertainment
        "23": ["comedy", "humor", "funny", "viral"], // Comedy
        "24": ["music", "song", "cover", "lyrics"], // Music
        "25": ["news", "actualité", "info", "breaking"], // News
        "26": ["tutorial", "how-to", "guide", "tips"], // Education
        "27": ["tech", "technology", "review", "unboxing"], // Science & Technology
        "28": ["car", "auto", "vehicle", "drive"], // Autos & Vehicles
      };

      const topics = trendingByCategory[category] || [
        "trending",
        "viral",
        "popular",
      ];

      return {
        success: true,
        data: topics,
      } as const;
    });
  }

  async listYouTubeUploads(
    userId: string,
    query: {
      limit?: number;
      offset?: number;
      status?: string;
      videoType?: string;
    }
  ): Promise<ListYouTubeUploadsResult> {
    return await tryCatch(async () => {
      let q = this.supabase
        .from("youtube_uploads")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (query.status) {
        q = q.eq("status", query.status);
      }

      if (query.videoType) {
        q = q.eq("video_type", query.videoType);
      }

      if (typeof query.limit === "number" && typeof query.offset === "number") {
        q = q.range(query.offset, query.offset + query.limit - 1);
      }

      const { data, error, count } = await q;

      if (error) {
        this.logger.error("[listYouTubeUploads]: ", error, { userId, query });
        throw error;
      }

      const uploads = data.map(toCamelCase) as YouTubeUpload[];

      return {
        success: true,
        data: {
          data: uploads.map((upload) => YouTubeUploadSchema.parse(upload)),
          total: count || 0,
        },
      } as const;
    });
  }

  async deleteYouTubeUpload(
    uploadId: string,
    userId: string
  ): Promise<DeleteYouTubeUploadResult> {
    return await tryCatch(async () => {
      // Delete record
      const { error } = await this.supabase
        .from("youtube_uploads")
        .delete()
        .eq("id", uploadId)
        .eq("user_id", userId);

      if (error) {
        this.logger.error("[deleteYouTubeUpload]: ", error, {
          uploadId,
          userId,
        });
        throw error;
      }

      return { success: true, data: undefined } as const;
    });
  }

  async insertYouTubeAnalytics(analytics: {
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
  }): Promise<InsertYouTubeAnalyticsResult> {
    return await tryCatch(async () => {
      const payload = toSnakeCase({
        youtube_upload_id: analytics.uploadId,
        views_count: analytics.viewCount ?? 0,
        likes_count: analytics.likeCount ?? 0,
        comments_count: analytics.commentCount ?? 0,
        watch_time_minutes: analytics.watchTimeMinutes ?? 0,
        average_view_duration: analytics.averageViewDuration ?? 0,
        top_countries: (analytics.topCountries ?? {}) as Json,
        traffic_sources: (analytics.trafficSources ?? {}) as Json,
        period_start:
          analytics.periodStart ?? new Date().toISOString().split("T")[0],
        period_end:
          analytics.periodEnd ?? new Date().toISOString().split("T")[0],
      });

      const { error } = await this.supabase
        .from("youtube_analytics")
        .insert(payload);

      if (error) {
        this.logger.error("[insertYouTubeAnalytics]: ", error, {
          analytics: payload,
        });
        throw error;
      }

      return { success: true, data: undefined } as const;
    });
  }
}
