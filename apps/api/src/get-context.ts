import { AuthRepoSupabase } from "./auth/infra/auth-repo-supabase";
import { n8nInstance } from "./lib/n8n-instance";
import { supabase } from "./lib/supabase";
import { LoggerWinston } from "./logger/infra/logger-winston";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";
import { NotificationRepoSupabase } from "./notification/infra/notification-repo-supabase";
import { PlanRepoSupabase } from "./plan/infra/plan-repo-supabase";
import { ChatSessionRepoSupabase } from "./chat/infra/chat-session-repo-supabase";
import { ProfileRepoSupabase } from "./profile/infra/profile-repo-supabase";
import { ContentRepoSupabase } from "./content/infra/content-repo-supabase";
import { DashboardRepoSupabase } from "./dashboard/infra/dashboard-repo-supabase";
import { SocialAuthService } from "./social/app/services/social-auth-service";
import { SocialTokenManager } from "./social/app/services/social-token-manager";

export function getContext() {
  const logger = new LoggerWinston();
  const chatSessionRepo = new ChatSessionRepoSupabase(supabase, logger);
  const socialTokenManager = new SocialTokenManager(supabase, logger);

  return {
    planRepo: new PlanRepoSupabase(supabase, logger),
    profileRepo: new ProfileRepoSupabase(supabase),
    logger,
    moduleRepo: new ModuleRepoSupabase(supabase, logger),
    authRepo: new AuthRepoSupabase(supabase, logger),
    notificationRepo: new NotificationRepoSupabase(supabase, logger),
    n8n: n8nInstance,
    chatSessionRepo,
    contentRepo: new ContentRepoSupabase(supabase, logger),
    dashboardRepo: new DashboardRepoSupabase(supabase, logger),
    socialTokenManager,
    socialAuthService: new SocialAuthService(socialTokenManager, logger),
  };
}
export type OppSysContext = ReturnType<typeof getContext>;
