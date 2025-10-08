import { createN8nInstance } from "@oppsys/n8n";
import { supabase } from "./supabase";
import { env } from "src/env";

export const n8nInstance = createN8nInstance({
  supabase: supabase,
  N8N_WEBHOOK_AUTH_PASS: env.N8N_WEBHOOK_AUTH_PASS,
  N8N_WEBHOOK_AUTH_USER: env.N8N_WEBHOOK_AUTH_USER,
});
