// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fonction pour vérifier si l'utilisateur est admin
export const checkAdminAccess = async () => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { isAdmin: false, user: null };
    }

    // Vérifier le rôle admin dans la table profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    return {
      isAdmin: profile?.role === "admin",
      user: user,
      profile: profile,
    };
  } catch (error) {
    console.error("Erreur vérification admin:", error);
    return { isAdmin: false, user: null };
  }
};

// Fonction de connexion
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Vérifier si l'utilisateur est admin
    const adminCheck = await checkAdminAccess();

    if (!adminCheck.isAdmin) {
      await supabase.auth.signOut();
      throw new Error(
        "Accès non autorisé - Seuls les administrateurs peuvent se connecter"
      );
    }

    return { success: true, user: data.user };
  } catch (err) {
    const error = err as Error;
    return { success: false, error: error.message };
  }
};

// Fonction de déconnexion
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { success: !error, error: error?.message };
};
