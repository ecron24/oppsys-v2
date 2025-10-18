import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { handleResultResponse } from "src/lib/handle-result-response";
import { getUserInContext } from "src/lib/get-user-in-context";
import {
  CreateVideoUploadUrlBody,
  createVideoUploadUrlUseCase,
} from "../app/create-video-upload-url-usecase";
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
      zValidatorWrapper("json", CreateVideoUploadUrlBody),
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
      zValidatorWrapper("json", CreateThumbnailUploadUrlBody),
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
      zValidatorWrapper("json", YouTubeUploadOptionsSchema),
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
      zValidatorWrapper("query", GetYoutubeStatsQuery),
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
      zValidatorWrapper("query", ListYouTubeUploadsQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const query = { ...c.req.valid("query") };
        const result = await listYouTubeUploadsUseCase(ctx, { user, query });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Obtenir un upload YouTube spécifique
    .get("/:id", zValidatorWrapper("param", z.uuid()), async (c) => {
      const user = getUserInContext(c);
      const id = c.req.valid("param");
      const result = await getYouTubeUploadUseCase(ctx, { id, user });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })

    // Relancer un upload YouTube échoué
    .post("/:id/retry", zValidatorWrapper("param", z.uuid()), async (c) => {
      const user = getUserInContext(c);
      const id = c.req.valid("param");
      const result = await retryYouTubeUploadUseCase(ctx, { id, user });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })

    //  Mettre à jour les analytics d'une vidéo
    .post(
      "/:id/analytics",
      zValidatorWrapper("param", z.uuid()),
      zValidatorWrapper("json", UpdateVideoAnalyticsBody),
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
    .delete("/:id", zValidatorWrapper("param", z.uuid()), async (c) => {
      const user = getUserInContext(c);
      const id = c.req.valid("param");
      const result = await deleteYouTubeUploadUseCase(ctx, { user, id });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })

    // Callback pour recevoir le résultat de N8N
    .post(
      "/:id/callback",
      zValidatorWrapper("json", HandleYouTubeCallbackBody),
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
    .post("/cleanup", async (c) => {
      const user = getUserInContext(c);
      const result = await cleanupExpiredUploadsUseCase(ctx, { user });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    });

  return router;
});
