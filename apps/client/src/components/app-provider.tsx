import { RouterProvider } from "./router-provider";
import { Toaster } from "@oppsys/ui/components/sonner";
import { ThemeProvider } from "./themes/theme-provider";
import { AuthProvider } from "./auth/auth-provider";

export function AppProvider() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider />
      </AuthProvider>
      <Toaster position="top-right" expand={true} richColors />
    </ThemeProvider>
  );
}
