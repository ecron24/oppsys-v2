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
