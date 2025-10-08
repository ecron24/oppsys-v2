import { AuthRepoSupabase } from "./auth/infra/auth-repo-supabase";
import { n8nInstance } from "./lib/n8n-instance";
import { supabase } from "./lib/supabase";
import { LoggerWinston } from "./logger/infra/logger-winston";
import { GeneratedContentRepoSupabase } from "./modules/infra/generated-content-repo-supabase";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";
import { NotificationRepoSupabase } from "./notification/infra/notification-repo-supabase";
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
    generatedContentRepo: new GeneratedContentRepoSupabase(supabase),
    notificationRepo: new NotificationRepoSupabase(supabase),
    n8n: n8nInstance,
  };
}
export type OppSysContext = ReturnType<typeof getContext>;
