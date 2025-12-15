import { describeRoute, validator } from "hono-openapi";
import { GenerateUploadUrlInputSchema } from "../domain/storage";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { honoRouter } from "src/lib/hono-router";
import { Hono } from "hono";
import { getUserInContext } from "src/lib/get-user-in-context";
import { handleResultResponse } from "src/lib/handle-result-response";
import { generateUploadUrlUseCase } from "../app/generate-upload-url-use-case";

export const storageRouter = honoRouter((ctx) => {
  const router = new Hono().post(
    "/create-upload-url",
    describeRoute({ description: "Generate upload URL for files" }),
    zValidatorWrapper("json", GenerateUploadUrlInputSchema),
    validator("json", GenerateUploadUrlInputSchema),
    async (c) => {
      const body = c.req.valid("json");
      const user = getUserInContext(c);
      const result = await generateUploadUrlUseCase(ctx, {
        body,
        userId: user.id,
      });
      return handleResultResponse(c, result, { oppSysContext: ctx });
    }
  );

  return router;
});
