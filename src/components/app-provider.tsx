import { RouterProvider } from "./router-provider";
import { Toaster } from "@oppsys/ui/components/sonner";

export function AppProvider() {
  return (
    <>
      <RouterProvider />
      <Toaster />
    </>
  );
}
