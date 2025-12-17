// apps/website/src/app/legal/cookies/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Metadata } from "next";

export default function CookiesPage() {
  const [language, setLanguage] = useState("fr");

  const content = {
    fr: {
      title: "Politique de Cookies",
      lastUpdate: "Dernière mise à jour : 16 avril 2025",
      back: "Accueil",
      sections: {
        intro: {
          title: "Qu'est-ce qu'un cookie ?",
          content:
            "Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, tablette, mobile) lors de la visite d'un site web. Il permet de collecter des informations relatives à votre navigation et de vous proposer des services adaptés à votre terminal (langue utilisée, résolution d'affichage, système d'exploitation, etc.).",
        },
        our_cookies: {
          title: "Les cookies utilisés sur Oppsys",
          content: `
            <p>Sur <strong>https://oppsys.io</strong> et <strong>https://app.oppsys.io</strong>, nous utilisons différents types de cookies :</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🔧 Cookies strictement nécessaires</h3>
            <p>Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés :</p>
            <ul>
              <li><strong>Authentification :</strong> maintien de votre session de connexion</li>
              <li><strong>Sécurité :</strong> protection contre les attaques CSRF</li>
              <li><strong>Fonctionnement technique :</strong> équilibrage de charge, gestion des erreurs</li>
              <li><strong>Préférences essentielles :</strong> langue sélectionnée, paramètres d'accessibilité</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Base légale : Intérêt légitime (fonctionnement du service)</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📊 Cookies analytiques</h3>
            <p>Ces cookies nous aident à comprendre comment vous utilisez nos services :</p>
            <ul>
              <li><strong>Mesure d'audience :</strong> nombre de visiteurs, pages consultées</li>
              <li><strong>Performance :</strong> temps de chargement, erreurs techniques</li>
              <li><strong>Parcours utilisateur :</strong> analyse anonymisée des interactions</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Base légale : Consentement (vous pouvez vous opposer)</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🎨 Cookies de personnalisation</h3>
            <p>Ces cookies améliorent votre expérience utilisateur :</p>
            <ul>
              <li><strong>Thème :</strong> mode sombre/clair, couleurs préférées</li>
              <li><strong>Interface :</strong> disposition des éléments, préférences d'affichage</li>
              <li><strong>Agents IA :</strong> mémorisation de vos agents favoris</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Base légale : Consentement (vous pouvez vous opposer)</p>
          `,
        },
        third_party: {
          title: "Cookies de tiers",
          content: `
            <p>Nous utilisons également des services tiers qui peuvent déposer leurs propres cookies :</p>
            <ul>
              <li><strong>Supabase :</strong> authentification et base de données</li>
              <li><strong>Vercel/Netlify :</strong> hébergement et optimisation</li>
              <li><strong>Services d'analyse :</strong> Google Analytics (si activé)</li>
            </ul>
            <p>Ces services ont leurs propres politiques de confidentialité que nous vous recommandons de consulter.</p>
          `,
        },
        duration: {
          title: "Durée de conservation",
          content: `
            <ul>
              <li><strong>Cookies de session :</strong> supprimés à la fermeture du navigateur</li>
              <li><strong>Cookies persistants :</strong> 13 mois maximum</li>
              <li><strong>Cookies analytiques :</strong> 25 mois maximum</li>
              <li><strong>Cookies de préférences :</strong> 12 mois maximum</li>
            </ul>
          `,
        },
        management: {
          title: "Gestion de vos préférences",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🎛️ Via notre interface</h3>
            <p>Vous pouvez gérer vos préférences cookies directement sur notre site via le bouton "Paramètres cookies" présent en bas de page.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🌐 Via votre navigateur</h3>
            <p>Vous pouvez également configurer votre navigateur pour gérer les cookies :</p>
            <ul>
              <li><strong>Google Chrome :</strong> Paramètres → Confidentialité et sécurité → Cookies et autres données de sites</li>
              <li><strong>Mozilla Firefox :</strong> Options → Vie privée et sécurité → Cookies et données de sites</li>
              <li><strong>Safari :</strong> Préférences → Confidentialité → Gérer les données de sites web</li>
              <li><strong>Microsoft Edge :</strong> Paramètres → Cookies et autorisations de site</li>
            </ul>
          `,
        },
        consequences: {
          title: "Conséquences du refus des cookies",
          content: `
            <p><strong>Cookies essentiels refusés :</strong></p>
            <ul>
              <li>Impossibilité de se connecter à votre compte</li>
              <li>Perte des préférences de navigation</li>
              <li>Fonctionnalités réduites de l'application</li>
            </ul>
            <p><strong>Cookies non-essentiels refusés :</strong></p>
            <ul>
              <li>Expérience moins personnalisée</li>
              <li>Pas d'impact sur les fonctionnalités principales</li>
              <li>Possibilité de modifier votre choix à tout moment</li>
            </ul>
          `,
        },
      },
    },
    en: {
      title: "Cookie Policy",
      lastUpdate: "Last updated: April 16, 2025",
      back: "Home",
      sections: {
        intro: {
          title: "What is a cookie?",
          content:
            "A cookie is a small text file placed on your device (computer, tablet, mobile) when visiting a website. It collects information about your browsing and offers you services adapted to your device (language used, display resolution, operating system, etc.).",
        },
        our_cookies: {
          title: "Cookies used on Oppsys",
          content: `
            <p>On <strong>https://oppsys.io</strong> and <strong>https://app.oppsys.io</strong>, we use different types of cookies:</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🔧 Strictly necessary cookies</h3>
            <p>These cookies are essential for the website to function and cannot be disabled:</p>
            <ul>
              <li><strong>Authentication:</strong> maintaining your login session</li>
              <li><strong>Security:</strong> protection against CSRF attacks</li>
              <li><strong>Technical operation:</strong> load balancing, error management</li>
              <li><strong>Essential preferences:</strong> selected language, accessibility settings</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Legal basis: Legitimate interest (service operation)</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📊 Analytics cookies</h3>
            <p>These cookies help us understand how you use our services:</p>
            <ul>
              <li><strong>Audience measurement:</strong> number of visitors, pages viewed</li>
              <li><strong>Performance:</strong> loading times, technical errors</li>
              <li><strong>User journey:</strong> anonymized interaction analysis</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Legal basis: Consent (you can opt out)</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🎨 Personalization cookies</h3>
            <p>These cookies improve your user experience:</p>
            <ul>
              <li><strong>Theme:</strong> dark/light mode, preferred colors</li>
              <li><strong>Interface:</strong> element layout, display preferences</li>
              <li><strong>AI Agents:</strong> memorizing your favorite agents</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Legal basis: Consent (you can opt out)</p>
          `,
        },
        third_party: {
          title: "Third-party cookies",
          content: `
            <p>We also use third-party services that may set their own cookies:</p>
            <ul>
              <li><strong>Supabase:</strong> authentication and database</li>
              <li><strong>Vercel/Netlify:</strong> hosting and optimization</li>
              <li><strong>Analytics services:</strong> Google Analytics (if enabled)</li>
            </ul>
            <p>These services have their own privacy policies that we recommend you consult.</p>
          `,
        },
        duration: {
          title: "Retention period",
          content: `
            <ul>
              <li><strong>Session cookies:</strong> deleted when browser is closed</li>
              <li><strong>Persistent cookies:</strong> 13 months maximum</li>
              <li><strong>Analytics cookies:</strong> 25 months maximum</li>
              <li><strong>Preference cookies:</strong> 12 months maximum</li>
            </ul>
          `,
        },
        management: {
          title: "Managing your preferences",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🎛️ Via our interface</h3>
            <p>You can manage your cookie preferences directly on our site via the "Cookie Settings" button at the bottom of the page.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🌐 Via your browser</h3>
            <p>You can also configure your browser to manage cookies:</p>
            <ul>
              <li><strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
              <li><strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
              <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
              <li><strong>Microsoft Edge:</strong> Settings → Cookies and site permissions</li>
            </ul>
          `,
        },
        consequences: {
          title: "Consequences of refusing cookies",
          content: `
            <p><strong>Essential cookies refused:</strong></p>
            <ul>
              <li>Unable to log into your account</li>
              <li>Loss of browsing preferences</li>
              <li>Reduced application functionality</li>
            </ul>
            <p><strong>Non-essential cookies refused:</strong></p>
            <ul>
              <li>Less personalized experience</li>
              <li>No impact on main functionality</li>
              <li>Ability to change your choice at any time</li>
            </ul>
          `,
        },
      },
    },
  };

  const t = content[language as keyof typeof content];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Bouton d'accueil */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="-ml-1 mr-2 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t.back}
          </Link>
        </div>

        {/* Sélecteur de langue */}
        <div className="mb-6 flex justify-end">
          <select
            className="block w-32 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* En-tête */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-orange-600 mb-4">{t.title}</h1>
          <p className="text-sm text-gray-600">{t.lastUpdate}</p>
        </header>

        {/* Contenu */}
        <div className="prose max-w-none">
          {/* Introduction */}
          <section className="mb-8 p-6 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <h2 className="text-2xl font-semibold text-orange-700 mb-4">
              {t.sections.intro.title}
            </h2>
            <div
              dangerouslySetInnerHTML={{ __html: t.sections.intro.content }}
            />
          </section>

          {/* Sections principales */}
          {Object.entries(t.sections).map(([key, section]) => {
            if (key === "intro") return null;
            return (
              <section key={key} className="mb-8">
                <h2 className="text-2xl font-semibold text-orange-600 mb-4 pb-2 border-b border-gray-200">
                  {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: section.content }} />
                </div>
              </section>
            );
          })}
        </div>

        {/* Call to action */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🍪 Gérer mes préférences
          </h3>
          <p className="text-gray-600 mb-4">
            Vous souhaitez modifier vos préférences de cookies ? Cliquez sur le
            bouton ci-dessous pour accéder aux paramètres.
          </p>
          <button
            onClick={() => {
              /* Logique d'ouverture du panneau cookies */
            }}
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Paramètres cookies
          </button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Oppsys - Tous droits réservés | Société en cours de création
            (Malte)
          </p>
        </div>
      </div>
    </div>
  );
}
