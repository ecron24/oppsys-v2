import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import z from "zod";
import {
  CreateTranscriptionInputSchema,
  ListTranscriptionsQuerySchema,
  TranscriptionStatsQuerySchema,
  CreateUploadUrlInputSchema,
  TranscriptionCallbackInputSchema,
} from "../domain/transcription-schema";
import { createUploadUrlUseCase } from "../app/create-upload-url-usecase";
import { createTranscriptionUseCase } from "../app/create-transcription-usecase";
import { getTranscriptionUseCase } from "../app/get-transcription-usecase";
import { listTranscriptionsUseCase } from "../app/list-transcriptions-usecase";
import { retryTranscriptionUseCase } from "../app/retry-transcription-usecase";
import { getTranscriptionStatsUseCase } from "../app/get-transcription-stats-usecase";
import { deleteTranscriptionUseCase } from "../app/delete-transcription-usecase";
import { cleanupExpiredFilesUseCase } from "../app/cleanup-expired-files-usecase";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { getUserInContext } from "src/lib/get-user-in-context";
import { handleTranscriptionCallbackUseCase } from "../app/handle-transcription-callback-usecase";
import { describeRoute, validator } from "hono-openapi";

export const transcriptionRouter = honoRouter((ctx) => {
  const router = new Hono()
    //  Créer une URL d'upload pour un fichier
    .post(
      "/upload-url",
      describeRoute({ description: "Create an upload URL for transcription" }),
      zValidatorWrapper("json", CreateUploadUrlInputSchema),
      validator("json", CreateUploadUrlInputSchema),
      async (c) => {
        const result = await createUploadUrlUseCase(ctx, c.req.valid("json"));
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Créer et lancer une transcription
    .post(
      "/",
      describeRoute({ description: "Create and start a transcription" }),
      zValidatorWrapper("json", CreateTranscriptionInputSchema),
      validator("json", CreateTranscriptionInputSchema),
      async (c) => {
        const user = getUserInContext(c);
        const result = await createTranscriptionUseCase(ctx, {
          body: c.req.valid("json"),
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Obtenir une transcription spécifique
    .get(
      "/:id",
      describeRoute({ description: "Get a specific transcription by ID" }),
      zValidatorWrapper("param", z.object({ id: z.uuid() })),
      validator("param", z.object({ id: z.uuid() })),
      async (c) => {
        const user = getUserInContext(c);
        const result = await getTranscriptionUseCase(ctx, {
          id: c.req.valid("param").id,
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Lister les transcriptions de l'utilisateur
    .get(
      "/",
      describeRoute({ description: "List user's transcriptions" }),
      zValidatorWrapper("query", ListTranscriptionsQuerySchema),
      validator("query", ListTranscriptionsQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const result = await listTranscriptionsUseCase(ctx, {
          ...c.req.valid("query"),
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Relancer une transcription échouée
    .post(
      "/:id/retry",
      describeRoute({ description: "Retry a failed transcription" }),
      zValidatorWrapper("param", z.object({ id: z.uuid() })),
      validator("param", z.object({ id: z.uuid() })),
      async (c) => {
        const user = getUserInContext(c);
        const result = await retryTranscriptionUseCase(ctx, {
          id: c.req.valid("param").id,
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Callback pour recevoir le résultat de N8N
    .post(
      "/:id/callback",
      describeRoute({ description: "Transcription callback endpoint (N8N)" }),
      zValidatorWrapper("param", z.object({ id: z.uuid() })),
      validator("param", z.object({ id: z.uuid() })),
      zValidatorWrapper("json", TranscriptionCallbackInputSchema),
      validator("json", TranscriptionCallbackInputSchema),
      async (c) => {
        const user = getUserInContext(c);
        const result = await handleTranscriptionCallbackUseCase(ctx, {
          transcriptionId: c.req.valid("param").id,
          body: c.req.valid("json"),
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Statistiques de transcription
    .get(
      "/stats",
      describeRoute({ description: "Get transcription statistics" }),
      zValidatorWrapper("query", TranscriptionStatsQuerySchema),
      validator("query", TranscriptionStatsQuerySchema),
      async (c) => {
        const user = getUserInContext(c);
        const result = await getTranscriptionStatsUseCase(ctx, {
          ...c.req.valid("query"),
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Supprimer une transcription et son fichier
    .delete(
      "/:id",
      describeRoute({ description: "Delete a transcription and its file" }),
      zValidatorWrapper("param", z.object({ id: z.uuid() })),
      validator("param", z.object({ id: z.uuid() })),
      async (c) => {
        const user = getUserInContext(c);
        const result = await deleteTranscriptionUseCase(ctx, {
          id: c.req.valid("param").id,
          user,
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )

    // Nettoyer les fichiers expirés (route admin)
    .post(
      "/cleanup",
      describeRoute({
        description: "Cleanup expired transcription files (admin)",
      }),
      async (c) => {
        const user = getUserInContext(c);
        const result = await cleanupExpiredFilesUseCase(ctx, { user });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );

  return router;
});
