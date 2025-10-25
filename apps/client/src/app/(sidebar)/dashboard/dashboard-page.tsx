import { ThemeSwitcher } from "@/components/themes/theme-switcher";
import { Button } from "@oppsys/ui";
import { WithHeader } from "../_components/with-header";

export function DashboardPage() {
  return (
    <WithHeader title="Tableau de bord">
      <div className="size-9 bg-red-500 dark:bg-amber-400"></div>
      <ThemeSwitcher />
      <Button>btnoik</Button>
    </WithHeader>
  );
}
