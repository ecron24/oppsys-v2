export type Result<TData, TError = Error, TKind = string> =
  | ResultSuccess<TData>
  | ResultError<TError, TKind>;

export type ResultSuccess<TData> = { success: true; data: TData };

export type ResultError<TError = Error, TKind = string> = {
  success: false;
  kind: TKind;
  error: TError;
};

export type ApiResponse<
  TData,
  TStatusSuccess = number,
  TStatusError = number,
> = ApiResponseSuccess<TData, TStatusSuccess> | ApiResponseError<TStatusError>;

export type ApiResponseSuccess<TData, TStatusSuccess = number> = {
  success: true;
  data: TData;
  status: TStatusSuccess;
};

export type ApiResponseError<TStatusError = number> = {
  success: false;
  error: string;
  details?: string;
  status: TStatusError;
};

export function unwrap<TData>(
  res:
    | Result<TData, any, any>
    | ApiResponse<TData, any, any>
    | { success: true; data: TData }
    | { success: false; error: string },
  error?: string | Error
): TData {
  if (res.success) {
    return res.data;
  }
  const customError = error
    ? typeof error === "string"
      ? new Error(error)
      : error
    : null;

  // ApiResponseError (error: string, details?: string)
  if ("error" in res && typeof res.error === "string") {
    const details = (res as ApiResponseError).details;
    throw (
      customError ??
      new Error(details ? `${res.error} — ${details}` : res.error)
    );
  }

  // ResultError (error: TError)
  const maybeErr = (res as ResultError).error;
  if (maybeErr instanceof Error) throw customError ?? maybeErr;
  if (typeof maybeErr === "string") throw customError ?? new Error(maybeErr);

  // fallback: sérialiser l'objet d'erreur si possible
  try {
    throw (
      customError ??
      new Error(
        JSON.stringify(maybeErr) || `Request failed (kind=${(res as any).kind})`
      )
    );
  } catch {
    throw (
      customError ??
      new Error(`Request failed (kind=${(res as any).kind ?? "unknown"})`)
    );
  }
}
