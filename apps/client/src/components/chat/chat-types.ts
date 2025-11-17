import { honoClient } from "@/lib/hono-client";
import type { InferRequestType, InferResponseType } from "hono";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const createOrGetChatSessionRoute = honoClient.api.chat.sessions.$post;
export type CreateOrGetChatSessionBody = InferRequestType<
  typeof createOrGetChatSessionRoute
>["json"];
export type CreateOrGetChatSessionData = InferResponseType<
  typeof createOrGetChatSessionRoute,
  200
>["data"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getChatSessionRoute = honoClient.api.chat.sessions[":sessionId"].$get;
export type GetChatSessionData = InferResponseType<
  typeof getChatSessionRoute,
  200
>["data"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateChatSessionRoute = honoClient.api.chat.sessions[":sessionId"].$put;
export type UpdateChatSessionBody = InferRequestType<
  typeof updateChatSessionRoute
>["json"];
export type UpdateChatSessionData = InferResponseType<
  typeof updateChatSessionRoute,
  200
>["data"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cleanupExpiredSessionsRoute =
  honoClient.api.chat.sessions.cleanup.$delete;
export type CleanupExpiredSessionsData = InferResponseType<
  typeof cleanupExpiredSessionsRoute,
  200
>["data"];
