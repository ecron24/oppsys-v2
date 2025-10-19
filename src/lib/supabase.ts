import { createSupabaseClient } from "@oppsys/supabase";
import { env } from "../env";

export const supabase = createSupabaseClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_ANON_KEY
);
