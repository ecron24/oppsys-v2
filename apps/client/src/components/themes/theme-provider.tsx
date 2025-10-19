import { type PropsWithChildren } from "react";
import { ThemeProvider as NextThemeProvider } from "next-themes";

export function ThemeProvider({ children }: ThemeProviderProps) {
  return <NextThemeProvider attribute="class">{children}</NextThemeProvider>;
}

type ThemeProviderProps = PropsWithChildren;
