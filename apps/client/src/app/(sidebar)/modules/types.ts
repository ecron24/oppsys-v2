import type { honoClient } from "@/lib/hono-client";
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

export type ViewMode = "grid" | "list";

export type TabValue = "modules" | "formation";
