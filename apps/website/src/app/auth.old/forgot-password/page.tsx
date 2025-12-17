// apps/website/src/app/auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClientClient } from "@/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClientClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Construction de l'URL de redirection pour Next.js
      const baseUrl = window.location.origin;
      const resetUrl = `${baseUrl}/auth/reset-password`;

      console.log("🔍 Envoi email de reset vers:", resetUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: resetUrl,
      });

      if (error) throw error;

      console.log("✅ Email de reset envoyé avec succès");
      setMessage(
        "Un lien de réinitialisation a été envoyé à votre adresse email."
      );
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("❌ Erreur resetPasswordForEmail:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg px-8 pt-6 pb-8 max-w-md w-full">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Mot de passe oublié
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

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

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Adresse email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
              placeholder="votre@email.com"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
          >
            ← Retour à la connexion
          </Link>
        </div>

        {/* Debug info - seulement en développement */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs border border-gray-200 dark:border-gray-600">
            <p className="font-semibold text-gray-700 dark:text-gray-300">
              Debug Info:
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Current URL:</strong>{" "}
              {typeof window !== "undefined" ? window.location.href : "N/A"}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              <strong>Reset URL:</strong>{" "}
              {typeof window !== "undefined"
                ? `${window.location.origin}/auth/reset-password`
                : "N/A"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
