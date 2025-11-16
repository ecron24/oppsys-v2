import { handleApiCall } from "@/lib/handle-api-call";
import { honoClient } from "@/lib/hono-client";
import type { UploadTemplateBody } from "./templates-type";

export const templatesService = {
  getRealEstateTemplates: async () => {
    return handleApiCall(await honoClient.api.templates["real-estate"].$get());
  },

  uploadTemplate: async (body: UploadTemplateBody) => {
    return handleApiCall(
      await honoClient.api.templates.upload.$post({ form: body })
    );
  },

  deleteTemplate: async (id: string) => {
    return handleApiCall(
      await honoClient.api.templates[":id"].$delete({ param: { id } })
    );
  },
};
