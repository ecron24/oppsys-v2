import { SidebarProvider } from "@oppsys/ui";
import { Outlet } from "react-router";
import { AppSidebar } from "../../components/app-sidebar";

export function SidebarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">{<Outlet />}</div>
    </SidebarProvider>
  );
}
