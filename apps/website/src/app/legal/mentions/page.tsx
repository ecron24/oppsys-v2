// apps/website/src/app/legal/mentions/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LegalNoticePage() {
  const [language, setLanguage] = useState("fr");

  const content = {
    fr: {
      title: "Mentions Légales",
      lastUpdate: "Dernière mise à jour : 16 avril 2025",
      back: "Accueil",
      sections: {
        identification: {
          title: "1. Identification de l'éditeur",
          content: `
            <p><strong>Société :</strong> Oppsys (en cours de création)<br />
            <strong>Forme juridique :</strong> Société maltaise<br />
            <strong>Siège social :</strong> Malte (adresse définitive en cours de finalisation)<br />
            <strong>Numéro d'immatriculation :</strong> [En cours d'obtention]<br />
            <strong>Directeur de publication :</strong> [À préciser]<br />
            <strong>Capital social :</strong> [À déterminer]</p>
            <p><em>Note : La société étant en cours de création sous le droit maltais, les informations définitives seront mises à jour dès finalisation de l'immatriculation.</em></p>
          `,
        },
        contact: {
          title: "2. Coordonnées",
          content: `
            <p><strong>Email :</strong> contact@oppsys.io<br />
            <strong>Support technique :</strong> support@oppsys.io<br />
            <strong>Questions juridiques :</strong> legal@oppsys.io<br />
            <strong>Site web :</strong> https://oppsys.io<br />
            <strong>Application :</strong> https://app.oppsys.io</p>
          `,
        },
        hosting: {
          title: "3. Hébergement",
          content: `
            <p><strong>Hébergeur :</strong> [À préciser selon votre choix]<br />
            Exemples possibles :<br />
            - <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut, CA 91789, USA)<br />
            - <strong>Netlify Inc.</strong> (44 Montgomery St Suite 300, San Francisco, CA 94104, USA)<br />
            - <strong>Amazon Web Services EMEA SARL</strong> (38 Avenue John F. Kennedy, L-1855 Luxembourg)</p>
            <p>Infrastructure cloud conforme aux standards européens de protection des données (RGPD).</p>
          `,
        },
        intellectual_property: {
          title: "4. Propriété intellectuelle",
          content: `
            <p>Le site web <strong>https://oppsys.io</strong> et l'application <strong>https://app.oppsys.io</strong>, ainsi que l'ensemble de leur contenu (textes, images, graphiques, logo, interface utilisateur, algorithmes d'IA) sont la propriété exclusive d'<strong>Oppsys</strong>.</p>
            <p>Ces éléments sont protégés par :</p>
            <ul>
              <li>Le droit d'auteur européen et maltais</li>
              <li>Les droits de marque (en cours de dépôt)</li>
              <li>Les droits sur les bases de données</li>
              <li>Les secrets d'affaires relatifs aux algorithmes IA</li>
            </ul>
            <p>Toute reproduction, représentation, modification ou adaptation sans autorisation expresse est interdite et constitue une contrefaçon.</p>
          `,
        },
        liability: {
          title: "5. Clause de non-responsabilité",
          content: `
            <p><strong>Oppsys</strong> met tout en œuvre pour fournir des informations précises et des services de qualité. Toutefois, elle ne peut garantir :</p>
            <ul>
              <li>L'exactitude, la complétude ou l'actualité des informations publiées</li>
              <li>Le fonctionnement ininterrompu des services d'IA</li>
              <li>L'absence d'erreurs techniques ou de bugs</li>
              <li>La compatibilité avec tous les environnements techniques</li>
            </ul>
            <p>L'utilisation des services se fait aux risques et périls de l'utilisateur. Oppsys ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation du site ou de l'application.</p>
          `,
        },
        data_protection: {
          title: "6. Protection des données personnelles",
          content: `
            <p>Conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong> et à la législation maltaise :</p>
            <ul>
              <li>Les données personnelles sont traitées de manière licite, loyale et transparente</li>
              <li>Elles sont collectées pour des finalités déterminées et légitimes</li>
              <li>Elles sont conservées de manière sécurisée</li>
              <li>Les utilisateurs disposent de droits (accès, rectification, effacement, etc.)</li>
            </ul>
            <p>Pour plus de détails, consultez notre <a href="/legal/privacy" class="text-orange-600 hover:text-orange-700 underline">Politique de Confidentialité</a>.</p>
          `,
        },
        cookies: {
          title: "7. Politique des cookies",
          content: `
            <p>Le site utilise des cookies pour :</p>
            <ul>
              <li><strong>Cookies essentiels :</strong> authentification, sécurité, préférences de session</li>
              <li><strong>Cookies analytiques :</strong> mesure d'audience anonymisée</li>
              <li><strong>Cookies fonctionnels :</strong> mémorisation des préférences utilisateur</li>
            </ul>
            <p>Vous pouvez configurer vos préférences cookies via votre navigateur. Le refus des cookies essentiels peut limiter certaines fonctionnalités.</p>
          `,
        },
        applicable_law: {
          title: "8. Droit applicable",
          content: `
            <p>Les présentes mentions légales sont régies par :</p>
            <ul>
              <li><strong>Droit maltais</strong> (droit de la société)</li>
              <li><strong>Droit européen</strong> (RGPD, directives e-commerce)</li>
              <li><strong>Conventions internationales</strong> applicables</li>
            </ul>
            <p>En cas de litige, les tribunaux compétents sont ceux de <strong>Malte</strong>, sauf dispositions contraires pour les consommateurs européens.</p>
          `,
        },
        contact_disputes: {
          title: "9. Réclamations et litiges",
          content: `
            <p>Pour toute réclamation ou question :</p>
            <ul>
              <li><strong>Contact direct :</strong> legal@oppsys.io</li>
              <li><strong>Médiation :</strong> Plateforme européenne de résolution des litiges en ligne</li>
              <li><strong>Autorité de régulation :</strong> Malta Communications Authority (pour les questions techniques)</li>
              <li><strong>Protection des données :</strong> Information and Data Protection Commissioner (IDPC) - Malte</li>
            </ul>
          `,
        },
      },
    },
    en: {
      title: "Legal Notice",
      lastUpdate: "Last updated: April 16, 2025",
      back: "Home",
      sections: {
        identification: {
          title: "1. Publisher identification",
          content: `
            <p><strong>Company:</strong> Oppsys (in process of creation)<br />
            <strong>Legal form:</strong> Maltese company<br />
            <strong>Registered office:</strong> Malta (final address being finalized)<br />
            <strong>Registration number:</strong> [Being obtained]<br />
            <strong>Publication director:</strong> [To be specified]<br />
            <strong>Share capital:</strong> [To be determined]</p>
            <p><em>Note: As the company is being created under Maltese law, definitive information will be updated upon finalization of registration.</em></p>
          `,
        },
        contact: {
          title: "2. Contact details",
          content: `
            <p><strong>Email:</strong> contact@oppsys.io<br />
            <strong>Technical support:</strong> support@oppsys.io<br />
            <strong>Legal questions:</strong> legal@oppsys.io<br />
            <strong>Website:</strong> https://oppsys.io<br />
            <strong>Application:</strong> https://app.oppsys.io</p>
          `,
        },
        hosting: {
          title: "3. Hosting",
          content: `
            <p><strong>Host:</strong> [To be specified according to your choice]<br />
            Possible examples:<br />
            - <strong>Vercel Inc.</strong> (340 S Lemon Ave #4133, Walnut, CA 91789, USA)<br />
            - <strong>Netlify Inc.</strong> (44 Montgomery St Suite 300, San Francisco, CA 94104, USA)<br />
            - <strong>Amazon Web Services EMEA SARL</strong> (38 Avenue John F. Kennedy, L-1855 Luxembourg)</p>
            <p>Cloud infrastructure compliant with European data protection standards (GDPR).</p>
          `,
        },
        intellectual_property: {
          title: "4. Intellectual property",
          content: `
            <p>The website <strong>https://oppsys.io</strong> and the application <strong>https://app.oppsys.io</strong>, as well as all their content (texts, images, graphics, logo, user interface, AI algorithms) are the exclusive property of <strong>Oppsys</strong>.</p>
            <p>These elements are protected by:</p>
            <ul>
              <li>European and Maltese copyright</li>
              <li>Trademark rights (filing in progress)</li>
              <li>Database rights</li>
              <li>Trade secrets relating to AI algorithms</li>
            </ul>
            <p>Any reproduction, representation, modification or adaptation without express authorization is prohibited and constitutes counterfeiting.</p>
          `,
        },
        liability: {
          title: "5. Disclaimer",
          content: `
            <p><strong>Oppsys</strong> makes every effort to provide accurate information and quality services. However, it cannot guarantee:</p>
            <ul>
              <li>The accuracy, completeness or timeliness of published information</li>
              <li>Uninterrupted operation of AI services</li>
              <li>The absence of technical errors or bugs</li>
              <li>Compatibility with all technical environments</li>
            </ul>
            <p>Use of services is at the user's own risk. Oppsys cannot be held responsible for direct or indirect damages resulting from the use of the site or application.</p>
          `,
        },
        data_protection: {
          title: "6. Personal data protection",
          content: `
            <p>In accordance with the <strong>General Data Protection Regulation (GDPR)</strong> and Maltese legislation:</p>
            <ul>
              <li>Personal data is processed lawfully, fairly and transparently</li>
              <li>It is collected for specific and legitimate purposes</li>
              <li>It is stored securely</li>
              <li>Users have rights (access, rectification, erasure, etc.)</li>
            </ul>
            <p>For more details, see our <a href="/legal/privacy" class="text-orange-600 hover:text-orange-700 underline">Privacy Policy</a>.</p>
          `,
        },
        cookies: {
          title: "7. Cookie policy",
          content: `
            <p>The site uses cookies for:</p>
            <ul>
              <li><strong>Essential cookies:</strong> authentication, security, session preferences</li>
              <li><strong>Analytics cookies:</strong> anonymized audience measurement</li>
              <li><strong>Functional cookies:</strong> memorizing user preferences</li>
            </ul>
            <p>You can configure your cookie preferences via your browser. Refusing essential cookies may limit certain functionalities.</p>
          `,
        },
        applicable_law: {
          title: "8. Applicable law",
          content: `
            <p>These legal notices are governed by:</p>
            <ul>
              <li><strong>Maltese law</strong> (company law)</li>
              <li><strong>European law</strong> (GDPR, e-commerce directives)</li>
              <li><strong>Applicable international conventions</strong></li>
            </ul>
            <p>In case of dispute, the competent courts are those of <strong>Malta</strong>, except for contrary provisions for European consumers.</p>
          `,
        },
        contact_disputes: {
          title: "9. Complaints and disputes",
          content: `
            <p>For any complaint or question:</p>
            <ul>
              <li><strong>Direct contact:</strong> legal@oppsys.io</li>
              <li><strong>Mediation:</strong> European online dispute resolution platform</li>
              <li><strong>Regulatory authority:</strong> Malta Communications Authority (for technical questions)</li>
              <li><strong>Data protection:</strong> Information and Data Protection Commissioner (IDPC) - Malta</li>
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
          {Object.entries(t.sections).map(([key, section]) => (
            <section key={key} className="mb-8">
              <h2 className="text-2xl font-semibold text-orange-600 mb-4 pb-2 border-b border-gray-200">
                {section.title}
              </h2>
              <div className="text-gray-700 leading-relaxed">
                <div dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            </section>
          ))}
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
