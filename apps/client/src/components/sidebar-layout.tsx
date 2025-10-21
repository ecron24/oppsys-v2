import { Outlet } from "react-router";

export function SidebarLayout() {
  return (
    <div>
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
