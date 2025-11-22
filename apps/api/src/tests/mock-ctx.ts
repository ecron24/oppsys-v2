import type { OppSysContext } from "src/get-context";
import { vi } from "vitest";

export function mockCtx(partial: Partial<OppSysContext>): OppSysContext {
  const unexpected = () => {
    throw new Error(
      "Unexpected ctx call — you forgot to mock this dependency in your test"
    );
  };
  const base = {
    planRepo: {
      getAll: vi.fn(unexpected),
      getByName: vi.fn(unexpected),
      getHistoryByUserId: vi.fn(unexpected),
    },
    profileRepo: {
      deleteById: vi.fn(unexpected),
      create: vi.fn(unexpected),
      getByIdWithPlan: vi.fn(unexpected),
      checkCredits: vi.fn(unexpected),
      deductCredits: vi.fn(unexpected),
      addCredits: vi.fn(unexpected),
      update: vi.fn(unexpected),
    },
    logger: {
      debug: vi.fn(unexpected),
      info: vi.fn(unexpected),
      warn: vi.fn(unexpected),
      error: vi.fn(unexpected),
    },
    moduleRepo: {
      list: vi.fn(unexpected),
      findByIdOrSlug: vi.fn(unexpected),
      listUsageHistory: vi.fn(unexpected),
      createUsage: vi.fn(unexpected),
      updateUsage: vi.fn(unexpected),
    },
    authRepo: {
      signUp: vi.fn(unexpected),
      signIn: vi.fn(unexpected),
      sendMagicLink: vi.fn(unexpected),
      signOut: vi.fn(unexpected),
      getUserByToken: vi.fn(unexpected),
    },
    notificationRepo: {
      create: vi.fn(unexpected),
    },
    n8n: {
      executeWorkflow: vi.fn(unexpected),
    },
    chatSessionRepo: {
      findActiveSession: vi.fn(unexpected),
      createSession: vi.fn(unexpected),
      updateChatSession: vi.fn(unexpected),
      getChatSession: vi.fn(unexpected),
      cleanupExpiredSessions: vi.fn(unexpected),
    },
    contentRepo: {
      getStats: vi.fn(unexpected),
      search: vi.fn(unexpected),
      create: vi.fn(unexpected),
      getAll: vi.fn(unexpected),
      getById: vi.fn(unexpected),
      update: vi.fn(unexpected),
      delete: vi.fn(unexpected),
      submitForApproval: vi.fn(unexpected),
      getApprovalHistory: vi.fn(unexpected),
      updateContentApproval: vi.fn(unexpected),
    },
    dashboardRepo: {
      getOverview: vi.fn(unexpected),
    },
    socialTokenManager: {
      saveToken: vi.fn(unexpected),
      getToken: vi.fn(unexpected),
      getValidToken: vi.fn(unexpected),
      refreshToken: vi.fn(unexpected),
      markTokenInvalid: vi.fn(unexpected),
      updateLastUsed: vi.fn(unexpected),
      deleteToken: vi.fn(unexpected),
      getAllUserTokens: vi.fn(unexpected),
    },
    socialAuthService: {
      initiateAuth: vi.fn(unexpected),
      completeAuth: vi.fn(unexpected),
      testConnection: vi.fn(unexpected),
      checkAllConnectionStatuses: vi.fn(unexpected),
      disconnectPlatform: vi.fn(unexpected),
    },
    socialTokenRepo: {
      upsert: vi.fn(unexpected),
      findByUserIdAndPlatform: vi.fn(unexpected),
      findByUserId: vi.fn(unexpected),
      deleteByUserIdAndPlatform: vi.fn(unexpected),
      updateByUserIdAndPlateform: vi.fn(unexpected),
    },
    scheduledTaskRepo: {
      listDueTasks: vi.fn(unexpected),
      markAsRun: vi.fn(unexpected),
    },
    transcriptionRepo: {
      create: vi.fn(unexpected),
      getById: vi.fn(unexpected),
    },
    formationRepo: {
      getById: vi.fn(unexpected),
    },
    templateRepo: {
      list: vi.fn(unexpected),
      getById: vi.fn(unexpected),
    },
    youtubeRepo: {
      createUpload: vi.fn(unexpected),
    },
    supabase: {},
  } as unknown as OppSysContext;

  return Object.assign(base, partial) as OppSysContext;
}
