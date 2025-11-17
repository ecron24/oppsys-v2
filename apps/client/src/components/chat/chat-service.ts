import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type {
  CreateOrGetChatSessionBody,
  UpdateChatSessionBody,
} from "./chat-types";

export const chatService = {
  createOrGetSession: async (body: CreateOrGetChatSessionBody) => {
    return handleApiCall(
      await honoClient.api.chat.sessions.$post({
        json: body,
      })
    );
  },
  getSession: async (sessionId: string) => {
    return handleApiCall(
      await honoClient.api.chat.sessions[":sessionId"].$get({
        param: { sessionId },
      })
    );
  },
  updateSession: async (sessionId: string, body: UpdateChatSessionBody) => {
    return handleApiCall(
      await honoClient.api.chat.sessions[":sessionId"].$put({
        param: { sessionId },
        json: body,
      })
    );
  },
  cleanupExpiredSessions: async () => {
    return handleApiCall(
      await honoClient.api.chat.sessions.cleanup.$delete({})
    );
  },
};
