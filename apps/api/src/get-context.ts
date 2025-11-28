import { AuthRepoSupabase } from "./auth/infra/auth-repo-supabase";
import { n8nInstance } from "./lib/n8n-instance";
import { supabase } from "./lib/supabase";
import { ModuleRepoSupabase } from "./modules/infra/module-repo-supabase";
import { NotificationRepoSupabase } from "./notification/infra/notification-repo-supabase";
import { PlanRepoSupabase } from "./plan/infra/plan-repo-supabase";
import { ChatSessionRepoSupabase } from "./chat/infra/chat-session-repo-supabase";
import { ProfileRepoSupabase } from "./profile/infra/profile-repo-supabase";
import { ContentRepoSupabase } from "./content/infra/content-repo-supabase";
import { DashboardRepoSupabase } from "./dashboard/infra/dashboard-repo-supabase";
import { SocialTokenRepoSupabase } from "./social/infra/social-token-repo-supabase";
import { SocialAuthService } from "./social/app/services/social-auth-service";
import { SocialTokenManager } from "./social/app/services/social-token-manager";
import { ScheduledTaskRepoSupabase } from "./schedule/infra/scheduled-task-repo-supabase";
import { TranscriptionRepoSupabase } from "./transcriptions/infra/transcription-repo-supabase";
import { FormationRepoSupabase } from "./formations/infra/formation-repo-supabase";
import { TemplateRepoSupabase } from "./templates/infra/template-repo-supabase";
import { YouTubeRepoSupabase } from "./youtube/infra/youtube-repo-supabase";
import { createLogger } from "./logger/create-logger";

export function getContext() {
  const logger = createLogger("<default>");
  const chatSessionRepo = new ChatSessionRepoSupabase(
    supabase,
    createLogger("chat-session-repo")
  );
  const socialTokenRepo = new SocialTokenRepoSupabase(
    supabase,
    createLogger("social-token-repo")
  );
  const socialTokenManager = new SocialTokenManager(
    socialTokenRepo,
    createLogger("social-token-manager")
  );
  const transcriptionRepo = new TranscriptionRepoSupabase(
    supabase,
    createLogger("transcription-repo")
  );

  return {
    planRepo: new PlanRepoSupabase(supabase, createLogger("plan-repo")),
    profileRepo: new ProfileRepoSupabase(
      supabase,
      createLogger("profile-repo")
    ),
    logger,
    moduleRepo: new ModuleRepoSupabase(supabase, createLogger("module-repo")),
    authRepo: new AuthRepoSupabase(supabase, createLogger("auth-repo")),
    notificationRepo: new NotificationRepoSupabase(
      supabase,
      createLogger("notification-repo")
    ),
    n8n: n8nInstance,
    chatSessionRepo,
    contentRepo: new ContentRepoSupabase(
      supabase,
      createLogger("content-repo")
    ),
    dashboardRepo: new DashboardRepoSupabase(
      supabase,
      createLogger("dashboard-repo")
    ),
    socialTokenManager,
    socialAuthService: new SocialAuthService(
      socialTokenManager,
      createLogger("social-auth-service")
    ),
    socialTokenRepo,
    scheduledTaskRepo: new ScheduledTaskRepoSupabase(
      supabase,
      createLogger("scheduled-task-repo")
    ),
    transcriptionRepo,
    formationRepo: new FormationRepoSupabase(
      supabase,
      createLogger("formation-repo")
    ),
    templateRepo: new TemplateRepoSupabase(
      supabase,
      createLogger("template-repo")
    ),
    youtubeRepo: new YouTubeRepoSupabase(
      supabase,
      createLogger("youtube-repo")
    ),
    supabase,
  };
}
export type OppSysContext = ReturnType<typeof getContext>;
