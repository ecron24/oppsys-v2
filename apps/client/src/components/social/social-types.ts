import type { honoClient } from "@/lib/hono-client";
import type { InferRequestType, InferResponseType } from "hono";

export type Platform = InferRequestType<
  typeof honoClient.api.social.init.$post
>["json"]["platform"];

export type SocialConnection = InferResponseType<
  typeof honoClient.api.social.connections.$get,
  200
>["data"][number];
