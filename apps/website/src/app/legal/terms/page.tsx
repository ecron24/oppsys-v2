// apps/website/src/app/legal/terms/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function TermsPage() {
  const [language, setLanguage] = useState("fr");

  const content = {
    fr: {
      title: "Conditions Générales d'Utilisation",
      version: "Version : 1.0 - Date d'entrée en vigueur : 16 avril 2025",
      lastUpdate: "Dernière mise à jour : 16 avril 2025",
      back: "Accueil",
      sections: {
        intro: {
          title: "Préambule",
          content:
            "Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et l'utilisation de l'application web <code>https://app.oppsys.io</code>, propriété d'<strong>Oppsys</strong>, société en cours de création sous le droit maltais et européen, permettant à ses utilisateurs de bénéficier de services d'<strong>automatisation et de création de contenu via des agents d'intelligence artificielle</strong>.",
        },
        definitions: {
          title: "1. Définitions",
          content: `
            <ul>
              <li><strong>« Service » :</strong> l'application web Oppsys accessible via https://app.oppsys.io</li>
              <li><strong>« Utilisateur » :</strong> toute personne physique ou morale utilisant le Service</li>
              <li><strong>« Agents IA » :</strong> les systèmes d'intelligence artificielle proposés par Oppsys</li>
              <li><strong>« Contenu » :</strong> tout texte, image, données créés via le Service</li>
              <li><strong>« Compte » :</strong> espace personnel de l'Utilisateur sur le Service</li>
            </ul>
          `,
        },
        object: {
          title: "2. Objet et acceptation",
          content: `
            <p>Les présentes CGU définissent les conditions d'utilisation du Service Oppsys. L'utilisation du Service implique l'acceptation pleine et entière des présentes CGU.</p>
            <p><strong>Mise à jour :</strong> Oppsys se réserve le droit de modifier ces CGU à tout moment. Les utilisateurs seront notifiés des modifications importantes.</p>
          `,
        },
        company_info: {
          title: "3. Informations sur la société",
          content: `
            <p><strong>Société :</strong> Oppsys (en cours de création)<br />
            <strong>Forme juridique :</strong> Société maltaise<br />
            <strong>Siège social :</strong> Malte (adresse définitive en cours de finalisation)<br />
            <strong>Droit applicable :</strong> Droit maltais et européen<br />
            <strong>Email :</strong> contact@oppsys.io</p>
            <p><em>Note : La société étant en cours de création, certaines informations légales seront complétées dès finalisation de l'immatriculation.</em></p>
          `,
        },
        access: {
          title: "4. Accès au service",
          content: `
            <p><strong>Conditions d'accès :</strong></p>
            <ul>
              <li>Être âgé de 18 ans minimum ou avoir l'autorisation parentale</li>
              <li>Disposer d'une connexion internet et d'un navigateur compatible</li>
              <li>Créer un compte avec des informations exactes</li>
              <li>Respecter les présentes CGU</li>
            </ul>
            <p><strong>Suspension/Résiliation :</strong> Oppsys se réserve le droit de suspendre ou résilier l'accès en cas de violation des CGU.</p>
          `,
        },
        services: {
          title: "5. Description des services",
          content: `
            <p>Oppsys propose des services d'automatisation et de création de contenu via des agents d'intelligence artificielle, incluant :</p>
            <ul>
              <li>Génération de contenu textuel automatisée</li>
              <li>Agents IA spécialisés par domaine d'expertise</li>
              <li>Outils d'automatisation de processus</li>
              <li>Interface de gestion et paramétrage des agents</li>
            </ul>
            <p><strong>Évolution :</strong> Les services peuvent évoluer. Les utilisateurs seront informés des changements significatifs.</p>
          `,
        },
        user_obligations: {
          title: "6. Obligations de l'utilisateur",
          content: `
            <p>L'Utilisateur s'engage à :</p>
            <ul>
              <li><strong>Usage licite :</strong> utiliser le Service de manière conforme aux lois et réglementations</li>
              <li><strong>Informations exactes :</strong> fournir des informations vraies et à jour</li>
              <li><strong>Sécurité :</strong> protéger ses identifiants de connexion</li>
              <li><strong>Respect d'autrui :</strong> ne pas porter atteinte aux droits de tiers</li>
              <li><strong>Non-concurrence :</strong> ne pas développer de service concurrent en utilisant nos outils</li>
            </ul>
            <p><strong>Interdictions formelles :</strong></p>
            <ul>
              <li>Utilisation à des fins illégales ou malveillantes</li>
              <li>Génération de contenu offensant, diffamatoire ou discriminatoire</li>
              <li>Tentative de contournement des limitations techniques</li>
              <li>Revente ou redistribution du Service sans autorisation</li>
            </ul>
          `,
        },
        intellectual_property: {
          title: "7. Propriété intellectuelle",
          content: `
            <p><strong>Propriété d'Oppsys :</strong> Le Service, sa technologie, ses algorithmes et son interface sont protégés par le droit de la propriété intellectuelle.</p>
            <p><strong>Contenu généré :</strong></p>
            <ul>
              <li>L'Utilisateur conserve ses droits sur le contenu qu'il génère via le Service</li>
              <li>L'Utilisateur garantit ne pas porter atteinte aux droits de tiers</li>
              <li>Oppsys peut utiliser les données anonymisées pour améliorer ses services</li>
            </ul>
            <p><strong>Licence d'utilisation :</strong> Oppsys accorde une licence d'utilisation personnelle, non-exclusive et non-transmissible du Service.</p>
          `,
        },
        data_privacy: {
          title: "8. Protection des données",
          content: `
            <p>Le traitement des données personnelles est régi par notre <a href="/legal/privacy" class="text-orange-600 hover:text-orange-700 underline">Politique de Confidentialité</a>, conforme au RGPD et au droit maltais.</p>
            <p><strong>Principes :</strong></p>
            <ul>
              <li>Collecte minimale des données nécessaires</li>
              <li>Sécurisation maximale des informations</li>
              <li>Respect des droits des utilisateurs</li>
              <li>Transparence sur les traitements</li>
            </ul>
          `,
        },
        liability: {
          title: "9. Responsabilité et garanties",
          content: `
            <p><strong>Responsabilité d'Oppsys :</strong></p>
            <ul>
              <li>Oppsys s'efforce d'assurer la continuité du Service</li>
              <li>Aucune garantie n'est donnée sur la disponibilité 100% du Service</li>
              <li>Oppsys ne peut être tenue responsable des contenus générés par les Utilisateurs</li>
              <li>La responsabilité d'Oppsys est limitée aux dommages directs</li>
            </ul>
            <p><strong>Responsabilité de l'Utilisateur :</strong></p>
            <ul>
              <li>L'Utilisateur est seul responsable de l'usage qu'il fait du Service</li>
              <li>L'Utilisateur indemnisera Oppsys en cas de réclamation de tiers</li>
            </ul>
          `,
        },
        pricing: {
          title: "10. Conditions financières",
          content: `
            <p><strong>Modèle tarifaire :</strong> [À préciser selon votre modèle d'affaires]</p>
            <ul>
              <li>Version gratuite avec limitations</li>
              <li>Abonnements premium avec fonctionnalités avancées</li>
              <li>Facturation mensuelle ou annuelle</li>
            </ul>
            <p><strong>Paiement :</strong> Les paiements s'effectuent via les moyens proposés sur le Service. Remboursement selon conditions spécifiques communiquées.</p>
          `,
        },
        termination: {
          title: "11. Résiliation",
          content: `
            <p><strong>Résiliation par l'Utilisateur :</strong> possible à tout moment via les paramètres du compte.</p>
            <p><strong>Résiliation par Oppsys :</strong> en cas de violation des CGU, avec préavis sauf urgence.</p>
            <p><strong>Effets :</strong> Suppression du compte et des données selon notre politique de rétention.</p>
          `,
        },
        applicable_law: {
          title: "12. Droit applicable et juridiction",
          content: `
            <p>Les présentes CGU sont régies par le <strong>droit maltais</strong> et le droit européen applicable.</p>
            <p><strong>Résolution des litiges :</strong></p>
            <ul>
              <li>Tentative de résolution amiable privilégiée</li>
              <li>Médiation via la plateforme européenne de résolution des litiges en ligne</li>
              <li>Juridiction compétente : Tribunaux de Malte</li>
              <li>Pour les consommateurs européens : juridiction du lieu de résidence possible</li>
            </ul>
          `,
        },
        contact: {
          title: "13. Contact",
          content: `
            <p>Pour toute question relative aux présentes CGU :</p>
            <ul>
              <li><strong>Email :</strong> legal@oppsys.io</li>
              <li><strong>Support :</strong> contact@oppsys.io</li>
              <li><strong>Adresse :</strong> [À compléter une fois l'immatriculation finalisée]</li>
            </ul>
          `,
        },
      },
    },
    en: {
      title: "Terms of Service",
      version: "Version: 1.0 - Effective date: April 16, 2025",
      lastUpdate: "Last updated: April 16, 2025",
      back: "Home",
      sections: {
        intro: {
          title: "Preamble",
          content:
            'These General Terms of Use ("Terms") govern the access and use of the web application <code>https://app.oppsys.io</code>, owned by <strong>Oppsys</strong>, a company in the process of being established under Maltese and European law, allowing its users to benefit from <strong>automation and content creation services via artificial intelligence agents</strong>.',
        },
        definitions: {
          title: "1. Definitions",
          content: `
            <ul>
              <li><strong>\"Service\":</strong> the Oppsys web application accessible via https://app.oppsys.io</li>
              <li><strong>\"User\":</strong> any natural or legal person using the Service</li>
              <li><strong>\"AI Agents\":</strong> artificial intelligence systems offered by Oppsys</li>
              <li><strong>\"Content\":</strong> any text, image, data created via the Service</li>
              <li><strong>\"Account\":</strong> User's personal space on the Service</li>
            </ul>
          `,
        },
        object: {
          title: "2. Purpose and acceptance",
          content: `
            <p>These Terms define the conditions of use of the Oppsys Service. Use of the Service implies full acceptance of these Terms.</p>
            <p><strong>Updates:</strong> Oppsys reserves the right to modify these Terms at any time. Users will be notified of important changes.</p>
          `,
        },
        company_info: {
          title: "3. Company information",
          content: `
            <p><strong>Company:</strong> Oppsys (in process of creation)<br />
            <strong>Legal form:</strong> Maltese company<br />
            <strong>Registered office:</strong> Malta (final address being finalized)<br />
            <strong>Applicable law:</strong> Maltese and European law<br />
            <strong>Email:</strong> contact@oppsys.io</p>
            <p><em>Note: As the company is in the process of creation, some legal information will be completed upon finalization of registration.</em></p>
          `,
        },
        access: {
          title: "4. Service access",
          content: `
            <p><strong>Access conditions:</strong></p>
            <ul>
              <li>Be at least 18 years old or have parental authorization</li>
              <li>Have an internet connection and compatible browser</li>
              <li>Create an account with accurate information</li>
              <li>Comply with these Terms</li>
            </ul>
            <p><strong>Suspension/Termination:</strong> Oppsys reserves the right to suspend or terminate access in case of violation of the Terms.</p>
          `,
        },
        services: {
          title: "5. Service description",
          content: `
            <p>Oppsys offers automation and content creation services via artificial intelligence agents, including:</p>
            <ul>
              <li>Automated text content generation</li>
              <li>AI agents specialized by field of expertise</li>
              <li>Process automation tools</li>
              <li>Agent management and configuration interface</li>
            </ul>
            <p><strong>Evolution:</strong> Services may evolve. Users will be informed of significant changes.</p>
          `,
        },
        user_obligations: {
          title: "6. User obligations",
          content: `
            <p>The User undertakes to:</p>
            <ul>
              <li><strong>Lawful use:</strong> use the Service in accordance with laws and regulations</li>
              <li><strong>Accurate information:</strong> provide true and up-to-date information</li>
              <li><strong>Security:</strong> protect login credentials</li>
              <li><strong>Respect for others:</strong> not infringe on third party rights</li>
              <li><strong>Non-competition:</strong> not develop competing services using our tools</li>
            </ul>
            <p><strong>Formal prohibitions:</strong></p>
            <ul>
              <li>Use for illegal or malicious purposes</li>
              <li>Generation of offensive, defamatory or discriminatory content</li>
              <li>Attempts to bypass technical limitations</li>
              <li>Resale or redistribution of the Service without authorization</li>
            </ul>
          `,
        },
        intellectual_property: {
          title: "7. Intellectual property",
          content: `
            <p><strong>Oppsys ownership:</strong> The Service, its technology, algorithms and interface are protected by intellectual property law.</p>
            <p><strong>Generated content:</strong></p>
            <ul>
              <li>The User retains rights to content they generate via the Service</li>
              <li>The User guarantees not to infringe third party rights</li>
              <li>Oppsys may use anonymized data to improve its services</li>
            </ul>
            <p><strong>Usage license:</strong> Oppsys grants a personal, non-exclusive and non-transferable license to use the Service.</p>
          `,
        },
        data_privacy: {
          title: "8. Data protection",
          content: `
            <p>Personal data processing is governed by our <a href="/legal/privacy" class="text-orange-600 hover:text-orange-700 underline">Privacy Policy</a>, compliant with GDPR and Maltese law.</p>
            <p><strong>Principles:</strong></p>
            <ul>
              <li>Minimal collection of necessary data</li>
              <li>Maximum security of information</li>
              <li>Respect for user rights</li>
              <li>Transparency on processing</li>
            </ul>
          `,
        },
        liability: {
          title: "9. Liability and warranties",
          content: `
            <p><strong>Oppsys liability:</strong></p>
            <ul>
              <li>Oppsys strives to ensure Service continuity</li>
              <li>No guarantee is given on 100% Service availability</li>
              <li>Oppsys cannot be held responsible for User-generated content</li>
              <li>Oppsys liability is limited to direct damages</li>
            </ul>
            <p><strong>User liability:</strong></p>
            <ul>
              <li>The User is solely responsible for their use of the Service</li>
              <li>The User will indemnify Oppsys in case of third party claims</li>
            </ul>
          `,
        },
        pricing: {
          title: "10. Financial conditions",
          content: `
            <p><strong>Pricing model:</strong> [To be specified according to your business model]</p>
            <ul>
              <li>Free version with limitations</li>
              <li>Premium subscriptions with advanced features</li>
              <li>Monthly or annual billing</li>
            </ul>
            <p><strong>Payment:</strong> Payments are made via means offered on the Service. Refund according to specific conditions communicated.</p>
          `,
        },
        termination: {
          title: "11. Termination",
          content: `
            <p><strong>Termination by User:</strong> possible at any time via account settings.</p>
            <p><strong>Termination by Oppsys:</strong> in case of Terms violation, with notice except in emergency.</p>
            <p><strong>Effects:</strong> Account and data deletion according to our retention policy.</p>
          `,
        },
        applicable_law: {
          title: "12. Applicable law and jurisdiction",
          content: `
            <p>These Terms are governed by <strong>Maltese law</strong> and applicable European law.</p>
            <p><strong>Dispute resolution:</strong></p>
            <ul>
              <li>Amicable resolution attempt preferred</li>
              <li>Mediation via the European online dispute resolution platform</li>
              <li>Competent jurisdiction: Courts of Malta</li>
              <li>For European consumers: jurisdiction of place of residence possible</li>
            </ul>
          `,
        },
        contact: {
          title: "13. Contact",
          content: `
            <p>For any questions regarding these Terms:</p>
            <ul>
              <li><strong>Email:</strong> legal@oppsys.io</li>
              <li><strong>Support:</strong> contact@oppsys.io</li>
              <li><strong>Address:</strong> [To be completed once registration is finalized]</li>
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
          <div className="text-gray-600 space-y-2">
            <p className="text-sm">{t.version}</p>
            <p className="text-sm">{t.lastUpdate}</p>
          </div>
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
