import type { ClientResponse } from "hono/client";
import { type ApiResponse } from "@oppsys/utils";

export async function handleApiCall<
  TData = unknown,
  TStatusSuccess extends number = number,
  TStatusError extends number = number,
  F extends string = string,
>(
  response:
    | ClientResponse<{ data: TData }, TStatusSuccess, F>
    | ClientResponse<{ error: string; details?: string }, TStatusError, F>
): Promise<ApiResponse<TData, TStatusSuccess, TStatusError>> {
  try {
    if (response.ok) {
      const json = (await response.json()) as { data: TData };
      return {
        success: true,
        data: json.data,
        status: response.status as TStatusSuccess,
      } as const;
    }
    const json = await response.json();
    const { error, details } = json as { error: string; details?: string };
    console.error("[handleApiCall::notok]: ", { response, json });
    return {
      success: false,
      error,
      details,
      status: response.status as TStatusError,
    } as const;
  } catch (error) {
    console.error("[handleApiCall::catch]: ", error);
    return {
      success: false,
      error: (error as Error).message,
      status: 500 as TStatusError,
    } as const;
  }
}
