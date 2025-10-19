import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { getTemplatesUseCase } from "../app/get-templates-use-case";
import {
  UploadTemplateBody,
  uploadTemplateUseCase,
} from "../app/upload-template-use-case";
import { downloadTemplateUseCase } from "../app/download-template-use-case";
import { deleteTemplateUseCase } from "../app/delete-template-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";
import { getUserInContext } from "src/lib/get-user-in-context";
import { describeRoute } from "hono-openapi";
import { zValidatorWrapper } from "src/lib/validator-wrapper";

export const templateRouter = honoRouter((ctx) => {
  const router = new Hono()
    .get(
      "/real-estate",
      describeRoute({
        description: "Get real estate templates for the current user",
      }),
      async (c) => {
        const user = getUserInContext(c);
        const result = await getTemplatesUseCase(ctx, {
          query: {
            userId: user.id,
            includePublic: true,
          },
        });
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/upload",
      describeRoute({ description: "Upload a new real estate template" }),
      zValidatorWrapper("form", UploadTemplateBody),
      // validator("form", UploadTemplateBody), // Broken
      async (c) => {
        const user = getUserInContext(c);
        // Handle multipart form data
        const body = c.req.valid("form");

        const result = await uploadTemplateUseCase(ctx, {
          user,
          body,
        });

        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .get(
      "/:id/download",
      describeRoute({ description: "Download a real estate template" }),
      async (c) => {
        const user = getUserInContext(c);
        const templateId = c.req.param("id");

        const result = await downloadTemplateUseCase(ctx, {
          templateId,
          userId: user.id,
        });

        if (!result.success) {
          return handleResultResponse(c, result, { oppSysContext: ctx });
        }

        // Return file response
        return new Response(result.data.fileData, {
          headers: {
            "Content-Type": result.data.contentType,
            "Content-Disposition": `attachment; filename="${result.data.filename}"`,
          },
        });
      }
    )
    .delete(
      "/:id",
      describeRoute({ description: "Delete a real estate template" }),
      async (c) => {
        const user = getUserInContext(c);
        const templateId = c.req.param("id");

        const result = await deleteTemplateUseCase(ctx, {
          templateId,
          userId: user.id,
        });

        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );

  return router;
});
