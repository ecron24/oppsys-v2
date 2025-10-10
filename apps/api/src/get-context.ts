import { AuthRepoSupabase } from "./auth/infra/auth-repo-supabase";
import { n8nInstance } from "./lib/n8n-instance";
import { supabase } from "./lib/supabase";
import { LoggerWinston } from "./logger/infra/logger-winston";
import { GeneratedContentRepoSupabase } from "./generated-content/infra/generated-content-repo-supabase";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";
import { NotificationRepoSupabase } from "./notification/infra/notification-repo-supabase";
import { PlanRepoSupabase } from "./plan/infra/plan-repo-supabase";
import { ChatSessionRepoSupabase } from "./chat/infra/chat-session-repo-supabase";
import { ProfileRepoSupabase } from "./profile/infra/profile-repo-supabase";

export function getContext() {
  const logger = new LoggerWinston();
  const chatSessionRepo = new ChatSessionRepoSupabase(supabase, logger);

  return {
    planRepo: new PlanRepoSupabase(supabase, logger),
    profileRepo: new ProfileRepoSupabase(supabase),
    logger,
    moduleRepo: new ModuleRepoSupabase(supabase, logger),
    authRepo: new AuthRepoSupabase(supabase, logger),
    generatedContentRepo: new GeneratedContentRepoSupabase(supabase),
    notificationRepo: new NotificationRepoSupabase(supabase, logger),
    n8n: n8nInstance,
    chatSessionRepo,
  };
}
export type OppSysContext = ReturnType<typeof getContext>;
