// apps/website/src/app/legal/privacy/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Metadata } from "next";

export default function PrivacyPolicyPage() {
  const [language, setLanguage] = useState("fr");

  const content = {
    fr: {
      title: "Politique de Confidentialité",
      version: "Version : 1.0 - Date d'entrée en vigueur : 16 avril 2025",
      lastUpdate: "Dernière mise à jour : 16 avril 2025",
      back: "Accueil",
      sections: {
        intro: {
          title: "Introduction",
          content:
            "Chez <strong>Oppsys</strong>, société en cours de création sous le droit maltais et européen, nous accordons une importance capitale à la protection de vos données personnelles. Cette politique de confidentialité vous informe sur la manière dont nous collectons, utilisons, stockons et protégeons vos informations personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois maltaises en vigueur.",
        },
        controller: {
          title: "1. Responsable du traitement",
          content: `
            <p><strong>Société :</strong> Oppsys (en cours de création)<br />
            <strong>Forme juridique :</strong> Société maltaise<br />
            <strong>Siège social :</strong> Malte (adresse définitive en cours de finalisation)<br />
            <strong>Email :</strong> contact@oppsys.io<br />
            <strong>DPO :</strong> dpo@oppsys.io</p>
          `,
        },
        data_collected: {
          title: "2. Données collectées",
          content: `
            <p>Nous collectons les données suivantes :</p>
            <ul>
              <li><strong>Données d'identification :</strong> nom, prénom, adresse email</li>
              <li><strong>Données de connexion :</strong> adresse IP, logs de connexion, données de session</li>
              <li><strong>Données d'utilisation :</strong> interactions avec nos agents IA, préférences utilisateur</li>
              <li><strong>Données de contenu :</strong> contenus créés via nos services d'automatisation</li>
              <li><strong>Cookies et traceurs :</strong> pour le fonctionnement technique et l'amélioration de nos services</li>
            </ul>
          `,
        },
        purposes: {
          title: "3. Finalités du traitement",
          content: `
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul>
              <li><strong>Fourniture du service :</strong> création et gestion de votre compte, accès aux fonctionnalités IA</li>
              <li><strong>Amélioration du service :</strong> analyse d'usage, développement de nouvelles fonctionnalités</li>
              <li><strong>Communication :</strong> support client, notifications importantes</li>
              <li><strong>Conformité légale :</strong> respect des obligations légales et réglementaires</li>
              <li><strong>Sécurité :</strong> prévention de la fraude, protection contre les cyberattaques</li>
            </ul>
          `,
        },
        legal_basis: {
          title: "4. Bases légales",
          content: `
            <p>Nos traitements sont fondés sur :</p>
            <ul>
              <li><strong>Exécution du contrat :</strong> pour la fourniture de nos services</li>
              <li><strong>Intérêt légitime :</strong> pour l'amélioration et la sécurisation de nos services</li>
              <li><strong>Consentement :</strong> pour certaines communications marketing (avec opt-in)</li>
              <li><strong>Obligation légale :</strong> pour le respect des réglementations applicables</li>
            </ul>
          `,
        },
        retention: {
          title: "5. Durée de conservation",
          content: `
            <ul>
              <li><strong>Données de compte :</strong> durée de vie du compte + 3 ans</li>
              <li><strong>Logs techniques :</strong> 12 mois maximum</li>
              <li><strong>Données de contenu :</strong> selon vos paramètres utilisateur</li>
              <li><strong>Cookies :</strong> 13 mois maximum</li>
            </ul>
          `,
        },
        rights: {
          title: "6. Vos droits RGPD",
          content: `
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> supprimer vos données dans certains cas</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement pour motif légitime</li>
              <li><strong>Droit de retrait du consentement :</strong> à tout moment</li>
            </ul>
            <p>Pour exercer ces droits, contactez-nous à : <strong>dpo@oppsys.io</strong></p>
          `,
        },
        security: {
          title: "7. Sécurité des données",
          content: `
            <p>Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées :</p>
            <ul>
              <li>Chiffrement des données en transit et au repos</li>
              <li>Authentification forte et gestion des accès</li>
              <li>Surveillance et détection des incidents</li>
              <li>Formations régulières de nos équipes</li>
              <li>Audits de sécurité périodiques</li>
            </ul>
          `,
        },
        transfers: {
          title: "8. Transferts de données",
          content: `
            <p>Vos données peuvent être transférées vers :</p>
            <ul>
              <li><strong>Union Européenne :</strong> nos serveurs principaux (conformité RGPD native)</li>
              <li><strong>Pays tiers :</strong> uniquement vers des pays à niveau de protection adéquat ou avec garanties appropriées</li>
              <li><strong>Sous-traitants :</strong> fournisseurs cloud certifiés (AWS, Google Cloud) avec clauses contractuelles standard</li>
            </ul>
          `,
        },
        cookies: {
          title: "9. Cookies et traceurs",
          content: `
            <p>Nous utilisons :</p>
            <ul>
              <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement (pas de consentement requis)</li>
              <li><strong>Cookies analytiques :</strong> mesure d'audience anonymisée</li>
              <li><strong>Cookies fonctionnels :</strong> mémorisation des préférences</li>
            </ul>
            <p>Vous pouvez gérer vos préférences cookies via les paramètres de votre navigateur.</p>
          `,
        },
        contact: {
          title: "10. Contact et réclamations",
          content: `
            <p>Pour toute question relative à cette politique :</p>
            <ul>
              <li><strong>Email :</strong> dpo@oppsys.io</li>
              <li><strong>Délégué à la Protection des Données :</strong> dpo@oppsys.io</li>
            </ul>
            <p>Vous avez également le droit d'introduire une réclamation auprès de l'autorité de contrôle maltaise (IDPC) ou de votre autorité locale de protection des données.</p>
          `,
        },
        updates: {
          title: "11. Modifications",
          content:
            "Cette politique peut être mise à jour. Les modifications importantes vous seront notifiées par email ou via notre plateforme. La version en vigueur est toujours disponible sur cette page.",
        },
      },
    },
    en: {
      title: "Privacy Policy",
      version: "Version: 1.0 - Effective date: April 16, 2025",
      lastUpdate: "Last updated: April 16, 2025",
      back: "Home",
      sections: {
        intro: {
          title: "Introduction",
          content:
            "At <strong>Oppsys</strong>, a company in the process of being established under Maltese and European law, we attach paramount importance to the protection of your personal data. This privacy policy informs you about how we collect, use, store and protect your personal information in accordance with the General Data Protection Regulation (GDPR) and applicable Maltese laws.",
        },
        controller: {
          title: "1. Data Controller",
          content: `
            <p><strong>Company:</strong> Oppsys (in process of creation)<br />
            <strong>Legal form:</strong> Maltese company<br />
            <strong>Registered office:</strong> Malta (final address being finalized)<br />
            <strong>Email:</strong> contact@oppsys.io<br />
            <strong>DPO:</strong> dpo@oppsys.io</p>
          `,
        },
        data_collected: {
          title: "2. Data Collected",
          content: `
            <p>We collect the following data:</p>
            <ul>
              <li><strong>Identification data:</strong> first name, last name, email address</li>
              <li><strong>Connection data:</strong> IP address, connection logs, session data</li>
              <li><strong>Usage data:</strong> interactions with our AI agents, user preferences</li>
              <li><strong>Content data:</strong> content created via our automation services</li>
              <li><strong>Cookies and trackers:</strong> for technical operation and service improvement</li>
            </ul>
          `,
        },
        purposes: {
          title: "3. Processing Purposes",
          content: `
            <p>Your data is processed for the following purposes:</p>
            <ul>
              <li><strong>Service provision:</strong> account creation and management, access to AI features</li>
              <li><strong>Service improvement:</strong> usage analysis, development of new features</li>
              <li><strong>Communication:</strong> customer support, important notifications</li>
              <li><strong>Legal compliance:</strong> compliance with legal and regulatory obligations</li>
              <li><strong>Security:</strong> fraud prevention, protection against cyberattacks</li>
            </ul>
          `,
        },
        legal_basis: {
          title: "4. Legal Basis",
          content: `
            <p>Our processing is based on:</p>
            <ul>
              <li><strong>Contract performance:</strong> for the provision of our services</li>
              <li><strong>Legitimate interest:</strong> for improving and securing our services</li>
              <li><strong>Consent:</strong> for certain marketing communications (with opt-in)</li>
              <li><strong>Legal obligation:</strong> for compliance with applicable regulations</li>
            </ul>
          `,
        },
        retention: {
          title: "5. Retention Period",
          content: `
            <ul>
              <li><strong>Account data:</strong> account lifetime + 3 years</li>
              <li><strong>Technical logs:</strong> 12 months maximum</li>
              <li><strong>Content data:</strong> according to your user settings</li>
              <li><strong>Cookies:</strong> 13 months maximum</li>
            </ul>
          `,
        },
        rights: {
          title: "6. Your GDPR Rights",
          content: `
            <p>In accordance with GDPR, you have the following rights:</p>
            <ul>
              <li><strong>Right of access:</strong> obtain a copy of your data</li>
              <li><strong>Right of rectification:</strong> correct your inaccurate data</li>
              <li><strong>Right to erasure:</strong> delete your data in certain cases</li>
              <li><strong>Right to restriction:</strong> limit the processing of your data</li>
              <li><strong>Right to portability:</strong> retrieve your data in a structured format</li>
              <li><strong>Right to object:</strong> object to processing for legitimate reasons</li>
              <li><strong>Right to withdraw consent:</strong> at any time</li>
            </ul>
            <p>To exercise these rights, contact us at: <strong>dpo@oppsys.io</strong></p>
          `,
        },
        security: {
          title: "7. Data Security",
          content: `
            <p>We implement appropriate technical and organizational security measures:</p>
            <ul>
              <li>Data encryption in transit and at rest</li>
              <li>Strong authentication and access management</li>
              <li>Incident monitoring and detection</li>
              <li>Regular team training</li>
              <li>Periodic security audits</li>
            </ul>
          `,
        },
        transfers: {
          title: "8. Data Transfers",
          content: `
            <p>Your data may be transferred to:</p>
            <ul>
              <li><strong>European Union:</strong> our main servers (native GDPR compliance)</li>
              <li><strong>Third countries:</strong> only to countries with adequate level of protection or with appropriate safeguards</li>
              <li><strong>Subprocessors:</strong> certified cloud providers (AWS, Google Cloud) with standard contractual clauses</li>
            </ul>
          `,
        },
        cookies: {
          title: "9. Cookies and Trackers",
          content: `
            <p>We use:</p>
            <ul>
              <li><strong>Essential cookies:</strong> necessary for operation (no consent required)</li>
              <li><strong>Analytics cookies:</strong> anonymized audience measurement</li>
              <li><strong>Functional cookies:</strong> preference memorization</li>
            </ul>
            <p>You can manage your cookie preferences via your browser settings.</p>
          `,
        },
        contact: {
          title: "10. Contact and Complaints",
          content: `
            <p>For any questions regarding this policy:</p>
            <ul>
              <li><strong>Email:</strong> dpo@oppsys.io</li>
              <li><strong>Data Protection Officer:</strong> dpo@oppsys.io</li>
            </ul>
            <p>You also have the right to lodge a complaint with the Maltese supervisory authority (IDPC) or your local data protection authority.</p>
          `,
        },
        updates: {
          title: "11. Updates",
          content:
            "This policy may be updated. Important changes will be notified to you by email or via our platform. The current version is always available on this page.",
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
