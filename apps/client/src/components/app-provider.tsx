import { RouterProvider } from "./router-provider";
import { Toaster } from "@oppsys/ui/components/sonner";
import { ThemeProvider } from "./themes/theme-provider";

export function AppProvider() {
  return (
    <ThemeProvider>
      <RouterProvider />
      <Toaster />
    </ThemeProvider>
  );
}
