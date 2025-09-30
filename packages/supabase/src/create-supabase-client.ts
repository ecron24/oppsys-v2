import {
  createClient,
  SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";

export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string,
  options?: SupabaseClientOptions<"public">
): OppSysSupabaseClient {
  return createClient(supabaseUrl, supabaseKey, options);
}

export type OppSysSupabaseClient = SupabaseClient<
  any,
  "public",
  "public",
  any,
  any
>;
