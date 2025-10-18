import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { getTemplatesUseCase } from "../app/get-templates-use-case";
import { uploadTemplateUseCase } from "../app/upload-template-use-case";
import { downloadTemplateUseCase } from "../app/download-template-use-case";
import { deleteTemplateUseCase } from "../app/delete-template-use-case";
import { handleResultResponse } from "src/lib/handle-result-response";
import { getUserInContext } from "src/lib/get-user-in-context";
import { describeRoute } from "hono-openapi";
import z from "zod";

// Schema for upload validation
const UploadTemplateSchema = z.object({
  leaseType: z.string(),
  category: z.string().optional(),
  isPublic: z.coerce.boolean().optional(),
});

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
      async (c) => {
        const user = getUserInContext(c);

        // Handle multipart form data
        const formData = await c.req.formData();
        const file = formData.get("template") as File;
        const leaseType = formData.get("leaseType") as string;
        const category = formData.get("category") as string;
        const isPublic = formData.get("isPublic") as string;

        if (!file || !(file instanceof File)) {
          return c.json(
            {
              success: false,
              error: "No file provided",
            },
            400
          );
        }

        // Validate input
        const validation = UploadTemplateSchema.safeParse({
          leaseType,
          category,
          isPublic: isPublic === "true",
        });

        if (!validation.success) {
          return c.json(
            {
              success: false,
              error: "Invalid input",
              details: z.prettifyError(validation.error),
            },
            400
          );
        }

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        const result = await uploadTemplateUseCase(ctx, {
          userId: user.id,
          file: {
            originalname: file.name,
            buffer,
            mimetype: file.type,
            size: file.size,
          },
          leaseType: validation.data.leaseType,
          category: validation.data.category,
          isPublic: validation.data.isPublic,
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
