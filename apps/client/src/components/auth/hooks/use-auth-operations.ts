import { useState } from "react";

import { useAuth } from "./use-auth";
import { toast } from "@oppsys/ui";
import { authService } from "../services/auth-service";
import type { Provider } from "@oppsys/supabase";
import type { User } from "../types";
import { userService } from "../services/user-service";
import { routes } from "@/routes";

export const useAuthOperations = () => {
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signInWithPassword(email, password);
    setLoading(false);
    if (result.success) {
      toast.success("Connexion réussie");
      return;
    }
    toast.error("Erreur de connexion");
  };

  const signUp = async (
    email: string,
    password: string,
    userData: { fullName?: string } = {}
  ) => {
    const result = await authService.signUp(email, password, userData);
    setLoading(false);
    if (result.success) {
      toast.success("Inscription réussie", {
        description: "Vérifiez votre email pour confirmer votre compte",
      });
      return;
    }
    toast.error("Erreur d'inscription");
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    setLoading(false);
    if (result.success) {
      toast.success("Déconnexion réussie");
      return;
    }
    toast.error("Erreur de déconnexion");
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    const result = await authService.resetPasswordForEmail(
      email,
      `${window.location.origin}/reset-password`
    );
    setLoading(false);
    if (result.success) {
      toast.success("Email de réinitialisation envoyé");
      return;
    }
    toast.error("Erreur de réinitialisation");
  };

  const updatePassword = async (newPassword: string) => {
    setLoading(true);
    const result = await authService.updatePasswordUser(newPassword);
    setLoading(false);
    if (result.success) {
      toast.success("Mot de passe mis à jour");
      return;
    }
    toast.error("Erreur de mise à jour");
  };

  const signInWithProvider = async (provider: Provider) => {
    setLoading(true);
    const result = await authService.signInWithOAuth(
      provider,
      `${window.location.origin}/auth/callback`
    );
    setLoading(false);
    if (result.success) {
      return;
    }
    toast.error(`Erreur de connexion ${provider}`);
  };

  const signInWithOtp = async (email: string) => {
    setLoading(true);
    const result = await authService.signInWithOtp(
      email,
      `${window.location.origin}/auth/callback`
    );
    setLoading(false);
    if (result.success) {
      toast.success("Code de connexion envoyé", {
        description: "Vérifiez votre email",
      });
      return;
    }
    toast.error("Impossible d'envoyer le code de connexion.");
  };

  const verifyOtp = async (params: { email: string; otp: string }) => {
    setLoading(true);
    const result = await authService.verifyOtp(params);
    setLoading(false);
    if (result.success && result.data.session?.access_token) {
      // Fetch user profile after OTP verification
      // TODO: add options to pass token with : "result.data.session?.access_token"
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
  };

  const updateProfile = async (updates: Partial<User>) => {
    setLoading(true);

    const result = await userService.updateProfile(updates);
    setLoading(false);
    if (result.success) {
      setUser(result.data);
      toast.success("Profil mis à jour");
      return;
    }
    toast.error("Erreur de mise à jour");
  };

  return {
    loading,
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
