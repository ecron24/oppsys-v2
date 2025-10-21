import { useState } from "react";

import { useAuth } from "./use-auth";
import { toast } from "@oppsys/ui";
import { authService } from "../services/auth-service";
import type { Provider } from "@oppsys/supabase";
import type { User } from "../types";
import { userService } from "../services/user-service";

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

  const sendMagicLink = async (email: string) => {
    setLoading(true);
    const result = await authService.signInWithOtp(
      email,
      `${window.location.origin}/auth/callback`
    );
    setLoading(false);
    if (result.success) {
      toast.success("Lien magique envoyé", {
        description: "Vérifiez votre email",
      });
      return;
    }
    toast.error("Erreur d'envoi du lien magique");
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
    sendMagicLink,
    updateProfile,
  };
};
