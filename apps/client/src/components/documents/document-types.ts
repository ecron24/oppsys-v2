import { honoClient } from "@/lib/hono-client";
import type { InferRequestType } from "hono";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ragUploadUrl = honoClient.api.documents["rag-upload-url"].$post;
export type RagUploadBody = InferRequestType<typeof ragUploadUrl>["json"];

export interface RagDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: string;
}
