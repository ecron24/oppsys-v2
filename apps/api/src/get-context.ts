import { AuthRepoSupabase } from "./auth/infra/auth-repo-supabase";
import { supabase } from "./lib/supabase";
import { LoggerWinston } from "./logger/infra/logger-winston";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";
import { PlanRepoSupabase } from "./plan/infra/plan-repo-supabase";
import { ProfileRepoSupabase } from "./profile/infra/profile-repo-supabase";

export function getContext() {
  const logger = new LoggerWinston();
  return {
    planRepo: new PlanRepoSupabase(supabase),
    profileRepo: new ProfileRepoSupabase(supabase),
    logger,
    moduleRepo: new ModuleRepoSupabase(supabase, logger),
    authRepo: new AuthRepoSupabase(supabase, logger),
  };
}
export type OppSysContext = ReturnType<typeof getContext>;
