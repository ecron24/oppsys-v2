// apps/website/src/app/contact/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ContactPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const planType = searchParams.get("plan") || "";
  const lookupKey = searchParams.get("lookup_key") || "";
  const emailFromUrl = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: emailFromUrl,
    company: "",
    phone: "",
    message: "",
    plan: planType,
    lookup_key: lookupKey,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);

  // Préparer un message par défaut en fonction du plan
  useEffect(() => {
    if (planType === "entreprise") {
      setFormData((prev) => ({
        ...prev,
        message: `Je souhaite obtenir plus d'informations sur le plan Entreprise (${lookupKey}).`,
      }));
    }
  }, [planType, lookupKey]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gdprConsent) {
      setError(
        "Vous devez accepter le traitement de vos données personnelles pour continuer."
      );
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Configuration Supabase manquante");
      }

      // INSERT direct dans contact_requests (évite les triggers problématiques)
      const response = await fetch(`${supabaseUrl}/rest/v1/contact_requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company.trim(),
          phone: formData.phone?.trim() || null,
          message: formData.message.trim(),
          plan: formData.plan?.trim() || null,
          lookup_key: formData.lookup_key?.trim() || null,
          gdpr_consent: gdprConsent,
          consent_timestamp: new Date().toISOString(),
          source: "website",
          priority:
            formData.plan === "entreprise" || formData.plan === "premium"
              ? "high"
              : "normal",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur Supabase:", errorText);
        throw new Error(`Erreur lors de l'envoi (${response.status})`);
      }

      const result = await response.json();
      console.log("Contact créé:", result);

      setSuccess(true);

      // Réinitialiser le formulaire
      setFormData({
        name: "",
        email: "",
        company: "",
        phone: "",
        message: "",
        plan: "",
        lookup_key: "",
      });
      setGdprConsent(false);
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(
        err.message ||
          "Une erreur est survenue lors de l'envoi de votre demande"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 bg-orange-600 md:w-64 p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Contactez-nous</h2>
            <p className="mb-4">
              Notre équipe commerciale est à votre disposition pour vous
              accompagner dans votre projet.
            </p>
            {planType === "entreprise" && (
              <div className="mt-6 p-4 bg-orange-700 rounded-lg">
                <h3 className="font-semibold mb-2">Plan Entreprise</h3>
                <p className="text-sm opacity-80">
                  Idéal pour les grandes organisations avec des besoins
                  spécifiques et personnalisés.
                </p>
                <p className="text-sm mt-2 opacity-60">
                  Référence: {lookupKey}
                </p>
              </div>
            )}

            {/* Informations de contact */}
            <div className="mt-8 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Coordonnées</h3>
                <p className="text-sm opacity-80">Email: contact@oppsys.io</p>
                <p className="text-sm opacity-80">Siège social: Malte</p>
              </div>
            </div>
          </div>

          <div className="p-8 md:flex-1">
            {success ? (
              <div className="text-center py-8">
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
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  Demande envoyée avec succès !
                </h2>
                <p className="text-gray-600 mb-6">
                  Nous avons bien reçu votre demande. Notre équipe commerciale
                  vous contactera dans les plus brefs délais.
                </p>
                <div className="mt-8">
                  <Link
                    href="/pricing"
                    className="inline-block bg-orange-600 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-700 transition-colors"
                  >
                    Retour aux plans
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email professionnel *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Entreprise *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    required
                  ></textarea>
                </div>

                {/* Section RGPD - OBLIGATOIRE */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-orange-800 mb-2">
                      Protection de vos données personnelles
                    </h3>
                    <p className="text-sm text-orange-700 mb-3">
                      Conformément au RGPD, nous vous informons que vos données
                      personnelles seront traitées par Oppsys pour :
                    </p>
                    <ul className="text-sm text-orange-700 space-y-1 mb-3 ml-4 list-disc">
                      <li>Répondre à votre demande de contact</li>
                      <li>Vous présenter nos services adaptés</li>
                      <li>Assurer le suivi commercial si vous le souhaitez</li>
                    </ul>
                    <p className="text-sm text-orange-700">
                      Vos données sont conservées 3 ans maximum et ne sont
                      jamais transmises à des tiers sans votre accord.
                    </p>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="gdpr-consent"
                      checked={gdprConsent}
                      onChange={(e) => setGdprConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                      required
                    />
                    <label
                      htmlFor="gdpr-consent"
                      className="text-sm text-gray-700"
                    >
                      J'accepte que mes données personnelles soient traitées par
                      Oppsys dans le cadre de ma demande. Je peux exercer mes
                      droits (accès, rectification, effacement, opposition) en
                      contactant{" "}
                      <a
                        href="mailto:dpo@oppsys.io"
                        className="text-orange-600 hover:text-orange-700 underline"
                      >
                        dpo@oppsys.io
                      </a>
                      . Pour en savoir plus, consultez notre{" "}
                      <Link
                        href="/legal/privacy"
                        className="text-orange-600 hover:text-orange-700 underline"
                      >
                        politique de confidentialité
                      </Link>
                      . *
                    </label>
                  </div>
                </div>

                {/* Champs cachés pour le plan et le lookup_key */}
                <input type="hidden" name="plan" value={formData.plan} />
                <input
                  type="hidden"
                  name="lookup_key"
                  value={formData.lookup_key}
                />

                {error && (
                  <div className="p-3 bg-red-100 text-red-700 rounded-md border border-red-300">
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <Link
                    href="/pricing"
                    className="text-orange-600 hover:text-orange-800 text-sm"
                  >
                    ← Retour aux plans
                  </Link>
                  <button
                    type="submit"
                    className="px-6 py-3 border border-transparent rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting || !gdprConsent}
                  >
                    {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                  </button>
                </div>

                {/* Informations légales supplémentaires */}
                <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
                  <p>
                    * Champs obligatoires. En soumettant ce formulaire, vous
                    acceptez d'être contacté par Oppsys concernant votre
                    demande. Société en cours de création sous le droit maltais.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
