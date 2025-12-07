import { RouterProvider } from "./router-provider";
import { Toaster } from "@oppsys/ui/components/sonner";
import { ThemeProvider } from "./themes/theme-provider";
import { AuthProvider } from "./auth/auth-provider";
import { ReactQueryProvider } from "./tanstack-query/react-query";
import { Suspense } from "react";
import { PageLoader } from "./loading";

export function AppProvider() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ThemeProvider>
        <ReactQueryProvider>
          <AuthProvider>
            <RouterProvider />
          </AuthProvider>
        </ReactQueryProvider>
        <Toaster position="top-right" expand={true} richColors />
      </ThemeProvider>
    </Suspense>
  );
}
