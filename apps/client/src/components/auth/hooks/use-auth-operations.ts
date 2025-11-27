import { useMutation } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { toast } from "@oppsys/ui";
import { authService } from "../services/auth-service";
import { userService } from "../services/user-service";
import type { Provider } from "@oppsys/supabase";
import type { User } from "../auth-types";
import { routes } from "@/routes";

export const useAuthOperations = () => {
  const { setUser, refetchUser } = useAuth();

  const signIn = useMutation({
    mutationFn: (params: { email: string; password: string }) =>
      authService.signInWithPassword(params),
    onSuccess: async (result) => {
      if (result.success) {
        await refetchUser();
        toast.success("Connexion réussie");
        return;
      }
      toast.error("Erreur de connexion", {
        description:
          "Vérifiez votre email et votre mot de passe, puis réessayez.",
      });
    },
  });

  const signUp = useMutation({
    mutationFn: (params: {
      email: string;
      password: string;
      fullName?: string;
    }) => authService.signUp(params),
    onSuccess: async (result) => {
      if (result.success) {
        await refetchUser();
        toast.success("Inscription réussie", {
          description: "Vérifiez votre email pour confirmer votre compte",
        });
        return;
      }
      toast.error("Erreur d'inscription");
    },
  });

  const signOut = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: async (result) => {
      if (result.success) {
        await refetchUser();
        toast.success("Déconnexion réussie");
        return;
      }
      toast.error("Erreur de déconnexion");
      setUser(null);
    },
  });

  const resetPassword = useMutation({
    mutationFn: (email: string) =>
      authService.resetPasswordForEmail(
        email,
        `${window.location.origin}/reset-password`
      ),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Email de réinitialisation envoyé");
        return;
      }
      toast.error("Erreur de réinitialisation");
    },
  });

  const updatePassword = useMutation({
    mutationFn: (newPassword: string) =>
      authService.updatePasswordUser(newPassword),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Mot de passe mis à jour");
        return;
      }
      toast.error("Erreur de mise à jour");
    },
  });

  const signInWithProvider = useMutation({
    mutationFn: (provider: Provider) =>
      authService.signInWithOAuth(
        provider,
        `${window.location.origin}/auth/callback`
      ),
    onSuccess: (result, provider) => {
      if (!result.success) toast.error(`Erreur de connexion ${provider}`);
    },
  });

  const signInWithOtp = useMutation({
    mutationFn: (email: string) =>
      authService.signInWithOtp(
        email,
        `${window.location.origin}/auth/callback`
      ),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Code de connexion envoyé", {
          description: "Vérifiez votre email",
        });
        return;
      }
      toast.error("Impossible d'envoyer le code de connexion.");
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (params: { email: string; otp: string }) => {
      const result = await authService.verifyOtp(params);
      if (result.success && result.data.session?.accessToken) {
        const profileResult = await userService.getMe();
        if (profileResult.success) {
          const profile = profileResult.data;
          const fullName = profile?.fullName ?? "";
          const hasCompletedProfile = fullName.trim().length > 0;
          setUser(profile);
          toast.success("Code vérifié !", {
            description: "Chargement de votre profil...",
          });
          return {
            success: true,
            data: { profile, hasCompletedProfile },
            redirectTo: hasCompletedProfile
              ? routes.dashboard.index()
              : routes.completeProfile.index(),
          } as const;
        }
      }
      toast.error("Code invalide ou expiré");
      return { success: false } as const;
    },
  });

  const updateProfile = useMutation({
    mutationFn: (updates: Partial<User>) => userService.updateProfile(updates),
    onSuccess: (result) => {
      if (result.success) {
        setUser(result.data);
        toast.success("Profil mis à jour");
        return;
      }
      toast.error("Erreur de mise à jour");
    },
  });

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    signInWithProvider,
    signInWithOtp,
    verifyOtp,
    updateProfile,
  };
};
