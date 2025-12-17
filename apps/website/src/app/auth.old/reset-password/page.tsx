// apps/website/src/app/auth/reset-password/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientClient } from "@/lib/supabase";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const router = useRouter();
  const supabase = createClientClient();

  useEffect(() => {
    console.log("🔍 ResetPasswordPage - Initialisation");

    let hasProcessedTokens = false;

    const handleAuth = async () => {
      try {
        // 1. Vérifier s'il y a une session active
        const {
          data: { session: existingSession },
        } = await supabase.auth.getSession();

        if (existingSession) {
          console.log("✅ Session existante trouvée:", existingSession.user.id);
          setIsValidToken(true);
          setMessage(
            "✅ Vous êtes connecté ! Vous pouvez maintenant changer votre mot de passe."
          );
          setCheckingToken(false);
          return;
        }

        // 2. Traiter les tokens du hash
        if (
          typeof window !== "undefined" &&
          window.location.hash &&
          !hasProcessedTokens
        ) {
          hasProcessedTokens = true;
          await processHashTokens();
        } else if (typeof window !== "undefined" && !window.location.hash) {
          console.log("❌ Aucun token et aucune session");
          setError("Lien de réinitialisation manquant ou expiré");
          setCheckingToken(false);
          setTimeout(() => router.push("/auth/forgot-password"), 3000);
        }
      } catch (err: any) {
        console.error("❌ Erreur dans handleAuth:", err);
        setError("Erreur lors de la vérification de l'authentification");
        setCheckingToken(false);
      }
    };

    const processHashTokens = async () => {
      try {
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");
        const error = hashParams.get("error");
        const errorDescription = hashParams.get("error_description");

        console.log("🔍 Tokens du hash:", {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: type,
          error: error,
        });

        // Gérer les erreurs
        if (error) {
          console.error("❌ Erreur dans l'URL:", error, errorDescription);
          setError(`Erreur: ${errorDescription || error}`);
          setCheckingToken(false);
          setTimeout(() => router.push("/auth/forgot-password"), 5000);
          return;
        }

        // Vérifier les tokens
        if (!accessToken || !refreshToken || type !== "recovery") {
          console.log("❌ Tokens invalides");
          setError("Lien de réinitialisation invalide");
          setCheckingToken(false);
          setTimeout(() => router.push("/auth/forgot-password"), 5000);
          return;
        }

        // Définir la session
        console.log("🔄 Définition de la session avec les tokens...");
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError) {
          console.error("❌ Erreur setSession:", sessionError);
          throw sessionError;
        }

        console.log("✅ Session établie:", data?.user?.id);
        setIsValidToken(true);
        setMessage(
          "✅ Lien valide ! Vous pouvez maintenant définir votre nouveau mot de passe."
        );
        setCheckingToken(false);

        // Nettoyer l'URL
        window.history.replaceState({}, document.title, "/auth/reset-password");
      } catch (err: any) {
        console.error("❌ Erreur processHashTokens:", err);
        setError(`Erreur de validation: ${err.message}`);
        setCheckingToken(false);
        setTimeout(() => router.push("/auth/forgot-password"), 5000);
      }
    };

    // Écouter les changements d'état d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log("🔍 Auth state change:", event, session?.user?.id);

        if (event === "SIGNED_IN" && session) {
          console.log("✅ SIGNED_IN détecté");
          setIsValidToken(true);
          setMessage(
            "✅ Connexion réussie ! Vous pouvez changer votre mot de passe."
          );
          setCheckingToken(false);
        } else if (event === "PASSWORD_RECOVERY") {
          console.log("✅ PASSWORD_RECOVERY détecté");
          setIsValidToken(true);
          setMessage(
            "✅ Mode récupération activé ! Changez votre mot de passe ci-dessous."
          );
          setCheckingToken(false);
        } else if (event === "SIGNED_OUT") {
          console.log("❌ SIGNED_OUT détecté");
          setIsValidToken(false);
          setError("Session expirée");
          setTimeout(() => router.push("/auth/forgot-password"), 3000);
        }
      }
    );

    // Démarrer le processus
    handleAuth();

    // Timeout de sécurité
    const timeout = setTimeout(() => {
      if (checkingToken) {
        console.log("⏰ Timeout - redirection");
        setError("Délai d'attente dépassé. Redirection...");
        setCheckingToken(false);
        setTimeout(() => router.push("/auth/forgot-password"), 2000);
      }
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router, checkingToken, supabase]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validations
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      setLoading(false);
      return;
    }

    try {
      console.log("🔄 Mise à jour du mot de passe...");

      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("❌ Erreur updateUser:", error);
        throw error;
      }

      console.log("✅ Mot de passe mis à jour avec succès");
      setMessage(
        "✅ Mot de passe mis à jour avec succès ! Redirection vers l'accueil..."
      );

      // Redirection vers l'accueil ou dashboard
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      console.error("❌ Erreur lors de la mise à jour:", err);
      setError(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 pt-6 pb-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Réinitialiser le mot de passe
          </h1>
        </div>

        {/* Debug info - development only */}
        {process.env.NODE_ENV === "development" &&
          typeof window !== "undefined" && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs border border-gray-200 dark:border-gray-600">
              <p className="font-semibold text-gray-700 dark:text-gray-300">
                Debug Info:
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>URL:</strong> {window.location.href}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Hash:</strong> {window.location.hash}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Token valide:</strong>{" "}
                {isValidToken ? "✅ Oui" : "❌ Non"}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Vérification:</strong>{" "}
                {checkingToken ? "🔄 En cours" : "✅ Terminée"}
              </p>
            </div>
          )}

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-lg mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {checkingToken ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Validation du lien de réinitialisation...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Patientez quelques instants...
            </p>
          </div>
        ) : isValidToken ? (
          <>
            <form onSubmit={handleReset} className="space-y-6">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Nouveau mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Au moins 8 caractères"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Répétez le mot de passe"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </button>
            </form>

            {/* Option pour retourner à l'accueil */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 text-center">
                Vous êtes déjà connecté. Vous pouvez :
              </p>
              <button
                onClick={goToHome}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm transition-colors"
              >
                Retourner à l'accueil sans changer le mot de passe
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Lien de réinitialisation invalide ou expiré
            </p>
            <button
              onClick={() => router.push("/auth/forgot-password")}
              className="bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Demander un nouveau lien
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
