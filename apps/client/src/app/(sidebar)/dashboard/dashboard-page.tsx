import { ThemeSwitcher } from "@/components/themes/theme-switcher";
import { Button } from "@oppsys/ui";

export function DashboardPage() {
  return (
    <div className="ml-10">
      <div className="size-9 bg-red-500 dark:bg-amber-400"></div>
      <ThemeSwitcher />
      <Button>btnoik</Button>
    </div>
  );
}
