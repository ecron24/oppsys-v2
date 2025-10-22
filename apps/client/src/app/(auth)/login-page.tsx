import { Card, CardContent } from "@oppsys/ui/components/card";
import { LoginForm } from "@/components/auth/components/login-form";

export function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12 text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <img src="/logo.png" alt="Logo Oppsys" className="h-12 w-12" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Oppsys</h1>
            <p className="text-orange-100">"Connectez-vous à votre compte"</p>
          </div>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">ou</span>
                </div>
              </div>
              <LoginForm />
            </div>
          </CardContent>
        </Card>
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
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
          </p>
        </div>
      </div>
    </div>
  );
}
