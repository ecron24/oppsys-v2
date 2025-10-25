import { RouterProvider } from "./router-provider";
import { Toaster } from "@oppsys/ui/components/sonner";
import { ThemeProvider } from "./themes/theme-provider";
import { AuthProvider } from "./auth/auth-provider";
import { ReactQueryProvider } from "./tanstack-query/react-query";

export function AppProvider() {
  return (
    <ThemeProvider>
      <ReactQueryProvider>
        <AuthProvider>
          <RouterProvider />
        </AuthProvider>
      </ReactQueryProvider>
      <Toaster position="top-right" expand={true} richColors />
    </ThemeProvider>
  );
}
