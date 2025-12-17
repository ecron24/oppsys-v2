import type { QueryClientProviderProps } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

type ReactQueryProviderProps = {
  children?: QueryClientProviderProps["children"];
};
