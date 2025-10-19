import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { handleResultResponse } from "src/lib/handle-result-response";
import { getUserInContext } from "src/lib/get-user-in-context";
import {
  CreateVideoUploadUrlBody,
  createVideoUploadUrlUseCase,
} from "../app/create-video-upload-url-usecase";
import { describeRoute, validator } from "hono-openapi";
import {
  CreateThumbnailUploadUrlBody,
  createThumbnailUploadUrlUseCase,
} from "../app/create-thumbnail-upload-url-usecase";
import { createYouTubeUploadUseCase } from "../app/create-youtube-upload-usecase";
import { getYouTubeStatsUseCase } from "../app/get-youtube-stats-usecase";
import { getTrendingTopicsUseCase } from "../app/get-trending-topics-usecase";
import { listYouTubeUploadsUseCase } from "../app/list-youtube-uploads-usecase";
import { getYouTubeUploadUseCase } from "../app/get-youtube-upload-usecase";
import { retryYouTubeUploadUseCase } from "../app/retry-youtube-upload-usecase";
import {
  UpdateVideoAnalyticsBody,
  updateVideoAnalyticsUseCase,
} from "../app/update-video-analytics-usecase";
import { deleteYouTubeUploadUseCase } from "../app/delete-youtube-upload-usecase";
import {
  HandleYouTubeCallbackBody,
  handleYouTubeCallbackUseCase,
} from "../app/handle-youtube-callback-usecase";
import { cleanupExpiredUploadsUseCase } from "../app/cleanup-expired-uploads-usecase";
import { GetYoutubeStatsQuery } from "../app/get-youtube-stats-usecase";
import { ListYouTubeUploadsQuerySchema } from "../app/list-youtube-uploads-usecase";
import { YouTubeUploadOptionsSchema } from "../domain/youtube-upload";
import z from "zod";

export const youtubeRouter = honoRouter((ctx) => {
  const router = new Hono()
    // Créer une URL d'upload pour une vidéo
    .post(
      "/video-upload-url",
      describeRoute({ description: "Create video upload URL" }),
      zValidatorWrapper("json", CreateVideoUploadUrlBody),
      validator("json", CreateVideoUploadUrlBody),
      async (c) => {
        const user = getUserInContext(c);
        const body = { ...c.req.valid("json") };
        const result = await createVideoUploadUrlUseCase(ctx, { user, body });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    //  Créer une URL signée pour l'upload thumbnail
    .post(
      "/thumbnail-upload-url",
      describeRoute({ description: "Create thumbnail upload URL" }),
      zValidatorWrapper("json", CreateThumbnailUploadUrlBody),
      validator("json", CreateThumbnailUploadUrlBody),
      async (c) => {
        const user = getUserInContext(c);
        const body = { ...c.req.valid("json") };
        const result = await createThumbnailUploadUrlUseCase(ctx, {
          user,
          body,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Créer et lancer un upload YouTube
    .post(
      "/",
      describeRoute({ description: "Create and start a YouTube upload" }),
      zValidatorWrapper("json", YouTubeUploadOptionsSchema),
      validator("json", YouTubeUploadOptionsSchema),
      async (c) => {
        const user = getUserInContext(c);
        const body = { ...c.req.valid("json") };
        const result = await createYouTubeUploadUseCase(ctx, { user, body });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    // Statistiques YouTube de l'utilisateur
    .get(
      "/stats",
      describeRoute({ description: "Get YouTube statistics for user" }),
      zValidatorWrapper("query", GetYoutubeStatsQuery),
      validator("query", GetYoutubeStatsQuery),
      async (c) => {
        const user = getUserInContext(c);
        const query = { ...c.req.valid("query") };
        const result = await getYouTubeStatsUseCase(ctx, { user, query });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Obtenir les trending topics pour une catégorie
    .get("/trending/:category", async (c) => {
      const { category } = c.req.param();
      const result = await getTrendingTopicsUseCase(ctx, { category });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })

    // Lister les uploads YouTube de l'utilisateur
    .get(
      "/",
      describeRoute({ description: "List user's YouTube uploads" }),
      zValidatorWrapper("query", ListYouTubeUploadsQuerySchema),
      validator("query", ListYouTubeUploadsQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const query = { ...c.req.valid("query") };
        const result = await listYouTubeUploadsUseCase(ctx, { user, query });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Obtenir un upload YouTube spécifique
    .get(
      "/:id",
      describeRoute({ description: "Get a YouTube upload by ID" }),
      zValidatorWrapper("param", z.uuid()),
      validator("param", z.uuid()),
      async (c) => {
        const user = getUserInContext(c);
        const id = c.req.valid("param");
        const result = await getYouTubeUploadUseCase(ctx, { id, user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Relancer un upload YouTube échoué
    .post(
      "/:id/retry",
      describeRoute({ description: "Retry a failed YouTube upload" }),
      zValidatorWrapper("param", z.uuid()),
      validator("param", z.uuid()),
      async (c) => {
        const user = getUserInContext(c);
        const id = c.req.valid("param");
        const result = await retryYouTubeUploadUseCase(ctx, { id, user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    //  Mettre à jour les analytics d'une vidéo
    .post(
      "/:id/analytics",
      describeRoute({ description: "Update video analytics" }),
      zValidatorWrapper("param", z.uuid()),
      validator("param", z.uuid()),
      zValidatorWrapper("json", UpdateVideoAnalyticsBody),
      validator("json", UpdateVideoAnalyticsBody),
      async (c) => {
        const id = c.req.valid("param");
        const body = c.req.valid("json");
        const result = await updateVideoAnalyticsUseCase(ctx, {
          id,
          body,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    // Supprimer un upload YouTube et ses fichiers
    .delete(
      "/:id",
      describeRoute({ description: "Delete a YouTube upload and its files" }),
      zValidatorWrapper("param", z.uuid()),
      validator("param", z.uuid()),
      async (c) => {
        const user = getUserInContext(c);
        const id = c.req.valid("param");
        const result = await deleteYouTubeUploadUseCase(ctx, { user, id });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Callback pour recevoir le résultat de N8N
    .post(
      "/:id/callback",
      describeRoute({ description: "YouTube callback endpoint (N8N)" }),
      zValidatorWrapper("json", HandleYouTubeCallbackBody),
      validator("json", HandleYouTubeCallbackBody),
      async (c) => {
        const user = getUserInContext(c);
        const { id } = c.req.param();
        const body = c.req.valid("json");
        const result = await handleYouTubeCallbackUseCase(ctx, {
          uploadId: id,
          body,
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    //  Nettoyer les fichiers expirés (route admin)
    .post(
      "/cleanup",
      describeRoute({ description: "Cleanup expired uploads (admin)" }),
      async (c) => {
        const user = getUserInContext(c);
        const result = await cleanupExpiredUploadsUseCase(ctx, { user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );

  return router;
});
