import { Hono } from "hono";
import { honoRouter } from "./lib/hono-router";
import { moduleRouter } from "./modules/presentation/module-router";
import { authRouter } from "./auth/presentation/auth-router";
import { authenticateToken } from "./auth/presentation/auth-middleware";

export const apiRouter = honoRouter((ctx) => {
  const router = new Hono()
    .use(authenticateToken(ctx, { skipUrls: ["api/health", "api/auth/*"] }))
    .get("/api/health", (c) =>
      c.json({ status: "OK", timestamp: new Date().toISOString() }, 200)
    )
    .route("/api/auth", authRouter)
    .route("/api/modules", moduleRouter);

  return router;
});
export type ApiRouter = typeof apiRouter;
