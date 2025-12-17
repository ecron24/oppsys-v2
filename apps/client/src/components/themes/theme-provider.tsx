/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ReactNode } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider attribute="class">{children as any}</NextThemeProvider>
  );
}

type ThemeProviderProps = { children?: ReactNode };
