import { useState, type PropsWithChildren } from "react";
import { useAuth } from "../auth/hooks/use-auth";
import { useAuthOperations } from "../auth/hooks/use-auth-operations";
import { Navigate } from "react-router";
import { Mail, Shield } from "lucide-react";
import { Button } from "@oppsys/ui";
import { PageLoader } from "../loading";
import { routes } from "@/routes";

export function AuthenticatedRoute({
  children,
  requiredRole,
}: AuthenticatedRouteProps) {
  const { user, loading } = useAuth();
  const [resending, setResending] = useState(false);
  const { signInWithOtp } = useAuthOperations();

  if (loading) {
    return <PageLoader />;
  }

  // Rediriger vers login si pas de session
  if (!user) {
    return <Navigate to={routes.auth.login()} />;
  }

  // Vérifier si l'email est confirmé
  if (!user.emailConfirmedAt) {
    const handleResendEmail = async () => {
      if (!user.email) return;
      setResending(true);
      await signInWithOtp.mutateAsync(user.email);
      setResending(false);
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-yellow-100 dark:bg-yellow-900/20 rounded-full size-16 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-xl font-semibold text-card-foreground mb-2">
              Email non confirmé
            </h2>

            <p className="text-muted-foreground mb-6">
              Veuillez vérifier votre boîte email et cliquer sur le lien de
              confirmation pour accéder à votre compte.
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
              >
                J'ai confirmé mon email
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={resending}
                variant={"outline"}
                className="w-full"
              >
                {resending ? "Envoi en cours..." : "Renvoyer l'email"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Vérification des rôles si spécifié
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border p-8 max-w-md w-full">
          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-destructive" />
            </div>

            <h2 className="text-xl font-semibold text-card-foreground mb-2">
              Accès refusé
            </h2>

            <p className="text-muted-foreground mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette
              page.
            </p>

            <Button onClick={() => window.history.back()} className="w-full">
              Retour
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

type AuthenticatedRouteProps = PropsWithChildren<{
  requiredRole?: string;
}>;
