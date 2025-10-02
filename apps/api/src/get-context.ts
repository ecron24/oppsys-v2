import { supabase } from "./lib/supabase";
import { LoggerWinston } from "./logger/infra/logger-winston";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";

export function getContext() {
  return {
    logger: new LoggerWinston(),
    moduleRepo: new ModuleRepoSupabase(supabase),
  };
}
export type Context = ReturnType<typeof getContext>;
