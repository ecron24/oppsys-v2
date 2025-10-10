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
import { describeRoute, validator } from "hono-openapi";

export const authRouter = honoRouter((ctx) => {
  const router = new Hono()
    .post(
      "/signup",
      describeRoute({ description: "Sign up a new user" }),
      zValidatorWrapper("json", SignUpSchema),
      validator("json", SignUpSchema),
      async (c) => {
        const result = await signUpUseCase(ctx, c.req.valid("json"));
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/signin",
      describeRoute({ description: "Sign in a user" }),
      zValidatorWrapper("json", SignInSchema),
      validator("json", SignInSchema),
      async (c) => {
        const result = await signInUseCase(ctx, c.req.valid("json"));
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/magic-link",
      describeRoute({ description: "Send magic link for authentication" }),
      zValidatorWrapper("json", SendMagicLinkSchema),
      validator("json", SendMagicLinkSchema),
      async (c) => {
        const result = await sendMagicLinkUseCase(ctx, c.req.valid("json"));
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    )
    .post(
      "/signout",
      describeRoute({ description: "Sign out the current user" }),
      async (c) => {
        const result = await signOutUseCase(ctx, "");
        return handleResultResponse(c, result, { oppSysContext: ctx });
      }
    );

  return router;
});
