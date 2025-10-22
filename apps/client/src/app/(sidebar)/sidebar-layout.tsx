import { SidebarProvider, SidebarTrigger } from "@oppsys/ui";
import { Outlet } from "react-router";
import { AppSidebar } from "../../components/app-sidebar";

export function SidebarLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main>
        <SidebarTrigger />
        {<Outlet />}
      </main>
    </SidebarProvider>
  );
}
