import { Hono } from "hono";
import { honoRouter } from "./lib/hono-router";
import { moduleRouter } from "./modules/presentation/module-router";
import { authRouter } from "./auth/presentation/auth-router";
import { authenticateToken } from "./auth/presentation/auth-middleware";
import { chatRouter } from "./chat/presentation/chat-router";
import { profileRouter } from "./profile/presentation/profile-router";
import { contentRouter } from "./content/presentation/content-router";
import { dashboardRouter } from "./dashboard/presentation/dashboard-router";
import { socialRouter } from "./social/presentation/social-router";
import { scheduleRouter } from "./schedule/presentation/schedule-router";
import { transcriptionRouter } from "./transcriptions/presentation/transcription-router";
import { documentsRouter } from "./documents/presentation/documents-router";
import { formationRouter } from "./formations/presentation/formation-router";
import { templateRouter } from "./templates/presentation/template-router";
import { youtubeRouter } from "./youtube/presentation/youtube-router";

export const apiRouter = honoRouter((ctx) => {
  const publicApiRouter = new Hono()
    .get("/api/health", (c) =>
      c.json({ status: "OK", timestamp: new Date().toISOString() }, 200)
    )
    .route("/api/auth", authRouter);

  const authenticatedApiRouter = new Hono()
    .use("*", authenticateToken(ctx, { skipUrls: ["/openapi", "/ui"] }))
    .route("/api/modules", moduleRouter)
    .route("/api/users", profileRouter)
    .route("/api/content", contentRouter)
    .route("/api/chat", chatRouter)
    .route("/api/dashboard", dashboardRouter)
    .route("/api/social", socialRouter)
    .route("/api/schedule", scheduleRouter)
    .route("/api/transcriptions", transcriptionRouter)
    .route("/api/documents", documentsRouter)
    .route("/api/formations", formationRouter)
    .route("/api/templates", templateRouter)
    .route("/api/youtube", youtubeRouter);

  const router = new Hono()
    .route("/", publicApiRouter)
    .route("/", authenticatedApiRouter);

  return router;
});
export type ApiRouter = typeof apiRouter;
