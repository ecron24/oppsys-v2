import { honoClient } from "@/lib/hono-client";
import type { InferRequestType, InferResponseType } from "hono";
import type { LucideIcon } from "lucide-react";
import { lazy } from "react";

export type ModuleMapping = {
  icon: LucideIcon;
  component: ReturnType<typeof lazy>;
  featured: boolean;
  estimatedTime?: string;
  isNew?: boolean;
};

export type CategoryMapping = {
  name: string;
};

export type ModuleApi = InferResponseType<
  typeof honoClient.api.modules.$get,
  200
>["data"]["modules"][number];

export type Module = ModuleApi & ModuleMapping;

export type ListModulesQuerySchema = InferRequestType<
  typeof honoClient.api.modules.$get
>["query"];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const execModule = honoClient.api.modules[":id"].execute.$post;
export type ExecuteModuleBody = InferRequestType<typeof execModule>["json"];
export type ExecuteModuleData = InferResponseType<
  typeof execModule,
  200
>["data"];

export type ViewMode = "grid" | "list";

export type TabValue = "modules" | "formation";
