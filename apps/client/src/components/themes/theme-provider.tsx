import { type ReactNode } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: ThemeProviderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (
    <NextThemeProvider attribute="class">{children as any}</NextThemeProvider>
  );
}

type ThemeProviderProps = { children?: ReactNode };
