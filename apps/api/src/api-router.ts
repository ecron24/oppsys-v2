import { Hono } from "hono";
import { honoRouter } from "./lib/hono-router";
import { moduleRouter } from "./modules/presentation/module-router";
import { authRouter } from "./auth/presentation/auth-router";
import { authenticateToken } from "./auth/presentation/auth-middleware";

export const apiRouter = honoRouter(() => {
  const publicApiRouter = new Hono().get("/api/health", (c) =>
    c.json({ status: "OK", timestamp: new Date().toISOString() }, 200)
  );

  const authenticatedApiRouter = new Hono()
    .use(authenticateToken)
    .route("/api/modules", moduleRouter)
    .route("/api/auth", authRouter);

  const router = new Hono()
    .route("/", publicApiRouter)
    .route("/", authenticatedApiRouter);

  return router;
});
export type ApiRouter = typeof apiRouter;
