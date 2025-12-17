import { honoClient } from "@/lib/hono-client";
import type { InferRequestType } from "hono";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uploadUrl = honoClient.api.storage["create-upload-url"].$post;
export type UploadBody = InferRequestType<typeof uploadUrl>["json"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const signedUrl = honoClient.api.storage["signed-url"].$post;
export type SignedUrlBody = InferRequestType<typeof signedUrl>["json"];

export type BucketStorage = UploadBody["bucket"];

export interface FileStorage {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  uploadedAt: string;
}
