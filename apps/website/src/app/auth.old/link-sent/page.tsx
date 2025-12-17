// apps/website/src/app/auth/link-sent/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LinkSentPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const plan = searchParams.get("plan") || "free";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
      <Image
        src="/logo-oppsys-192.png"
        alt="Logo Oppsys"
        width={80}
        height={80}
        className="mb-6"
      />

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          Vérifiez votre email
        </h1>

        <p className="text-gray-600 mb-6">
          Un lien de connexion a été envoyé à <strong>{email}</strong>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Plan sélectionné: <strong className="capitalize">{plan}</strong>
          </p>
        </div>

        <div className="space-y-3 text-sm text-gray-600">
          <p>
            Cliquez sur le lien dans l'email pour vous connecter
            automatiquement.
          </p>
          <p>Le lien expire dans 1 heure pour votre sécurité.</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Vous n'avez pas reçu l'email ?
          </p>
          <div className="space-y-2">
            <Link
              href="/auth/login"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
            >
              Renvoyer un lien
            </Link>
            <Link
              href="/"
              className="block text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
