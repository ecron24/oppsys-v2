export type Result<TData, TError = Error, TKind = string> =
  | ResultSuccess<TData>
  | ResultError<TError, TKind>;

export type ResultSuccess<TData> = { success: true; data: TData };

export type ResultError<TError = Error, TKind = string> = {
  success: false;
  kind: TKind;
  error: TError;
};
