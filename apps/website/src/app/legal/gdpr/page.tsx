/* eslint-disable react/no-unescaped-entities */ "use client";

import { useState } from "react";
import Link from "next/link";

export default function GDPRPage() {
  const [language, setLanguage] = useState("fr");

  const content = {
    fr: {
      title: "RGPD - Gestion des Données Personnelles",
      lastUpdate: "Dernière mise à jour : 16 avril 2025",
      back: "Accueil",
      sections: {
        intro: {
          title: "Vos droits sous le RGPD",
          content:
            "En tant qu'utilisateur d'<strong>Oppsys</strong>, vous bénéficiez de droits étendus sur vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) européen et à la législation maltaise. Cette page détaille vos droits et les modalités pour les exercer.",
        },
        rights_detail: {
          title: "Détail de vos droits",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📋 1. Droit d'accès (Art. 15 RGPD)</h3>
            <p><strong>Ce que vous pouvez demander :</strong></p>
            <ul>
              <li>Confirmation que nous traitons vos données personnelles</li>
              <li>Accès à vos données personnelles</li>
              <li>Informations sur les finalités du traitement</li>
              <li>Catégories de données traitées</li>
              <li>Destinataires de vos données</li>
              <li>Durée de conservation prévue</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Délai de réponse : 1 mois maximum</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">✏️ 2. Droit de rectification (Art. 16 RGPD)</h3>
            <p><strong>Quand l'exercer :</strong></p>
            <ul>
              <li>Vos données sont inexactes</li>
              <li>Vos données sont incomplètes</li>
              <li>Changement de situation personnelle</li>
            </ul>
            <p><strong>Notre engagement :</strong> Correction sous 72h et notification aux tiers si nécessaire.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🗑️ 3. Droit à l'effacement - "Droit à l'oubli" (Art. 17 RGPD)</h3>
            <p><strong>Cas d'application :</strong></p>
            <ul>
              <li>Les données ne sont plus nécessaires</li>
              <li>Retrait du consentement</li>
              <li>Traitement illicite</li>
              <li>Obligation légale d'effacement</li>
            </ul>
            <p><strong>Exceptions :</strong> Liberté d'expression, conformité légale, intérêt public.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">⏸️ 4. Droit à la limitation du traitement (Art. 18 RGPD)</h3>
            <p><strong>Suspension temporaire du traitement dans les cas :</strong></p>
            <ul>
              <li>Contestation de l'exactitude des données</li>
              <li>Traitement illicite (alternative à l'effacement)</li>
              <li>Données nécessaires pour une réclamation juridique</li>
              <li>Opposition au traitement en attente de vérification</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📦 5. Droit à la portabilité (Art. 20 RGPD)</h3>
            <p><strong>Récupération de vos données :</strong></p>
            <ul>
              <li>Format structuré, couramment utilisé et lisible par machine</li>
              <li>Transmission directe à un autre responsable si possible</li>
              <li>Concerne uniquement les données fournies par vous</li>
            </ul>
            <p><strong>Formats proposés :</strong> JSON, CSV, XML selon le type de données.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🚫 6. Droit d'opposition (Art. 21 RGPD)</h3>
            <p><strong>Opposition possible pour :</strong></p>
            <ul>
              <li>Traitement fondé sur l'intérêt légitime</li>
              <li>Profilage basé sur l'intérêt légitime</li>
              <li>Prospection commerciale (opposition absolue)</li>
              <li>Recherche scientifique/statistique (sauf intérêt public)</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🔄 7. Retrait du consentement (Art. 7 RGPD)</h3>
            <p><strong>Modalités :</strong></p>
            <ul>
              <li>Aussi simple que de donner son consentement</li>
              <li>Effet immédiat (pas rétroactif)</li>
              <li>N'affecte pas la licéité des traitements antérieurs</li>
            </ul>
          `,
        },
        how_to_exercise: {
          title: "Comment exercer vos droits",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📧 Par email (recommandé)</h3>
            <p><strong>Adresse :</strong> <a href="mailto:dpo@oppsys.io" class="text-orange-600 hover:text-orange-700 underline">dpo@oppsys.io</a></p>
            <p><strong>Objet :</strong> "Exercice de mes droits RGPD - [Type de demande]"</p>
            <p><strong>Pièces à joindre :</strong></p>
            <ul>
              <li>Copie recto-verso de votre pièce d'identité</li>
              <li>Justificatif de votre adresse email (capture d'écran de votre compte)</li>
              <li>Description précise de votre demande</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">💬 Via l'interface utilisateur</h3>
            <p>Certains droits peuvent être exercés directement depuis votre compte :</p>
            <ul>
              <li><strong>Rectification :</strong> Paramètres → Profil → Modifier les informations</li>
              <li><strong>Téléchargement des données :</strong> Paramètres → Données → Exporter</li>
              <li><strong>Suppression du compte :</strong> Paramètres → Compte → Supprimer</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📮 Par courrier postal</h3>
            <p><strong>Adresse :</strong> [Adresse du siège social à Malte - à compléter]</p>
            <p><strong>À l'attention de :</strong> Délégué à la Protection des Données (DPO)</p>
          `,
        },
        processing_time: {
          title: "Délais de traitement",
          content: `
            <div class="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 mb-6">
              <p><strong>⏱️ Délai légal :</strong> 1 mois maximum à compter de la réception de votre demande</p>
              <p><strong>Extension possible :</strong> 2 mois supplémentaires si la demande est complexe</p>
            </div>
            <p><strong>Notre engagement :</strong></p>
            <ul>
              <li><strong>Accusé de réception :</strong> Sous 48h</li>
              <li><strong>Demandes simples :</strong> Traitées sous 5 jours ouvrés</li>
              <li><strong>Demandes complexes :</strong> Information sur les délais sous 1 semaine</li>
            </ul>
          `,
        },
        data_categories: {
          title: "Catégories de données traitées",
          content: `
            <p>Voici les principales catégories de données personnelles que nous sommes susceptibles de traiter :</p>
            <ul>
              <li><strong>Données d'identité :</strong> nom, prénom, adresse email</li>
              <li><strong>Données de connexion :</strong> identifiants, mots de passe hachés</li>
              <li><strong>Données techniques :</strong> adresse IP, navigateur, système d'exploitation</li>
              <li><strong>Données d'usage :</strong> interactions avec les agents IA, historique d'utilisation</li>
              <li><strong>Données de contenu :</strong> textes, fichiers créés via nos services</li>
              <li><strong>Données de préférences :</strong> paramètres personnalisés, favoris</li>
            </ul>
          `,
        },
        complaints: {
          title: "Réclamations et voies de recours",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🏛️ Autorités de contrôle</h3>
            <p><strong>Autorité principale (Malte) :</strong></p>
            <ul>
              <li><strong>Nom :</strong> Information and Data Protection Commissioner (IDPC)</li>
              <li><strong>Site web :</strong> <a href="https://idpc.org.mt" target="_blank" rel="noopener noreferrer" class="text-orange-600 hover:text-orange-700 underline">idpc.org.mt</a></li>
              <li><strong>Email :</strong> idpc.info@gov.mt</li>
            </ul>

            <p><strong>Autorité locale (France - si vous résidez en France) :</strong></p>
            <ul>
              <li><strong>Nom :</strong> Commission Nationale de l'Informatique et des Libertés (CNIL)</li>
              <li><strong>Site web :</strong> <a href="https://cnil.fr" target="_blank" rel="noopener noreferrer" class="text-orange-600 hover:text-orange-700 underline">cnil.fr</a></li>
              <li><strong>Téléphone :</strong> 01 53 73 22 22</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">⚖️ Recours judiciaire</h3>
            <p>Vous avez également le droit d'introduire un recours devant les tribunaux compétents, notamment pour obtenir réparation d'un préjudice matériel ou moral résultant d'une violation du RGPD.</p>
          `,
        },
      },
    },
    en: {
      title: "GDPR - Personal Data Management",
      lastUpdate: "Last updated: April 16, 2025",
      back: "Home",
      sections: {
        intro: {
          title: "Your rights under GDPR",
          content:
            "As a user of <strong>Oppsys</strong>, you benefit from extensive rights over your personal data in accordance with the European General Data Protection Regulation (GDPR) and Maltese legislation. This page details your rights and how to exercise them.",
        },
        rights_detail: {
          title: "Details of your rights",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📋 1. Right of access (Art. 15 GDPR)</h3>
            <p><strong>What you can request:</strong></p>
            <ul>
              <li>Confirmation that we process your personal data</li>
              <li>Access to your personal data</li>
              <li>Information on the purposes of processing</li>
              <li>Categories of data processed</li>
              <li>Recipients of your data</li>
              <li>Planned retention period</li>
            </ul>
            <p class="text-sm text-gray-600 italic">Response time: 1 month maximum</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">✏️ 2. Right of rectification (Art. 16 GDPR)</h3>
            <p><strong>When to exercise it:</strong></p>
            <ul>
              <li>Your data is inaccurate</li>
              <li>Your data is incomplete</li>
              <li>Change in personal situation</li>
            </ul>
            <p><strong>Our commitment:</strong> Correction within 72h and notification to third parties if necessary.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🗑️ 3. Right to erasure - "Right to be forgotten" (Art. 17 GDPR)</h3>
            <p><strong>Cases of application:</strong></p>
            <ul>
              <li>Data is no longer necessary</li>
              <li>Withdrawal of consent</li>
              <li>Unlawful processing</li>
              <li>Legal obligation to erase</li>
            </ul>
            <p><strong>Exceptions:</strong> Freedom of expression, legal compliance, public interest.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">⏸️ 4. Right to restriction of processing (Art. 18 GDPR)</h3>
            <p><strong>Temporary suspension of processing in cases of:</strong></p>
            <ul>
              <li>Contestation of data accuracy</li>
              <li>Unlawful processing (alternative to erasure)</li>
              <li>Data necessary for legal claim</li>
              <li>Opposition to processing pending verification</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📦 5. Right to data portability (Art. 20 GDPR)</h3>
            <p><strong>Retrieving your data:</strong></p>
            <ul>
              <li>Structured, commonly used and machine-readable format</li>
              <li>Direct transmission to another controller if possible</li>
              <li>Concerns only data provided by you</li>
            </ul>
            <p><strong>Formats offered:</strong> JSON, CSV, XML depending on data type.</p>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🚫 6. Right to object (Art. 21 GDPR)</h3>
            <p><strong>Opposition possible for:</strong></p>
            <ul>
              <li>Processing based on legitimate interest</li>
              <li>Profiling based on legitimate interest</li>
              <li>Commercial prospecting (absolute opposition)</li>
              <li>Scientific/statistical research (except public interest)</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🔄 7. Withdrawal of consent (Art. 7 GDPR)</h3>
            <p><strong>Modalities:</strong></p>
            <ul>
              <li>As simple as giving consent</li>
              <li>Immediate effect (not retroactive)</li>
              <li>Does not affect lawfulness of prior processing</li>
            </ul>
          `,
        },
        how_to_exercise: {
          title: "How to exercise your rights",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📧 By email (recommended)</h3>
            <p><strong>Address:</strong> <a href="mailto:dpo@oppsys.io" class="text-orange-600 hover:text-orange-700 underline">dpo@oppsys.io</a></p>
            <p><strong>Subject:</strong> "Exercise of my GDPR rights - [Type of request]"</p>
            <p><strong>Documents to attach:</strong></p>
            <ul>
              <li>Front and back copy of your ID</li>
              <li>Proof of your email address (screenshot of your account)</li>
              <li>Precise description of your request</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">💬 Via user interface</h3>
            <p>Some rights can be exercised directly from your account:</p>
            <ul>
              <li><strong>Rectification:</strong> Settings → Profile → Edit information</li>
              <li><strong>Data download:</strong> Settings → Data → Export</li>
              <li><strong>Account deletion:</strong> Settings → Account → Delete</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">📮 By postal mail</h3>
            <p><strong>Address:</strong> [Malta headquarters address - to be completed]</p>
            <p><strong>Attention:</strong> Data Protection Officer (DPO)</p>
          `,
        },
        processing_time: {
          title: "Processing times",
          content: `
            <div class="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500 mb-6">
              <p><strong>⏱️ Legal deadline:</strong> 1 month maximum from receipt of your request</p>
              <p><strong>Possible extension:</strong> 2 additional months if the request is complex</p>
            </div>
            <p><strong>Our commitment:</strong></p>
            <ul>
              <li><strong>Acknowledgment of receipt:</strong> Within 48h</li>
              <li><strong>Simple requests:</strong> Processed within 5 business days</li>
              <li><strong>Complex requests:</strong> Information on deadlines within 1 week</li>
            </ul>
          `,
        },
        data_categories: {
          title: "Categories of data processed",
          content: `
            <p>Here are the main categories of personal data we may process:</p>
            <ul>
              <li><strong>Identity data:</strong> first name, last name, email address</li>
              <li><strong>Connection data:</strong> identifiers, hashed passwords</li>
              <li><strong>Technical data:</strong> IP address, browser, operating system</li>
              <li><strong>Usage data:</strong> interactions with AI agents, usage history</li>
              <li><strong>Content data:</strong> texts, files created via our services</li>
              <li><strong>Preference data:</strong> personalized settings, favorites</li>
            </ul>
          `,
        },
        complaints: {
          title: "Complaints and remedies",
          content: `
            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">🏛️ Supervisory authorities</h3>
            <p><strong>Main authority (Malta):</strong></p>
            <ul>
              <li><strong>Name:</strong> Information and Data Protection Commissioner (IDPC)</li>
              <li><strong>Website:</strong> <a href="https://idpc.org.mt" target="_blank" rel="noopener noreferrer" class="text-orange-600 hover:text-orange-700 underline">idpc.org.mt</a></li>
              <li><strong>Email:</strong> idpc.info@gov.mt</li>
            </ul>

            <p><strong>Local authority (France - if you reside in France):</strong></p>
            <ul>
              <li><strong>Name:</strong> Commission Nationale de l'Informatique et des Libertés (CNIL)</li>
              <li><strong>Website:</strong> <a href="https://cnil.fr" target="_blank" rel="noopener noreferrer" class="text-orange-600 hover:text-orange-700 underline">cnil.fr</a></li>
              <li><strong>Phone:</strong> +33 1 53 73 22 22</li>
            </ul>

            <h3 class="text-lg font-semibold text-orange-600 mt-6 mb-3">⚖️ Judicial remedy</h3>
            <p>You also have the right to bring proceedings before the competent courts, particularly to obtain compensation for material or moral damage resulting from a GDPR violation.</p>
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
            🛡️ Exercer mes droits
          </h3>
          <p className="text-gray-600 mb-4">
            Vous souhaitez exercer l'un de vos droits RGPD ? Contactez notre
            délégué à la protection des données.
          </p>
          <a
            href="mailto:dpo@oppsys.io?subject=Exercice de mes droits RGPD"
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            Contacter le DPO
          </a>
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
