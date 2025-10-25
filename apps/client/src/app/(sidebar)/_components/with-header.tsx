import { type PropsWithChildren } from "react";
import { Header } from "./header";

export function WithHeader({ children, title, breadcrumbs }: WithHeaderProps) {
  return (
    <div className="flex flex-col flex-1 min-h-full min-w-0 overflow-hidden">
      <Header title={title} breadcrumbs={breadcrumbs} />
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto px-4 py-6 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}

type WithHeaderProps = PropsWithChildren<{
  title: string;
  breadcrumbs?: string[];
}>;
