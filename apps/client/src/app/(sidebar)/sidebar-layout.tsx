import { SidebarProvider } from "@oppsys/ui/components/sidebar";
import { Outlet } from "react-router";
import { AppSidebar } from "../../components/app-sidebar";

export default function SidebarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">{<Outlet />}</div>
    </SidebarProvider>
  );
}
