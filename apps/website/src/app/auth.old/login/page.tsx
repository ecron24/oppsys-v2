// apps/website/src/app/auth/login/page.tsx - CORRECTION FINALE
"use client";

import { useState, useEffect } from "react"; // ✅ Ajout ici
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicLinkLoading, setMagicLinkLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usePassword, setUsePassword] = useState(false);

  // ✅ Pré-remplissage email depuis l'URL
  useEffect(() => {
    const emailFromURL = searchParams.get("email");
    if (emailFromURL) {
      setEmail(emailFromURL);
    }
  }, [searchParams]);

  // Récupérer le plan depuis l'URL
  const planFromUrl = searchParams.get("plan") || "free";

  // ✅ Login avec mot de passe - redirection directe vers app
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("[Login] Tentative de connexion pour:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[Login] Erreur authentication:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("Aucune donnée utilisateur reçue");
      }

      console.log("[Login] ✅ Connexion réussie pour:", data.user.email);

      // S'assurer que l'utilisateur existe dans clients
      await ensureUserExistsInDatabase(data.user);

      // ✅ CORRECTION : Attendre que la session soit bien établie
      console.log("[Login] Préparation redirection vers app...");

      // Attendre 2 secondes pour que la session soit propagée
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // ✅ CORRECTION CRITIQUE : Redirection avec tokens
      console.log("[Login] Récupération session pour redirection...");
      const { data: sessionData } = await supabase.auth.getSession();

      if (sessionData.session) {
        const callbackUrl = `https://app.oppsys.io/auth/callback?access_token=${sessionData.session.access_token}&refresh_token=${sessionData.session.refresh_token}&type=password_login`;
        console.log("[Login] Redirection avec tokens vers:", callbackUrl);
        window.location.replace(callbackUrl);
      } else {
        throw new Error("Aucune session créée après connexion");
      }
    } catch (err: any) {
      console.error("[Login] Erreur complète:", err);
      let errorMessage = "Une erreur est survenue lors de la connexion";

      if (err.message?.includes("Invalid login credentials")) {
        errorMessage = "Email ou mot de passe incorrect";
      } else if (err.message?.includes("Email not confirmed")) {
        errorMessage = "Veuillez confirmer votre email avant de vous connecter";
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORRECTION MAJEURE : Magic Link avec la bonne URL de callback
  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMagicLinkLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log("[Magic Link] Vérification utilisateur existant:", email);

      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      const isExistingUser = !!existingClient;
      console.log("[Magic Link] Utilisateur existant:", isExistingUser);

      // ✅ CORRECTION PRINCIPALE : URL de redirection vers votre AuthCallback React
      const redirectUrl = "https://app.oppsys.io/auth/callback";

      console.log("[Magic Link] URL de redirection:", redirectUrl);

      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // ✅ CORRECTION : Pointer vers votre AuthCallback.jsx existant
          emailRedirectTo: redirectUrl,
          data: {
            initial_plan: planFromUrl,
            plan_lookup_key: `plan_${planFromUrl}`,
            pending_setup: !isExistingUser,
            is_returning_user: isExistingUser,
            // ✅ AJOUT : Informations pour votre AuthCallback
            redirect_after_auth: "dashboard",
            source: "website_login",
          },
        },
      });

      if (error) {
        console.error("[Magic Link] Erreur:", error);
        throw error;
      }

      console.log("[Magic Link] ✅ Magic link envoyé vers:", redirectUrl);
      setMessage("Un lien de connexion a été envoyé à votre email !");

      // Rediriger vers la page de confirmation
      setTimeout(() => {
        router.push(
          `/auth/link-sent?email=${encodeURIComponent(email)}&plan=${planFromUrl}`
        );
      }, 1500);
    } catch (err: any) {
      console.error("[Magic Link] Erreur lors de l'envoi:", err);
      setError(err.message);
    } finally {
      setMagicLinkLoading(false);
    }
  };

  // ✅ Fonction de gestion base de données améliorée
  const ensureUserExistsInDatabase = async (user: any) => {
    try {
      console.log("[Login] Vérification utilisateur dans DB:", user.id);

      // Vérifier si l'utilisateur existe dans clients
      const { data: existingClient, error: checkError } = await supabase
        .from("clients")
        .select("id, email")
        .eq("id", user.id)
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") {
        console.warn("[Login] Erreur vérification DB:", checkError);
        return; // Continuer même en cas d'erreur
      }

      if (!existingClient) {
        console.log("[Login] Utilisateur non trouvé en DB, création...");

        // Créer l'utilisateur dans clients
        const { data: newClient, error: createError } = await supabase
          .from("clients")
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0],
              phone_number: user.user_metadata?.phone || "",
              profile_completed: false,
              role: "client",
              address: {
                adresse: "",
                adresse2: "",
                code_postal: "",
                ville: "",
                pays: "France",
              },
              metadata: user.user_metadata || {},
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (createError) {
          console.error("[Login] Erreur création utilisateur:", createError);
          // Ne pas faire échouer la connexion pour autant
        } else {
          console.log("[Login] ✅ Utilisateur créé en DB:", newClient);
        }
      } else {
        console.log("[Login] ✅ Utilisateur existe déjà en DB");
      }
    } catch (error) {
      console.error("[Login] Exception lors de la vérification DB:", error);
      // Ne pas faire échouer la connexion
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <Image
        src="/logo-oppsys-192.png"
        alt="Logo OppSys"
        width={80}
        height={80}
        className="mb-6"
      />

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Connexion à votre espace client
        </h1>

        {message && (
          <div className="bg-green-50 text-green-600 p-3 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        {/* Toggle pour choisir le mode de connexion */}
        <div className="mb-6">
          <div className="flex space-x-4 justify-center">
            <button
              onClick={() => setUsePassword(false)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                !usePassword
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Connexion sans mot de passe
            </button>
            <button
              onClick={() => setUsePassword(true)}
              className={`px-4 py-2 rounded-lg border text-sm ${
                usePassword
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              Connexion avec mot de passe
            </button>
          </div>
        </div>

        {!usePassword ? (
          // Formulaire Magic Link
          <form onSubmit={handleMagicLinkLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Votre adresse email"
              />
            </div>

            <button
              type="submit"
              disabled={magicLinkLoading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
            >
              {magicLinkLoading
                ? "Envoi du lien..."
                : "Se connecter sans mot de passe"}
            </button>

            <div className="text-center text-xs text-gray-500">
              Un lien de connexion sécurisé sera envoyé à votre email
            </div>
          </form>
        ) : (
          // Formulaire avec mot de passe
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Votre adresse email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Votre mot de passe"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded transition duration-200 disabled:opacity-50"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="text-orange-600 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
