import { useSearchParams } from "react-router";
import { LoadingSpinner } from "@/components/loading";
import { useAuthCallback } from "@/components/auth/hooks/use-auth-callback";
import {
  Share2,
  Shield,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Button, H1, H4, P } from "@oppsys/ui";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { status, message, handleRetry, handleBackToLogin } = useAuthCallback();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border overflow-hidden">
          <div
            className={`px-8 py-12 text-center ${
              status === "success"
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : status === "error"
                  ? "bg-gradient-to-r from-red-500 to-red-600"
                  : "bg-gradient-to-r from-primary to-orange-600"
            }`}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              {searchParams.get("platform") ? (
                <Share2 className="h-8 w-8 text-white" />
              ) : (
                <>
                  {status === "checking" && (
                    <RefreshCw className="h-8 w-8 text-white animate-spin" />
                  )}
                  {status === "success" && (
                    <CheckCircle className="h-8 w-8 text-white" />
                  )}
                  {status === "error" && (
                    <AlertCircle className="h-8 w-8 text-white" />
                  )}
                </>
              )}
            </div>

            <H1 className="text-2xl font-bold text-white mb-2">
              {searchParams.get("platform")
                ? `Connexion ${searchParams.get("platform")}`
                : status === "checking" && "Authentification"}
              {status === "success" && "Connexion réussie !"}
              {status === "error" && "Erreur d'authentification"}
            </H1>

            <P className="text-primary-foreground/80">
              {searchParams.get("platform")
                ? "Finalisation en cours..."
                : status === "checking" &&
                  "Vérification de vos informations..."}
              {status === "success" && "Redirection en cours"}
              {status === "error" && "Impossible de vous connecter"}
            </P>
          </div>

          <div className="p-8 text-center">
            {status === "checking" && (
              <div className="space-y-4">
                <LoadingSpinner size="large" />
                <div className="space-y-2">
                  <P className="text-card-foreground font-medium">{message}</P>
                  <P className="text-muted-foreground text-sm">
                    {searchParams.get("platform")
                      ? "Finalisation de la connexion sociale..."
                      : "Cela ne devrait prendre que quelques secondes..."}
                  </P>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">{message}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                  <LoadingSpinner size="sm" />
                  <span className="text-sm">Redirection automatique...</span>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-6">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="text-left">
                      <P className="font-medium text-destructive mb-1">
                        Échec de la connexion
                      </P>
                      <p className="text-destructive/80 text-sm">{message}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4" />
                    <span>Réessayer</span>
                  </Button>

                  <Button onClick={handleBackToLogin} variant={"outline"}>
                    <ArrowRight className="h-4 w-4" />
                    <span>Retour à la connexion</span>
                  </Button>
                </div>

                <P className="text-xs text-muted-foreground">
                  Redirection automatique dans 4 secondes...
                </P>
              </div>
            )}

            <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-left">
                  <H4 className="text-sm font-medium text-card-foreground mb-1">
                    Connexion sécurisée
                  </H4>
                  <P className="text-xs text-muted-foreground">
                    Votre authentification est protégée par un chiffrement de
                    niveau entreprise.
                  </P>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <P className="text-xs text-muted-foreground">
            Problème de connexion ?{" "}
            <button
              onClick={handleBackToLogin}
              className="text-primary hover:text-primary/80 transition-colors underline"
            >
              Contactez le support
            </button>
          </P>
        </div>
      </div>
    </div>
  );
}
