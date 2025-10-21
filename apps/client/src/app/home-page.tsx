import { ThemeSwitcher } from "@/components/themes/theme-switcher";
import { Button } from "@oppsys/ui/components/button";

export function HomePage() {
  return (
    <div className="">
      <div className="size-9 bg-red-500 dark:bg-amber-400"></div>
      <ThemeSwitcher />
      <Button>btnoik</Button>
    </div>
  );
}
