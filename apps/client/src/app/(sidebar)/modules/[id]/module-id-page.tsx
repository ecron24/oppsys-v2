import { useParams } from "react-router";
import { useModuleById } from "../_hooks/use-module-by-id";
import { LoadingSpinner, PageLoader } from "@/components/loading";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Star,
  XCircle,
} from "lucide-react";
import { Badge, H2, P } from "@oppsys/ui";
import { routes } from "@/routes";
import { useAuth } from "@/components/auth/hooks/use-auth";
import { LinkButton } from "@/components/link-button";
import { Suspense } from "react";
import { WithHeader } from "../../_components/with-header";

export default function ModuleIdPage() {
  const params = useParams();
  const { moduleId } = params;
  const { module, isLoading, apiStatus } = useModuleById(
    moduleId || "<default>"
  );
  const { user } = useAuth();

  if (isLoading) {
    return <PageLoader text="Chargement du module..." />;
  }

  if (!module) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="card border-destructive/30 bg-destructive/5">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <P className="text-destructive">Mmodule non disponible</P>
            </div>
            <LinkButton
              to={routes.modules.index()}
              className="Button-primary mt-3"
            >
              Retour aux modules
            </LinkButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WithHeader title="Modules" breadcrumbs={[module.name]}>
      {/* Header du module */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <LinkButton to={routes.modules.index()} variant={"ghost"}>
            <ArrowLeft className="h-4 w-4" />
            <span>Retour aux modules</span>
          </LinkButton>

          <div className="flex items-center space-x-2">
            {module.featured && (
              <Badge variant={"primary-outline"}>
                <Star className="h-3 w-3 mr-1" />
                Populaire
              </Badge>
            )}
            <Badge variant={"muted"}>{module.category || "Module"}</Badge>
            <Badge variant={"muted"}>{module.type?.toUpperCase()}</Badge>
          </div>
        </div>

        {/* Titre et description du module */}
        <div className="card bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <module.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <H2 className="text-2xl font-bold text-card-foreground">
                  {module.name}
                </H2>
                <P className="text-muted-foreground mt-1">
                  {module.description}
                </P>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
                {module.creditCost} crédits
              </span>
              <P className="text-xs text-muted-foreground mt-1">
                Votre solde: {user?.creditBalance} crédits
              </P>
            </div>
          </div>
        </div>

        {/* Status de connectivité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="card">
            <div className="flex items-center space-x-2">
              {apiStatus === "connected" && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {apiStatus === "failed" && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              {apiStatus === "loading" && <LoadingSpinner size="sm" />}
              <span className="text-sm font-medium">
                API Backend:{" "}
                {apiStatus === "connected"
                  ? "Connecté"
                  : apiStatus === "failed"
                    ? "Déconnecté"
                    : "Chargement..."}
              </span>
            </div>
          </div>
        </div>

        {/* Alerte si crédits insuffisants */}
        {user?.creditBalance && user?.creditBalance < module.creditCost && (
          <div className="card mt-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5" />
              <div>
                <P className="text-destructive font-medium">
                  Crédits insuffisants
                </P>
                <P className="text-destructive/80 text-sm mt-1">
                  Vous avez besoin de {module.creditCost} crédits pour utiliser
                  ce module. Votre solde actuel est de {user?.creditBalance}{" "}
                  crédits.{" "}
                  <LinkButton
                    to={routes.billing.index()}
                    className="inline-flex items-center text-destructive hover:text-destructive/80 underline"
                  >
                    Recharger maintenant
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </LinkButton>
                </P>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Composant du module */}
      <div className="mb-8">
        {module.component ? (
          <Suspense
            fallback={
              <LoadingSpinner size="large" text="Chargement du module..." />
            }
          >
            <module.component
              module={module}
              userBalance={user?.creditBalance}
            />
          </Suspense>
        ) : (
          <div className="card border-destructive/30 bg-destructive/5">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <P className="text-destructive">
                Composant du module non disponible
              </P>
            </div>
          </div>
        )}
      </div>

      {/* Liens utiles */}
      <div className="mt-6 text-center">
        <div className="flex justify-center space-x-4 text-sm">
          <LinkButton to={routes.modules.index()} variant={"link"}>
            Tous les modules
          </LinkButton>
          <LinkButton to={routes.content.index()} variant={"link"}>
            Mon contenu
          </LinkButton>
          <LinkButton to={routes.dashboard.index()} variant={"link"}>
            Tableau de bord
          </LinkButton>
        </div>
      </div>
    </WithHeader>
  );
}
