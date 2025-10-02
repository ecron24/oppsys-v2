import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { supabase } from "./lib/supabase";
import { apiRouter, type ApiRouter } from "./api-router";
import { getUserProfileForService } from "@oppsys/supabase";
import { createLogger } from "@oppsys/logger";

const logger = createLogger();
const app = new Hono();
app.get("/", async (c) => {
  // const a = await supabase.rpc("get_dashboard_overview", {
  //   p_user_id: "12",
  // });
  // console.log(a);
  const prof = await getUserProfileForService(
    { supabase: supabase },
    { userId: "45377f20-8b85-42a1-b7c6-fb93491ec386" }
  );
  if (prof.success) {
    logger.info("prof", prof);
  } else {
    logger.error("[error]", prof.error);
  }

  return c.text("Hello Hono!");
});
app.route("/", apiRouter);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  }
);

export type { ApiRouter };
