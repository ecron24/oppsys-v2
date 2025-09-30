import {
  createClient,
  SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";
import type { Database, DefaultSchema } from "./database.types";

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<"public">
): OppSysSupabaseClient {
  return createClient(supabaseUrl, supabaseKey, options);
}

export type OppSysSupabaseClient = SupabaseClient<
  Database,
  "public",
  "public",
  DefaultSchema
>;
