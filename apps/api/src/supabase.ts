import { createSupabaseClient } from "@oppsys/supabase";
import { env } from "./env";

export const supabase = createSupabaseClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE
);
