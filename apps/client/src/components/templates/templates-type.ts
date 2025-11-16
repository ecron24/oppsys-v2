import { honoClient } from "@/lib/hono-client";
import type { InferRequestType, InferResponseType } from "hono";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getTemplates = honoClient.api.templates["real-estate"].$get;
export type Template = InferResponseType<
  typeof getTemplates,
  200
>["data"][number];

export type UploadTemplateBody = InferRequestType<
  typeof honoClient.api.templates.upload.$post
>["form"];

export type LeaseType = UploadTemplateBody["leaseType"];
