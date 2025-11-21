import { useEffect } from "react";
import { useSocialConnections } from "@/components/social/hooks/use-social-connections";
import { Button, H3, P } from "@oppsys/ui";
import { LoadingSpinner } from "@/components/loading";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Share2,
} from "lucide-react";
import { SocialAuthButtons } from "./social-auth-button";

export const SocialTab = () => {
  const {
    connections,
    stats,
    isLoading,
    connectMutation,
    disconnect,
    refresh,
    refetchConnections,
  } = useSocialConnections();

  // Écouter l'événement de navigation vers l'onglet social depuis la sidebar
  useEffect(() => {
    const handleNavigateToSocial = () => {
      // Already on social tab, refetch if needed
      refetchConnections();
    };

    window.addEventListener("navigateToSocialTab", handleNavigateToSocial);
    return () =>
      window.removeEventListener("navigateToSocialTab", handleNavigateToSocial);
  }, [refetchConnections]);

  return (
    <div className="space-y-6">
      <div>
        <H3 className="mb-4 text-lg font-medium text-card-foreground">
          Connexions Réseaux Sociaux
        </H3>
        <P className="mb-6 text-sm text-muted-foreground">
          Connectez vos comptes sociaux pour publier automatiquement depuis vos
          modules IA.
        </P>

        {/* Statistiques rapides */}
        {stats && (
          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <P className="text-lg font-semibold text-green-900">
                    {stats.valid}
                  </P>
                  <P className="text-xs text-green-700">Connectés</P>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-gray-600" />
                <div>
                  <P className="text-lg font-semibold text-gray-900">
                    {stats.invalid}
                  </P>
                  <P className="text-xs text-gray-700">Inactifs</P>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <div>
                  <P className="text-lg font-semibold text-orange-900">
                    {stats.expiringSoon}
                  </P>
                  <P className="text-xs text-orange-700">Expirent bientôt</P>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="flex items-center space-x-2">
                <Share2 className="h-4 w-4 text-blue-600" />
                <div>
                  <P className="text-lg font-semibold text-blue-900">
                    {stats.total}
                  </P>
                  <p className="text-xs text-blue-700">Total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Connexions rapides */}
        <div className="mb-6 rounded-lg bg-muted/30 p-6">
          <H3 className="mb-3 font-medium">Connexions Rapides</H3>
          <P className="mb-4 text-sm text-muted-foreground">
            {connections.length > 0
              ? "Gérez vos connexions existantes ou ajoutez de nouveaux réseaux :"
              : "Connectez vos réseaux sociaux préférés pour commencer :"}
          </P>
          <SocialAuthButtons
            platforms={[
              "facebook",
              "instagram",
              "linkedin",
              "twitter",
              "youtube",
              "tiktok",
            ]}
            onConnect={connectMutation.mutateAsync}
            variant="branded"
            columns={3}
          />
        </div>

        {/* Liste des connexions existantes */}
        {connections.length > 0 && (
          <div className="space-y-3">
            <H3 className="font-medium">Connexions actuelles</H3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {connections.map((connection) => {
                const isExpiring =
                  connection?.expiresAt &&
                  new Date(connection.expiresAt) <
                    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={connection.platform}
                    className={`flex items-center justify-between rounded-lg border p-3 ${
                      connection.isValid
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          connection.isValid ? "bg-green-100" : "bg-gray-100"
                        }`}
                      >
                        <Share2
                          className={`h-4 w-4 ${
                            connection.isValid
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div>
                        <P className="text-sm font-medium capitalize">
                          {connection.platform}
                        </P>
                        <P
                          className={`text-xs ${
                            connection.isValid
                              ? "text-green-700"
                              : "text-gray-600"
                          }`}
                        >
                          {connection.isValid ? "Connecté" : "Déconnecté"}
                          {connection.platformUsername &&
                            ` • @${connection.platformUsername}`}
                        </P>
                        {isExpiring && (
                          <P className="mt-1 flex items-center text-xs text-orange-600">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Expire bientôt
                          </P>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {connection.isValid && (
                        <Button
                          onClick={() => refresh(connection.platform)}
                          disabled={isLoading}
                          variant={"secondary"}
                          size={"icon"}
                          title="Actualiser"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() =>
                          connection.isValid
                            ? disconnect(connection.platform)
                            : connectMutation.mutate(connection.platform)
                        }
                        disabled={isLoading}
                        variant={connection.isValid ? "destructive" : "success"}
                      >
                        {connection.isValid ? "Déconnecter" : "Reconnecter"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Conseils d'utilisation */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <H3 className="mb-2 font-medium text-blue-900">
            💡 Comment ça marche ?
          </H3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Connectez vos comptes sociaux une seule fois</li>
            <li>• Vos modules IA utilisent automatiquement ces connexions</li>
            <li>• Les tokens sont sécurisés et actualisés automatiquement</li>
            <li>• Publiez sur plusieurs plateformes simultanément</li>
          </ul>
        </div>

        {/* Bouton de rechargement */}
        <div className="mt-6">
          <Button onClick={() => refetchConnections()} disabled={isLoading}>
            {isLoading ? (
              <LoadingSpinner size="sm" color="white" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span>Actualiser les connexions</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
