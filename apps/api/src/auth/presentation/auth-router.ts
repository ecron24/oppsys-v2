import { Hono } from "hono";
import { honoRouter } from "src/lib/hono-router";
import { handleResultResponse } from "src/lib/handle-result-response";
import { zValidatorWrapper } from "src/lib/validator-wrapper";
import { SignUpSchema, signUpUseCase } from "../app/sign-up-usecase";
import { SignInSchema, signInUseCase } from "../app/sign-in-usecase";
import {
  SendMagicLinkSchema,
  sendMagicLinkUseCase,
} from "../app/send-magic-link-usecase";
import { signOutUseCase } from "../app/sign-out-usecase";

export const authRouter = honoRouter((ctx) => {
  const router = new Hono()
    .post("/signup", zValidatorWrapper("json", SignUpSchema), async (c) => {
      const result = await signUpUseCase(ctx, c.req.valid("json"));
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })
    .post("/signin", zValidatorWrapper("json", SignInSchema), async (c) => {
      const result = await signInUseCase(ctx, c.req.valid("json"));
      return handleResultResponse(c, result, { oppSysContext: ctx });
    })
    .post(
      "/magic-link",
      zValidatorWrapper("json", SendMagicLinkSchema),
      async (c) => {
        const result = await sendMagicLinkUseCase(ctx, c.req.valid("json"));
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post("/signout", async (c) => {
      const result = await signOutUseCase(ctx, "");
      return handleResultResponse(c, result, { oppSysContext: ctx });
    });

  return router;
});
