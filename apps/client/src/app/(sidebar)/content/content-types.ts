import type { User } from "@/components/auth/auth-types";
import type { honoClient } from "@/lib/hono-client";
import type { InferRequestType, InferResponseType } from "hono";

export type Content = InferResponseType<
  typeof honoClient.api.content.generated.$get,
  200
>["data"]["data"][number];

export type ContentMetadata = Content["metadata"];
export type ContentType = Content["type"];
export type ContentStatus = Content["status"];

export type GetContentQuery = InferRequestType<
  typeof honoClient.api.content.generated.$get
>["query"];

export interface ContentTypeData {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export type Activity = InferResponseType<
  typeof honoClient.api.dashboard.activity.$get,
  200
>["data"][number];

export interface ProcessContentDecisionParams {
  contentId: string;
  user: User;
  approved: boolean;
  feedback?: string;
  originalMetadata?: ContentMetadata;
}
