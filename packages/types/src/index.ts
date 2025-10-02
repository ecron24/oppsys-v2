export type Result<TData, TError = Error, TKind = string> =
  | { success: true; data: TData }
  | { success: false; kind: TKind; error: TError };
