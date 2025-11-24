import type { OppSysContext } from "src/get-context";
import { vi } from "vitest";

export function mockCtx(partial: Partial<OppSysContext>): OppSysContext {
  const unexpected = (name: string) => {
    throw new Error(
      `Unexpected ctx call — you forgot to mock "${name}" in your test`
    );
  };
  const base = {
    planRepo: {
      getAll: vi.fn(() => unexpected("planRepo.getAll")),
      getByName: vi.fn(() => unexpected("planRepo.getByName")),
      getHistoryByUserId: vi.fn(() =>
        unexpected("planRepo.getHistoryByUserId")
      ),
    },
    profileRepo: {
      deleteById: vi.fn(() => unexpected("profileRepo.deleteById")),
      create: vi.fn(() => unexpected("profileRepo.create")),
      getByIdWithPlan: vi.fn(() => unexpected("profileRepo.getByIdWithPlan")),
      checkCredits: vi.fn(() => unexpected("profileRepo.checkCredits")),
      deductCredits: vi.fn(() => unexpected("profileRepo.deductCredits")),
      addCredits: vi.fn(() => unexpected("profileRepo.addCredits")),
      update: vi.fn(() => unexpected("profileRepo.update")),
    },
    logger: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
    moduleRepo: {
      list: vi.fn(() => unexpected("moduleRepo.list")),
      findByIdOrSlug: vi.fn(() => unexpected("moduleRepo.findByIdOrSlug")),
      listUsageHistory: vi.fn(() => unexpected("moduleRepo.listUsageHistory")),
      createUsage: vi.fn(() => unexpected("moduleRepo.createUsage")),
      updateUsage: vi.fn(() => unexpected("moduleRepo.updateUsage")),
    },
    authRepo: {
      signUp: vi.fn(() => unexpected("authRepo.signUp")),
      signIn: vi.fn(() => unexpected("authRepo.signIn")),
      sendMagicLink: vi.fn(() => unexpected("authRepo.sendMagicLink")),
      signOut: vi.fn(() => unexpected("authRepo.signOut")),
      getUserByToken: vi.fn(() => unexpected("authRepo.getUserByToken")),
    },
    notificationRepo: {
      create: vi.fn(() => unexpected("notificationRepo.create")),
    },
    n8n: {
      executeWorkflow: vi.fn(() => unexpected("n8n.executeWorkflow")),
    },
    chatSessionRepo: {
      findActiveSession: vi.fn(() =>
        unexpected("chatSessionRepo.findActiveSession")
      ),
      createSession: vi.fn(() => unexpected("chatSessionRepo.createSession")),
      updateChatSession: vi.fn(() =>
        unexpected("chatSessionRepo.updateChatSession")
      ),
      getChatSession: vi.fn(() => unexpected("chatSessionRepo.getChatSession")),
      cleanupExpiredSessions: vi.fn(() =>
        unexpected("chatSessionRepo.cleanupExpiredSessions")
      ),
    },
    contentRepo: {
      getStats: vi.fn(() => unexpected("contentRepo.getStats")),
      search: vi.fn(() => unexpected("contentRepo.search")),
      create: vi.fn(() => unexpected("contentRepo.create")),
      getAll: vi.fn(() => unexpected("contentRepo.getAll")),
      getById: vi.fn(() => unexpected("contentRepo.getById")),
      update: vi.fn(() => unexpected("contentRepo.update")),
      delete: vi.fn(() => unexpected("contentRepo.delete")),
      submitForApproval: vi.fn(() =>
        unexpected("contentRepo.submitForApproval")
      ),
      getApprovalHistory: vi.fn(() =>
        unexpected("contentRepo.getApprovalHistory")
      ),
      updateContentApproval: vi.fn(() =>
        unexpected("contentRepo.updateContentApproval")
      ),
    },
    dashboardRepo: {
      getOverview: vi.fn(() => unexpected("dashboardRepo.getOverview")),
    },
    socialTokenManager: {
      saveToken: vi.fn(() => unexpected("socialTokenManager.saveToken")),
      getToken: vi.fn(() => unexpected("socialTokenManager.getToken")),
      getValidToken: vi.fn(() =>
        unexpected("socialTokenManager.getValidToken")
      ),
      refreshToken: vi.fn(() => unexpected("socialTokenManager.refreshToken")),
      markTokenInvalid: vi.fn(() =>
        unexpected("socialTokenManager.markTokenInvalid")
      ),
      updateLastUsed: vi.fn(() =>
        unexpected("socialTokenManager.updateLastUsed")
      ),
      deleteToken: vi.fn(() => unexpected("socialTokenManager.deleteToken")),
      getAllUserTokens: vi.fn(() =>
        unexpected("socialTokenManager.getAllUserTokens")
      ),
    },
    socialAuthService: {
      initiateAuth: vi.fn(() => unexpected("socialAuthService.initiateAuth")),
      completeAuth: vi.fn(() => unexpected("socialAuthService.completeAuth")),
      testConnection: vi.fn(() =>
        unexpected("socialAuthService.testConnection")
      ),
      checkAllConnectionStatuses: vi.fn(() =>
        unexpected("socialAuthService.checkAllConnectionStatuses")
      ),
      disconnectPlatform: vi.fn(() =>
        unexpected("socialAuthService.disconnectPlatform")
      ),
    },
    socialTokenRepo: {
      upsert: vi.fn(() => unexpected("socialTokenRepo.upsert")),
      findByUserIdAndPlatform: vi.fn(() =>
        unexpected("socialTokenRepo.findByUserIdAndPlatform")
      ),
      findByUserId: vi.fn(() => unexpected("socialTokenRepo.findByUserId")),
      deleteByUserIdAndPlatform: vi.fn(() =>
        unexpected("socialTokenRepo.deleteByUserIdAndPlatform")
      ),
      updateByUserIdAndPlateform: vi.fn(() =>
        unexpected("socialTokenRepo.updateByUserIdAndPlateform")
      ),
    },
    scheduledTaskRepo: {
      listDueTasks: vi.fn(() => unexpected("scheduledTaskRepo.listDueTasks")),
      markAsRun: vi.fn(() => unexpected("scheduledTaskRepo.markAsRun")),
    },
    transcriptionRepo: {
      create: vi.fn(() => unexpected("transcriptionRepo.create")),
      getById: vi.fn(() => unexpected("transcriptionRepo.getById")),
    },
    formationRepo: {
      getById: vi.fn(() => unexpected("formationRepo.getById")),
    },
    templateRepo: {
      list: vi.fn(() => unexpected("templateRepo.list")),
      getById: vi.fn(() => unexpected("templateRepo.getById")),
    },
    youtubeRepo: {
      createUpload: vi.fn(() => unexpected("youtubeRepo.createUpload")),
    },
    supabase: {},
  } as unknown as OppSysContext;

  return Object.assign(base, partial) as OppSysContext;
}
