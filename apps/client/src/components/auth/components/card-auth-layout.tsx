import { P } from "@oppsys/ui/components/typography";
import { Card, CardContent } from "@oppsys/ui/components/card";
import type { PropsWithChildren } from "react";

export function CardAuthLayout({ children, title }: CardAuthLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden pt-0">
          <div className="bg-gradient-primary px-8 py-12 text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <img src="/logo.png" alt="Logo Oppsys" className="size-12" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Oppsys</h1>
            <P className="text-orange-100">{title}</P>
          </div>
          <CardContent>{children}</CardContent>
        </Card>
        <div className="mt-8 text-center">
          <P className="text-sm text-muted-foreground">
            En continuant, vous acceptez nos{" "}
            <a
              href="https://oppsys.io/legal/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors underline"
            >
              Conditions d'utilisation
            </a>{" "}
            et notre{" "}
            <a
              href="https://oppsys.io/legal/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 transition-colors underline"
            >
              Politique de confidentialité
            </a>
          </P>
        </div>
      </div>
    </div>
  );
}

type CardAuthLayoutProps = PropsWithChildren<{
  title: string;
}>;
