import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { env } from "src/env";

export function requireCronSecret(c: Context) {
  const cronSecret = c.req.header("authorization")?.split(" ")[1];
  if (cronSecret !== env.CRON_SECRET) {
    throw new HTTPException(401, {
      message: "No cron secret provided or invalid",
    });
  }
}
