/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Mail, Phone } from "lucide-react";

// ✅ TYPES SIMPLIFIÉS
interface Plan {
  id: string;
  name: string;
  price: number | string;
  lookup_key: string;
  popular?: boolean;
  features: Array<{ text: string; included: boolean }>;
  priceId?: string;
  isEnterprise?: boolean;
}

interface FeatureItemProps {
  included: boolean;
  text: string;
}

const FeatureItem = ({ included, text }: FeatureItemProps) => (
  <li className="flex items-start mb-3">
    <span
      className={`mr-2 mt-1 ${included ? "text-green-500" : "text-gray-400"}`}
    >
      {included ? (
        <CheckCircle className="w-4 h-4" />
      ) : (
        <XCircle className="w-4 h-4" />
      )}
    </span>
    <span className={included ? "text-gray-800" : "text-gray-500"}>{text}</span>
  </li>
);

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "https://api.oppsys.io";
        const res = await fetch(`${apiBase}/api/stripe/plans`);

        if (!res.ok) {
          throw new Error(
            `Erreur API plans: ${res.status} - ${res.statusText}`
          );
        }

        const data = await res.json();

        // ✅ FILTRER SOLO ET AJOUTER ENTREPRISE
        const enrichedPlans = data
          .filter(
            (plan: any) =>
              plan.id !== "entreprise" &&
              plan.id !== "solo" &&
              plan.name?.toLowerCase() !== "solo"
          )
          .map((p: any) => ({
            ...p,
            popular: p.name === "Standard",
            features: getFeaturesByPlanType(p.name?.toLowerCase() || "free"),
            lookup_key: p.lookup_key || `plan_${p.name?.toLowerCase()}`,
            // ✅ MASQUER LES TARIFS AVEC XX
            price: p.price === 0 ? 0 : "XX",
          }));

        // ✅ AJOUTER PLAN ENTREPRISE
        enrichedPlans.push({
          id: "entreprise",
          name: "Entreprise",
          price: "Sur devis",
          description: "Solutions personnalisées pour les grandes entreprises",
          features: getFeaturesByPlanType("entreprise"),
          lookup_key: "plan_entreprise",
          isEnterprise: true,
        });

        setPlans(enrichedPlans);
      } catch (err) {
        console.error("Erreur récupération plans:", err);

        // ✅ PLANS PAR DÉFAUT SANS SOLO + ENTREPRISE
        const defaultPlans = [
          {
            id: "free",
            name: "Plan Gratuit",
            price: 0,
            description: "Plan gratuit avec fonctionnalités de base",
            features: getFeaturesByPlanType("free"),
            lookup_key: "plan_free",
          },
          {
            id: "standard",
            name: "Standard",
            price: "XX", // ✅ MASQUÉ
            description: "Pour les petites équipes",
            popular: true,
            features: getFeaturesByPlanType("standard"),
            lookup_key: "plan_standard",
          },
          {
            id: "premium",
            name: "Premium",
            price: "XX", // ✅ MASQUÉ
            description: "Pour les équipes",
            features: getFeaturesByPlanType("premium"),
            lookup_key: "plan_premium",
          },
          {
            id: "entreprise",
            name: "Entreprise",
            price: "Sur devis",
            description:
              "Solutions personnalisées pour les grandes entreprises",
            features: getFeaturesByPlanType("entreprise"),
            lookup_key: "plan_entreprise",
            isEnterprise: true,
          },
        ];

        setPlans(defaultPlans);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const getFeaturesByPlanType = (planType: string) => {
    switch (planType) {
      case "free":
        return [
          { text: "Toutes les applications", included: true },
          { text: "300 crédits par mois", included: true },
          { text: "Fonctionnalités de base", included: true },
          { text: "Support communautaire", included: true },
          { text: "Support prioritaire", included: false },
          { text: "Intégrations avancées", included: false },
        ];
      case "standard":
        return [
          { text: "Toutes les applications", included: true },
          { text: "XXX crédits par mois", included: true }, // ✅ MASQUÉ
          { text: "Toutes les fonctionnalités", included: true },
          { text: "Support prioritaire", included: true },
          { text: "Toutes les intégrations", included: true },
          { text: "Analytics avancées", included: true },
        ];
      case "premium":
        return [
          { text: "Toutes les applications", included: true },
          { text: "XXX crédits par mois", included: true }, // ✅ MASQUÉ
          { text: "Fonctionnalités premium", included: true },
          { text: "Support prioritaire 24/7", included: true },
          { text: "Intégrations personnalisées", included: true },
          { text: "Formation et onboarding", included: true },
        ];
      case "entreprise": // ✅ NOUVEAU PLAN
        return [
          { text: "Toutes les applications", included: true },
          { text: "Crédits illimités", included: true },
          { text: "Fonctionnalités sur-mesure", included: true },
          { text: "Support dédié 24/7", included: true },
          { text: "Intégrations personnalisées", included: true },
          { text: "Formation équipe complète", included: true },
          { text: "SLA garanti", included: true },
          { text: "Déploiement on-premise", included: true },
        ];
      default:
        return [
          { text: "Fonctionnalités de base", included: true },
          { text: "Support standard", included: true },
        ];
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // ✅ GESTION PLAN ENTREPRISE
  const handleSubscribe = async (planId: string, lookup_key: string) => {
    console.log(`Demande d'abonnement au plan: ${planId} (${lookup_key})`);
    setSelectedPlan(planId);

    // ✅ PLAN ENTREPRISE → CONTACT DIRECT
    if (planId === "entreprise") {
      window.location.href =
        "mailto:contact@oppsys.io?subject=Demande%20plan%20Entreprise&body=Bonjour,%0A%0AJe%20souhaite%20obtenir%20un%20devis%20pour%20le%20plan%20Entreprise.%0A%0AMerci";
      return;
    }

    if (email && validateEmail(email)) {
      console.log("Email déjà fourni, traitement du plan");
      await createCheckoutSession(planId, email, lookup_key);
    } else {
      console.log("Affichage du formulaire email");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Soumission du formulaire email");

    if (!validateEmail(email)) {
      console.log("Email invalide:", email);
      setEmailError("Veuillez saisir une adresse email valide");
      return;
    }

    setEmailError("");

    const selectedPlanData = plans.find((p) => p.id === selectedPlan);
    const lookup_key = selectedPlanData ? selectedPlanData.lookup_key : null;
    console.log("Plan sélectionné:", selectedPlan, "Lookup key:", lookup_key);

    if (selectedPlan && lookup_key) {
      await createCheckoutSession(selectedPlan, email, lookup_key);
    }
  };

  const createCheckoutSession = async (
    planId: string,
    email: string,
    lookup_key: string
  ) => {
    setIsSubmitting(true);
    console.log("🔄 Création de la session:", { planId, email, lookup_key });

    try {
      // ✅ SOLUTION : Plan gratuit → Redirection vers login avec params
      if (
        planId === "bf1bfc2d-0b1c-44f4-9e8e-00d1d9f9d9de" ||
        planId === "free" ||
        lookup_key === "plan_free"
      ) {
        console.log("🆓 Plan gratuit détecté - Redirection vers login");

        const loginUrl = `https://app.oppsys.io/login?email=${encodeURIComponent(email)}&plan=free&source=pricing`;

        console.log("🔗 Redirection vers:", loginUrl);
        window.location.href = loginUrl;
        return;
      }

      // ✅ PLANS PAYANTS MASQUÉS → REDIRECTION VERS CONTACT
      if (planId === "standard" || planId === "premium") {
        console.log("💰 Plan payant masqué - Redirection vers contact");
        window.location.href = `mailto:contact@oppsys.io?subject=Demande%20plan%20${encodeURIComponent(plans.find((p) => p.id === planId)?.name || planId)}&body=Bonjour,%0A%0AJe%20souhaite%20obtenir%20plus%20d'informations%20sur%20le%20plan%20${encodeURIComponent(plans.find((p) => p.id === planId)?.name || planId)}.%0A%0AEmail:%20${encodeURIComponent(email)}%0A%0AMerci`;
        return;
      }

      // Plans payants normaux : Stripe (désactivé pour l'instant)
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "https://api.oppsys.io";
      const apiUrl = `${apiBase}/api/stripe/create-checkout-session`;

      console.log("🚀 Envoi de la requête Stripe à:", apiUrl);
      console.log("📊 Données:", { planId, email, lookup_key });

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          email,
          lookup_key,
          source: "pricing_page",
        }),
      });

      const responseText = await response.text();
      console.log("📋 Réponse brute:", responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Erreur de parsing JSON:", parseError);
        throw new Error(
          `Réponse non-JSON: ${responseText.substring(0, 100)}...`
        );
      }

      if (!response.ok) {
        console.error("❌ Erreur détaillée:", data);
        throw new Error(
          data.error ||
            data.details ||
            "Erreur lors de la création de la session"
        );
      }

      console.log("✅ Réponse du serveur:", data);

      if (data.redirect) {
        console.log("🔄 Redirection vers:", data.url);
        window.location.href = data.url;
      } else if (data.url) {
        console.log("🔄 Redirection vers Stripe:", data.url);
        window.location.href = data.url;
      } else {
        console.error("❌ Aucune URL fournie dans la réponse");
        throw new Error("Aucune URL de redirection fournie");
      }
    } catch (err: any) {
      console.error("💥 Erreur complète:", err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des plans...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choisissez le plan qui vous convient
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Tous nos plans incluent l'accès à la plateforme et aux workers IA
            </p>
            {/* ✅ AVERTISSEMENT TARIFS EN COURS DE RÉVISION */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
              <p className="text-yellow-800 text-sm">
                🔄{" "}
                <strong>
                  Nos tarifs sont actuellement en cours de révision.
                </strong>{" "}
                Contactez-nous pour obtenir les tarifs les plus récents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section des plans */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg max-w-4xl mx-auto">
              <p className="font-medium">Une erreur est survenue:</p>
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-orange-500 transform scale-105"
                    : plan.isEnterprise
                      ? "border-purple-500 transform scale-105"
                      : "border-gray-100 hover:border-orange-200"
                }`}
              >
                {plan.popular && (
                  <div className="bg-orange-600 text-white text-center py-2 px-4 text-sm font-semibold rounded-t-2xl">
                    RECOMMANDÉ
                  </div>
                )}
                {plan.isEnterprise && (
                  <div className="bg-purple-600 text-white text-center py-2 px-4 text-sm font-semibold rounded-t-2xl">
                    ENTREPRISE
                  </div>
                )}
                {(plan.id === "bf1bfc2d-0b1c-44f4-9e8e-00d1d9f9d9de" ||
                  plan.name === "Free" ||
                  plan.id === "free") && (
                  <div className="bg-green-500 text-white text-center py-2 px-4 text-sm font-semibold rounded-t-2xl">
                    GRATUIT
                  </div>
                )}

                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Idéal pour{" "}
                    {plan.id === "bf1bfc2d-0b1c-44f4-9e8e-00d1d9f9d9de" ||
                    plan.name === "Free" ||
                    plan.id === "free"
                      ? "découvrir la plateforme"
                      : plan.id === "standard"
                        ? "les petites équipes"
                        : plan.id === "premium"
                          ? "les moyennes entreprises"
                          : plan.isEnterprise
                            ? "les grandes entreprises"
                            : "les professionnels"}
                  </p>

                  <div className="flex items-baseline mb-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {plan.price === 0
                        ? "Gratuit"
                        : plan.price === "Sur devis"
                          ? "Sur devis"
                          : typeof plan.price === "string"
                            ? `${plan.price}€`
                            : `${plan.price}€`}
                    </span>
                    {plan.price !== 0 && plan.price !== "Sur devis" && (
                      <span className="ml-1 text-xl text-gray-500">/mois</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id, plan.lookup_key)}
                    className={`w-full px-4 py-3 rounded-lg font-medium text-white transition-all duration-200 ${
                      plan.id === "bf1bfc2d-0b1c-44f4-9e8e-00d1d9f9d9de" ||
                      plan.name === "Free" ||
                      plan.id === "free"
                        ? "bg-green-600 hover:bg-green-700 transform hover:scale-105"
                        : plan.isEnterprise
                          ? "bg-purple-600 hover:bg-purple-700 transform hover:scale-105"
                          : plan.popular
                            ? "bg-orange-600 hover:bg-orange-700 transform hover:scale-105"
                            : "bg-gray-800 hover:bg-gray-900 transform hover:scale-105"
                    } shadow-lg`}
                  >
                    {
                      isSubmitting && selectedPlan === plan.id
                        ? "Chargement..."
                        : plan.id === "bf1bfc2d-0b1c-44f4-9e8e-00d1d9f9d9de" ||
                            plan.name === "Free" ||
                            plan.id === "free"
                          ? "Commencer gratuitement"
                          : plan.isEnterprise
                            ? "Nous contacter"
                            : "Nous contacter" // ✅ TOUS LES PLANS PAYANTS → CONTACT
                    }
                  </button>
                </div>

                <div className="px-6 pt-2 pb-8 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                  <h3 className="text-sm font-medium text-gray-900 tracking-wide mb-4">
                    Fonctionnalités incluses
                  </h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <FeatureItem
                        key={index}
                        included={feature.included}
                        text={feature.text}
                      />
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* ✅ SECTION CONTACT POUR TARIFS */}
          <div className="text-center mt-16">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Besoin d'informations sur nos tarifs ?
              </h3>
              <p className="text-gray-600 mb-6">
                Nos équipes sont disponibles pour vous présenter nos offres et
                vous aider à choisir le plan le plus adapté à vos besoins.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:contact@oppsys.io?subject=Demande%20d'informations%20tarifs"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Nous écrire
                </a>
                <a
                  href="https://calendly.com/oppsys/demo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Réserver un appel
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Questions fréquentes
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Puis-je changer de plan ?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Oui, vous pouvez changer de plan à tout moment. Contactez-nous
                pour adapter votre abonnement.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Comment fonctionne la facturation ?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                La facturation est mensuelle. Les modalités précises vous seront
                communiquées lors de votre souscription.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Y a-t-il une période d'essai ?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Nous proposons un plan gratuit avec 300 crédits pour tester la
                plateforme sans engagement.
              </p>
            </div>

            {/* ✅ NOUVELLE FAQ TARIFS */}
            <div className="bg-white rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Pourquoi les tarifs ne sont-ils pas affichés ?
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Nous révisons actuellement notre grille tarifaire pour vous
                proposer les meilleures offres. Contactez-nous pour obtenir un
                devis personnalisé.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal email simplifié - GARDÉ POUR PLAN GRATUIT */}
      {selectedPlan && selectedPlan !== "entreprise" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Presque terminé !
            </h3>
            <p className="text-gray-600 mb-6">
              Veuillez saisir votre adresse email pour continuer
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="vous@exemple.com"
                  required
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Plan sélectionné:{" "}
                  <span className="font-semibold">
                    {plans.find((p) => p.id === selectedPlan)?.name}
                  </span>
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedPlan(null)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-lg shadow-sm text-white font-medium transition-all duration-200 bg-orange-600 hover:bg-orange-700 focus:ring-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Redirection..."
                    : selectedPlan === "bf1bfc2d-0b1c-44f4-9e8e-00d1d9f9d9de" ||
                        selectedPlan === "free" ||
                        plans.find((p) => p.id === selectedPlan)?.name ===
                          "Free"
                      ? "Créer mon compte gratuit"
                      : "Nous contacter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
