import type { ResultError } from "@oppsys/types";

export async function tryCatch<
  TData,
  TError = Error,
  TKind extends string = "UNKNOWN_ERROR",
>(
  action: () => Promise<TData>,
  kind?: TKind
): Promise<TData | ResultError<TError, TKind>> {
  try {
    const data = await action();
    return data;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error("Unknown error");
    return {
      success: false,
      kind: kind ?? ("UNKNOWN_ERROR" as TKind),
      error: error as TError,
    };
  }
}
