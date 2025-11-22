import type { Result } from "@oppsys/utils";
import type { ChatSession } from "./chat-session";

export type CreateOrGetChatSessionResult = Result<
  ChatSession,
  Error,
  "UNKNOWN_ERROR"
>;

export type UpdateChatSessionResult = Result<
  ChatSession,
  Error,
  "UNKNOWN_ERROR" | "SESSION_NOT_FOUND"
>;

export type GetChatSessionResult = Result<
  ChatSession,
  Error,
  "SESSION_NOT_FOUND" | "UNKNOWN_ERROR"
>;

export type CleanupExpiredSessionsResult = Result<
  number | undefined,
  Error,
  "UNKNOWN_ERROR"
>;

export interface ChatSessionRepo {
  findActiveSession(params: {
    userId: string;
    moduleSlug: string;
  }): Promise<GetChatSessionResult>;

  createSession(params: {
    userId: string;
    moduleSlug: string;
  }): Promise<CreateOrGetChatSessionResult>;

  updateChatSession(params: {
    sessionId: string;
    sessionData: Record<string, unknown>;
  }): Promise<UpdateChatSessionResult>;

  getChatSession(params: { sessionId: string }): Promise<GetChatSessionResult>;

  cleanupExpiredSessions(): Promise<CleanupExpiredSessionsResult>;
}
