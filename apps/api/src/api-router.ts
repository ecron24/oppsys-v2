import { Hono } from "hono";
import { honoRouter } from "./lib/hono-router";
import { moduleRouter } from "./modules/presentation/module-router";

export const apiRouter = honoRouter(() => {
  const router = new Hono().route("/api/modules", moduleRouter);

  return router;
});
export type ApiRouter = typeof apiRouter;
