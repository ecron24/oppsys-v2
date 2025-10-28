import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { ListModulesQuerySchema } from "../types";

export const modulesService = {
  getAll: async (query: ListModulesQuerySchema = {}) => {
    return handleApiCall(await honoClient.api.modules.$get({ query }));
  },
};
