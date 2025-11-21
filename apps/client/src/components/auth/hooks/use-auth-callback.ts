import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { authService } from "../services/auth-service";
import { userService } from "../services/user-service";

export type AuthStatus = "checking" | "success" | "error";

export const useAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [message, setMessage] = useState("Authentification en cours...");

  useEffect(() => {
    let mounted = true;
    let processed = false;

    const handleCallback = async () => {
      if (processed || !mounted) return;
      processed = true;

      try {
        // ✅ ÉTAPE 1: Vérifier les erreurs dans l'URL
        const errorParam = searchParams.get("error");
        const errorCode = searchParams.get("error_code");
        const errorDescription = searchParams.get("error_description");

        if (errorParam || errorCode) {
          let errorMessage = "Erreur de connexion";

          if (errorCode === "otp_expired") {
            errorMessage =
              "Le lien de connexion a expiré. Demandez un nouveau lien.";
          } else if (errorParam === "access_denied") {
            errorMessage = "Lien de connexion invalide ou déjà utilisé.";
          } else if (errorDescription) {
            errorMessage = decodeURIComponent(
              errorDescription.replace(/\+/g, " ")
            );
          }

          setStatus("error");
          setMessage(errorMessage);
          setTimeout(() => {
            if (mounted) navigate("/login", { replace: true });
          }, 4000);
          return;
        }

        // ✅ ÉTAPE 2: Gestion des callbacks OAuth sociaux
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const platform = searchParams.get("platform");
        const socialSuccess = searchParams.get("success");
        const socialError = searchParams.get("error");

        if (platform || socialSuccess || socialError) {
          setStatus("checking");
          setMessage("Finalisation de la connexion sociale...");

          if (socialError) {
            setStatus("error");
            setMessage(`Erreur OAuth: ${socialError}`);
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "SOCIAL_AUTH_ERROR",
                  error: socialError,
                  platform: platform,
                },
                window.location.origin
              );
              window.close();
            } else {
              setTimeout(() => navigate("/profile"), 3000);
            }
            return;
          }

          if (socialSuccess === "true") {
            setStatus("success");
            setMessage(`${platform} connecté avec succès !`);
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "SOCIAL_AUTH_SUCCESS",
                  platform: platform,
                },
                window.location.origin
              );
              window.close();
            } else {
              setTimeout(() => navigate("/profile"), 2000);
            }
            return;
          }

          if (code && state && platform) {
            // Assume social auth is completed by backend
            setStatus("success");
            setMessage(`${platform} connecté avec succès !`);
            if (window.opener) {
              window.opener.postMessage(
                {
                  type: "SOCIAL_AUTH_SUCCESS",
                  platform: platform,
                },
                window.location.origin
              );
              window.close();
            } else {
              setTimeout(() => navigate("/profile"), 2000);
            }
            return;
          }
        }

        // ✅ ÉTAPE 3: Magic Link avec PKCE
        setStatus("checking");
        setMessage("Traitement de votre connexion...");

        // ✅ Vérifier si on a un code PKCE (magic link)
        const authCode = searchParams.get("code");

        if (authCode) {
          setMessage("Validation du lien de connexion...");

          try {
            // ✅ PKCE: Échanger le code contre une session
            const sessionData =
              await authService.exchangeCodeForSession(authCode);

            if (!sessionData.success || !sessionData.data?.accessToken) {
              throw new Error("Aucune session obtenue après échange");
            }

            // ✅ Session PKCE obtenue avec succès
            setMessage("Lien validé, chargement de votre profil...");

            // ✅ Charger le profil utilisateur
            const profileResult = await userService.getMe();
            if (!profileResult.success) {
              throw new Error("User not found");
            }

            // ✅ Succès complet
            if (!mounted) return;

            setStatus("success");
            setMessage("Connexion réussie !");

            // ✅ Déterminer la redirection
            const profile = profileResult.data;
            const hasCompletedProfile =
              (profile?.fullName?.trim() || "").length > 0;
            const createdAt = profile.createdAt ?? new Date().toISOString();
            const userCreatedAt = new Date(createdAt);
            const isRecentUser =
              new Date().getTime() - userCreatedAt.getTime() < 5 * 60 * 1000;

            const redirectTo =
              (!hasCompletedProfile && isRecentUser) || !hasCompletedProfile
                ? "/complete-profile"
                : "/dashboard";

            setTimeout(() => {
              if (mounted) {
                navigate(redirectTo, { replace: true });
              }
            }, 1500);

            return;
          } catch {
            if (!mounted) return;
            setStatus("error");
            setMessage("Lien de connexion invalide, expiré ou déjà utilisé");
            setTimeout(() => {
              if (mounted) navigate("/login", { replace: true });
            }, 4000);
            return;
          }
        }

        // ✅ FALLBACK: Pas de code, essayer session normale
        setMessage("Vérification de la session...");
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const sessionData = await authService.getSession();

        if (
          !sessionData.success ||
          !sessionData.data ||
          !sessionData?.data?.accessToken
        ) {
          if (!mounted) return;
          setStatus("error");
          setMessage("Aucune session active trouvée");
          setTimeout(() => {
            if (mounted) navigate("/login", { replace: true });
          }, 3000);
          return;
        }

        // ✅ Session normale trouvée
        setMessage("Chargement de votre profil...");

        try {
          const profileResult = await userService.getMe();
          if (!profileResult.success) {
            throw new Error("User not found");
          }

          if (!mounted) return;

          setStatus("success");
          setMessage("Connexion réussie !");

          const profile = profileResult.data;
          const hasCompletedProfile =
            (profile?.fullName?.trim() || "").length > 0;
          const createdAt = profile.createdAt ?? new Date().toISOString();
          const userCreatedAt = new Date(createdAt);
          const isRecentUser =
            new Date().getTime() - userCreatedAt.getTime() < 5 * 60 * 1000;

          const redirectTo =
            (!hasCompletedProfile && isRecentUser) || !hasCompletedProfile
              ? "/complete-profile"
              : "/dashboard";

          setTimeout(() => {
            if (mounted) {
              navigate(redirectTo, { replace: true });
            }
          }, 1500);
        } catch {
          if (!mounted) return;
          setStatus("error");
          setMessage("Impossible de charger votre profil");
          setTimeout(() => {
            if (mounted) navigate("/login", { replace: true });
          }, 3000);
        }
      } catch {
        if (mounted) {
          setStatus("error");
          setMessage("Une erreur est survenue lors de l'authentification");
          setTimeout(() => navigate("/login", { replace: true }), 3000);
        }
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [searchParams, navigate]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleBackToLogin = () => {
    navigate("/login", { replace: true });
  };

  return {
    status,
    message,
    handleRetry,
    handleBackToLogin,
  };
};
