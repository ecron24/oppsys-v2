import type {
  ChatSessionRepo,
  CleanupExpiredSessionsResult,
  CreateOrGetChatSessionResult,
  GetChatSessionResult,
  UpdateChatSessionResult,
} from "../domain/chat-session-repo";
import { ChatSessionSchema, type ChatSession } from "../domain/chat-session";
import type { Logger } from "src/logger/domain/logger";
import type { Json, OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import { toCamelCase } from "src/lib/to-camel-case";
import { toSnakeCase } from "src/lib/to-snake-case";

export class ChatSessionRepoSupabase implements ChatSessionRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async findActiveSession(params: {
    userId: string;
    moduleSlug: string;
  }): Promise<GetChatSessionResult> {
    return await tryCatch(async () => {
      const { data: session, error } = await this.supabase
        .from("chat_sessions")
        .select("*")
        .eq("user_id", params.userId)
        .eq("module_slug", params.moduleSlug)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        this.logger.error("[findActiveSession] ", error, {
          params,
        });
        throw error;
      }

      if (!session) {
        return {
          success: false,
          kind: "SESSION_NOT_FOUND",
          error: new Error("Session not found"),
        } as const;
      }

      const camel = toCamelCase(session) as ChatSession;
      return {
        success: true,
        data: ChatSessionSchema.parse(camel),
      } as const;
    });
  }

  async createSession(params: {
    userId: string;
    moduleSlug: string;
  }): Promise<CreateOrGetChatSessionResult> {
    return await tryCatch(async () => {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      const { data: newSession, error } = await this.supabase
        .from("chat_sessions")
        .insert(
          toSnakeCase({
            user_id: params.userId,
            module_slug: params.moduleSlug,
            session_data: {},
            expires_at: expiresAt.toISOString(),
          })
        )
        .select("*")
        .single();

      if (error) {
        this.logger.error("[chat] Error creating session", error);
        throw error;
      }

      const camel = toCamelCase(newSession) as ChatSession;
      return {
        success: true,
        data: ChatSessionSchema.parse(camel),
      } as const;
    });
  }

  async updateChatSession(params: {
    sessionId: string;
    sessionData: Record<string, unknown>;
  }): Promise<UpdateChatSessionResult> {
    return await tryCatch(async () => {
      const { error: updateError, data } = await this.supabase
        .from("chat_sessions")
        .update(
          toSnakeCase({
            session_data: params.sessionData as Json,
            last_activity: new Date().toISOString(),
          })
        )
        .eq("id", params.sessionId)
        .select();

      if (updateError) {
        this.logger.error(
          "[updateChatSession] Error updating chat session",
          updateError,
          { params }
        );
        throw updateError;
      }

      if (!data) {
        return {
          success: false,
          kind: "SESSION_NOT_FOUND",
          error: new Error(`Session not found : sessionId=${params.sessionId}`),
        } as const;
      }

      return {
        success: true,
        data: toCamelCase({
          id: params.sessionId,
          userId: "",
          moduleSlug: "",
          sessionData: params.sessionData,
          createdAt: "",
          expiresAt: "",
        }),
      } as const;
    });
  }

  async getChatSession({
    sessionId,
  }: {
    sessionId: string;
  }): Promise<GetChatSessionResult> {
    return await tryCatch(async () => {
      const { data: session, error } = await this.supabase
        .from("chat_sessions")
        .select("*")
        .eq("id", sessionId)
        .maybeSingle();

      if (error) {
        this.logger.error("[getChatSession] Error get chat session", error, {
          sessionId,
        });
        throw error;
      }

      if (!session) {
        return {
          success: false,
          kind: "SESSION_NOT_FOUND",
          error: new Error("Session not found"),
        } as const;
      }

      const sessionData = toCamelCase(session) as ChatSession;
      return {
        success: true,
        data: ChatSessionSchema.parse(sessionData),
      } as const;
    });
  }

  async cleanupExpiredSessions(): Promise<CleanupExpiredSessionsResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("chat_sessions")
        .delete()
        .lt("expires_at", new Date().toISOString());

      if (error) throw error;

      this.logger.info(`[chat] Expired sessions cleaned`);
      // Supabase returns deleted rows as array or null
      // Supabase may return data as null, undefined, or array
      let deletedCount = undefined;
      if (Array.isArray(data)) {
        deletedCount = (data as unknown[]).length;
      }

      return {
        success: true,
        data: deletedCount,
      } as const;
    });
  }
}
