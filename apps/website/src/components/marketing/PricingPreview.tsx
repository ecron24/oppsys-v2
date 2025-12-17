// apps/website/src/components/marketing/PricingPreview.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Plan {
  id: string;
  name: string;
  price: number | string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
}

export function PricingPreview() {
  const [plans, setPlans] = useState<Plan[]>([
    // Plans par défaut (fallback)
    {
      id: "free",
      name: "Gratuit",
      price: "0€",
      description: "Parfait pour découvrir",
      features: [
        "5 utilisations/mois",
        "Workers de base",
        "Support communauté",
      ],
      cta: "Commencer",
      popular: false,
    },
    {
      id: "standard",
      name: "Standard",
      price: "25€",
      description: "Idéal pour les équipes",
      features: ["20 utilisations/mois", "Tous les workers", "Support premium"],
      cta: "Choisir Standard",
      popular: true,
    },
    {
      id: "premium",
      name: "Premium",
      price: "65€",
      description: "Pour les professionnels",
      features: [
        "utilisation illimités",
        "IA personnalisée",
        "Support prioritaire",
      ],
      cta: "Choisir Premium",
      popular: false,
    },
  ]);
  const [loading, setLoading] = useState(true);

  // Charger les vrais prix depuis l'API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "https://admin-api.oppsys.io";
        const response = await fetch(`${apiBase}/api/stripe/plans`);

        if (response.ok) {
          const apiPlans = await response.json();

          // Mapper et filtrer les plans pour le preview
          const previewPlans = apiPlans
            .filter((plan: any) =>
              ["free", "standard", "premium"].includes(plan.id)
            )
            .map((plan: any) => ({
              id: plan.id,
              name: plan.name,
              price:
                plan.price === 0
                  ? "0€"
                  : typeof plan.price === "string"
                    ? plan.price
                    : `${plan.price}€`,
              description:
                plan.id === "free"
                  ? "Parfait pour découvrir"
                  : plan.id === "standard"
                    ? "Idéal pour les équipes"
                    : "Pour les professionnels",
              features:
                plan.id === "free"
                  ? [
                      "5 utilisations/mois",
                      "Workers de base",
                      "Support communauté",
                    ]
                  : plan.id === "standard"
                    ? ["20 projets/mois", "Tous les workers", "Support premium"]
                    : [
                        "Projets illimités",
                        "IA personnalisée",
                        "Support prioritaire",
                      ],
              cta:
                plan.id === "free"
                  ? "Commencer"
                  : plan.id === "standard"
                    ? "Choisir Standard"
                    : "Choisir Premium",
              popular: plan.id === "standard",
            }));

          if (previewPlans.length > 0) {
            setPlans(previewPlans);
          }
        }
      } catch (error) {
        console.log("Utilisation des plans par défaut (erreur API)");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Des tarifs simples et transparents
          </h2>
          <p className="text-xl text-gray-600">
            Choisissez le plan qui correspond à vos besoins
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-300 hover:shadow-lg ${
                  plan.popular
                    ? "border-blue-500 transform scale-105"
                    : "border-gray-100 hover:border-blue-200"
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 px-4 text-sm font-semibold rounded-t-2xl">
                    RECOMMANDÉ
                  </div>
                )}

                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>

                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.price !== "0€" && (
                      <span className="ml-1 text-gray-500">/mois</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center text-gray-700"
                      >
                        <svg
                          className="h-5 w-5 text-green-500 mr-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/pricing"
                    className={`w-full block text-center py-3 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link
            href="/pricing"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Voir tous les détails des tarifs →
          </Link>
        </div>
      </div>
    </section>
  );
}
