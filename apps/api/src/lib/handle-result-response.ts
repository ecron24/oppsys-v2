import type { Context } from "hono";
import type { Result } from "@oppsys/types";

export function handleResultResponse<TData, TStatusCode extends 200>(
  c: Context,
  result: Result<TData>,
  statusCodeSuccess: TStatusCode = 200 as TStatusCode
) {
  if (result.success) {
    return c.json({ data: result.data }, statusCodeSuccess);
  }
  const kind = result.kind.toLowerCase();
  if (kind.includes("not_found")) {
    return c.json({ error: "Not found", details: result.error.message }, 404);
  }
  if (kind.includes("validation_error")) {
    return c.json(
      { error: "Unauthorized", details: result.error.message },
      400
    );
  }
  if (kind.includes("unauthorized")) {
    return c.json(
      { error: "Unauthorized", details: result.error.message },
      401
    );
  }
  if (kind.includes("forbidden")) {
    return c.json({ error: "Forbidden", details: result.error.message }, 403);
  }
  return c.json(
    { error: "Internal Server Error", details: result.error.message },
    500
  );
}
