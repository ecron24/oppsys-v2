import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { appo } from "./appo";
import { supabase } from "./supabase";

const app = new Hono();
appo();
app.get("/", async (c) => {
  const a = await supabase.rpc("get_dashboard_overview", {
    p_user_id: "12",
  });
  console.log(a);
  return c.text("Hello Hono!");
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
