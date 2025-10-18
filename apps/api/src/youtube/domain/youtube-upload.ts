import { z } from "zod";
import {
  IsoDatetime,
  nullableSchema,
  NumberNullableSchema,
  StringNullableSchema,
  UuidSchema,
} from "src/common/common-schema";

export const YouTubeUploadSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  moduleUsageId: UuidSchema,
  moduleId: UuidSchema,
  title: z.string(),
  description: StringNullableSchema,
  tags: nullableSchema(z.array(z.string())),
  videoType: z.enum(["video", "short", "live"]),
  privacy: z.enum(["public", "unlisted", "private"]).nullable(),
  category: StringNullableSchema,
  videoFileName: z.string(),
  videoFileSize: z.number(),
  videoFileType: z.string(),
  videoFilePath: z.string(),
  videoFileUrl: StringNullableSchema,
  thumbnailFileName: StringNullableSchema,
  thumbnailFilePath: StringNullableSchema,
  thumbnailFileUrl: StringNullableSchema,
  generateAiThumbnail: z.boolean(),
  costUsed: NumberNullableSchema,
  status: z.enum(["pending", "uploading", "published", "failed"]),
  youtubeVideoId: StringNullableSchema,
  youtubeVideoUrl: StringNullableSchema,
  youtubeThumbnailUrl: StringNullableSchema,
  youtubeStatus: StringNullableSchema,
  youtubePrivacyStatus: StringNullableSchema,
  youtubeEmbeddable: nullableSchema(z.boolean()),
  publishedAt: nullableSchema(IsoDatetime),
  n8nExecutionId: StringNullableSchema,
  retryCount: z.number().default(0),
  errorMessage: StringNullableSchema,
  viewCount: NumberNullableSchema,
  likeCount: NumberNullableSchema,
  commentCount: NumberNullableSchema,
  createdAt: IsoDatetime,
  updatedAt: nullableSchema(IsoDatetime),
});

export type YouTubeUpload = z.infer<typeof YouTubeUploadSchema>;

export const YouTubeUploadOptionsSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(5000).optional(),
  tags: z.array(z.string().max(30)).max(15).default([]),
  videoType: z.enum(["video", "short", "live"]).default("video"),
  privacy: z.enum(["public", "unlisted", "private"]).default("public"),
  category: z.string().default("22"),
  generateAiThumbnail: z.boolean().default(false),
  videoFilePath: z.string(),
  videoFileName: z.string(),
  videoFileSize: z.number().positive(),
  videoFileType: z.string(),
  thumbnailFilePath: z.string().optional(),
  thumbnailFileName: z.string().optional(),
  thumbnailFileType: z.string().optional(),
});

export type YouTubeUploadOptions = z.infer<typeof YouTubeUploadOptionsSchema>;

export const VideoFileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  path: z.string(),
});

export type VideoFile = z.infer<typeof VideoFileSchema>;

export const ThumbnailFileSchema = z.object({
  name: z.string(),
  size: z.number(),
  type: z.string(),
  path: z.string(),
});

export type ThumbnailFile = z.infer<typeof ThumbnailFileSchema>;

export type YouTubeStats = {
  periodDays: number;
  totalUploads: number;
  publishedCount: number;
  failedCount: number;
  pendingCount: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  avgViewsPerVideo: number;
  byVideoType: Record<string, unknown>;
  byPrivacy: Record<string, unknown>;
  recentUploads: unknown[];
};

export const TrendingTopicsSchema = z.object({
  category: z.string(),
  region: z.string(),
  trendingTopics: z.array(z.string()),
  generatedAt: z.string(),
});

export type TrendingTopics = z.infer<typeof TrendingTopicsSchema>;
