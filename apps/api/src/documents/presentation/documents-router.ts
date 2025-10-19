import { Hono } from "hono";
import { honoRouter } from "../../lib/hono-router";
import { generateRagUploadUrlUseCase } from "../app/generate-rag-upload-url-use-case";
import { handleResultResponse } from "../../lib/handle-result-response";
import { zValidatorWrapper } from "../../lib/validator-wrapper";
import { GenerateRagUploadUrlInputSchema } from "../domain/documents";
import { getUserInContext } from "src/lib/get-user-in-context";
import { describeRoute, validator } from "hono-openapi";

export const documentsRouter = honoRouter((ctx) => {
  const router = new Hono().post(
    "/rag-upload-url",
    describeRoute({ description: "Generate RAG upload URL for documents" }),
    zValidatorWrapper("json", GenerateRagUploadUrlInputSchema),
    validator("json", GenerateRagUploadUrlInputSchema),
    async (c) => {
      const body = c.req.valid("json");
      const user = getUserInContext(c);
      const result = await generateRagUploadUrlUseCase(ctx, {
        ...body,
        userId: user.id,
      });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  return router;
});
