import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { apiRouter, type ApiRouter } from "./api-router";
import { createLogger } from "@oppsys/logger";
import { timeout } from "hono/timeout";
import { secureHeaders } from "hono/secure-headers";
import { cors } from "hono/cors";
import { env } from "./env";
import { rateLimiter } from "hono-rate-limiter";
import { bodyLimit } from "hono/body-limit";

const logger = createLogger();
const app = new Hono();

app.use(async (c, next) => {
  const path = c.req.path;
  // Si le chemin correspond à /api/modules/.../execute, on met 5 minutes (300000 ms)
  if (path.includes("/api/modules/") && path.includes("/execute")) {
    return timeout(300_000)(c, next);
  } else {
    // Timeout normal : 30 secondes
    return timeout(30_000)(c, next);
  }
});

app.use(secureHeaders());
app.use(
  cors({
    origin: env.CORS_ORIGINS.split(",").map((origin) => origin.trim()),
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],

    allowHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Access-Control-Request-Method",
      "Access-Control-Request-Headers",
      "X-OppsYs-User-ID", // Headers custom de OppsYs
      "X-OppsYs-User-Plan",
      "X-OppsYs-Module",
      "User-Agent",
    ],

    // Headers exposés au client
    exposeHeaders: [
      "X-Total-Count",
      "X-Rate-Limit-Remaining",
      "X-Rate-Limit-Reset",
    ],
  })
);

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    keyGenerator: () => crypto.randomUUID(),
    message: "Too many requests, please try again later.",
  })
);

app.use(
  bodyLimit({
    maxSize: 1 * 1024 * 1024, // 1mb
  })
);

app.get("/health", (c) =>
  c.json({ status: "OK", timestamp: new Date().toISOString() })
);

app.get("/", async (c) => {
  return c.json({ message: "Welcome to OppsYs API" });
});

// api routes
app.route("/", apiRouter);

app.notFound((c) => {
  return c.json({ error: "Not found" }, 404);
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  }
);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down gracefully");
  process.exit(0);
});

export type { ApiRouter };
