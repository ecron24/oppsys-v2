import type { Context } from "hono";
import type { Result } from "@oppsys/shared";
import z, { ZodError } from "zod";
import { AuthError } from "@oppsys/supabase";
import type { OppSysContext } from "src/get-context";
import {
  InsufficientCreditError,
  PremiumOnlyError,
} from "src/modules/domain/exception";

export function handleResultResponse<TData, TStatusCode extends 200>(
  honoCtx: Context,
  result: Result<TData>,
  { oppSysContext, statusCodeSuccess = 200 as TStatusCode }: Opts<TStatusCode>
) {
  if (result.success) {
    return honoCtx.json({ data: result.data }, statusCodeSuccess);
  }
  if (result.error instanceof InsufficientCreditError) {
    return honoCtx.json(
      { error: "Insufficient credit", details: result.error.message },
      402
    );
  }

  const kind = result.kind.toLowerCase();
  if (kind.includes("not_found")) {
    return honoCtx.json(
      { error: "Not found", details: result.error.message },
      404
    );
  }
  if (result.error instanceof ZodError) {
    oppSysContext.logger.error("Validation error:", result.error);
    return honoCtx.json(
      { error: "Validation error", details: z.prettifyError(result.error) },
      400
    );
  }
  if (result.error instanceof AuthError) {
    return honoCtx.json(
      { error: "Authentication error", details: result.error.message },
      401
    );
  }
  if (kind.includes("validation_error")) {
    oppSysContext.logger.error("Validation error:", result.error);
    return honoCtx.json(
      { error: "Validation error", details: result.error.message },
      400
    );
  }
  if (kind.includes("unauthorized")) {
    return honoCtx.json(
      { error: "Unauthorized", details: result.error.message },
      401
    );
  }
  if (kind.includes("forbidden") || result.error instanceof PremiumOnlyError) {
    return honoCtx.json(
      { error: "Forbidden", details: result.error.message },
      403
    );
  }
  oppSysContext.logger.error("Unknown error:", result.error);
  return honoCtx.json(
    { error: "Internal Server Error", details: result.error.message },
    500
  );
}

type Opts<TStatusCode extends 200> = {
  oppSysContext: OppSysContext;
  statusCodeSuccess?: TStatusCode;
};
