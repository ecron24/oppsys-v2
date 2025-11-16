import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type {
  ExecuteModuleBody,
  ListModulesQuerySchema,
} from "../module-types";

export const modulesService = {
  getAll: async (query: ListModulesQuerySchema = {}) => {
    return handleApiCall(await honoClient.api.modules.$get({ query }));
  },
  getById: async (id: string) => {
    return handleApiCall(
      await honoClient.api.modules[":id"].$get({ param: { id } })
    );
  },
  executeModule: async (moduleId: string, payload: ExecuteModuleBody) => {
    return handleApiCall(
      await honoClient.api.modules[":id"].execute.$post({
        param: { id: moduleId },
        json: payload,
      })
    );
  },
};
