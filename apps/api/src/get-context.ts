import { AuthRepoSupabase } from "./auth/infra/auth-repo-supabase";
import { supabase } from "./lib/supabase";
import { LoggerWinston } from "./logger/infra/logger-winston";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";

export function getContext() {
  const logger = new LoggerWinston();
  return {
    logger,
    moduleRepo: new ModuleRepoSupabase(supabase, logger),
    authRepo: new AuthRepoSupabase(supabase, logger),
  };
}
export type Context = ReturnType<typeof getContext>;
