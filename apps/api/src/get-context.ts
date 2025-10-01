import { supabase } from "./lib/supabase";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";

export function getContext() {
  return {
    moduleRepo: new ModuleRepoSupabase(supabase),
  };
}
export type Context = ReturnType<typeof getContext>;
