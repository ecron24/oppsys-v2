import { routes } from "@/routes";
import { H1, H2, H3, P } from "@oppsys/ui/components/typography";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  Lock,
  Eye,
  Trash2,
  Clock,
} from "lucide-react";
import { Link } from "react-router";

export default function GoogleDataPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-orange-600 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            to={routes.profile.index()}
            className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au profil
          </Link>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <H1 className="text-3xl font-bold">
                Politique d'utilisation des données Google
              </H1>
              <P className="text-white/80 mt-2">
                Dernière mise à jour : {new Date().toLocaleDateString("fr-FR")}
              </P>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="prose prose-lg max-w-none">
          {/* Section 1 */}
          <section className="mb-12">
            <H2 className="text-2xl font-bold text-foreground mb-4 flex items-center space-x-2">
              <Eye className="h-6 w-6 text-primary" />
              <span>1. Données collectées</span>
            </H2>
            <P className="text-muted-foreground mb-6">
              Oppsys accède aux services Google suivants uniquement avec votre
              autorisation explicite :
            </P>

            <div className="space-y-6">
              {[
                {
                  title: "Google Calendar",
                  access:
                    "Lecture, création, modification et suppression d'événements",
                  usage:
                    "Planification automatique de vos publications et synchronisation de vos tâches",
                },
                {
                  title: "Gmail",
                  access: "Envoi d'emails depuis votre compte",
                  usage:
                    "Vous transmettre les documents générés par notre IA directement par email",
                },
                {
                  title: "Google Drive",
                  access: "Lecture et écriture de documents",
                  usage:
                    "Import de vos documents pour personnalisation, export de contenus générés, stockage de modèles et utilisation de vos documents comme sources de connaissance (RAG)",
                },
                {
                  title: "Google Sheets",
                  access: "Lecture et écriture de feuilles de calcul",
                  usage:
                    "Planification de publications via vos feuilles de calcul, export de calendriers éditoriaux, gestion automatisée de vos posts",
                },
              ].map((service, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <H3 className="font-semibold text-foreground mb-2">
                    {service.title}
                  </H3>
                  <P className="text-sm text-muted-foreground mb-2">
                    <strong>Accès :</strong> {service.access}
                  </P>
                  <P className="text-sm text-muted-foreground">
                    <strong>Utilisation :</strong> {service.usage}
                  </P>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2 */}
          <section className="mb-12">
            <H2 className="text-2xl font-bold text-foreground mb-4 flex items-center space-x-2">
              <Lock className="h-6 w-6 text-primary" />
              <span>2. Comment nous utilisons vos données</span>
            </H2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <ul className="space-y-3 text-sm text-green-900">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Accès exclusif :</strong> Vous seul avez accès à vos
                    données Google via Oppsys
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Aucun partage :</strong> Nous ne partageons jamais
                    vos données Google avec des tiers
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Aucun entraînement IA :</strong> Vos données Google
                    ne sont JAMAIS utilisées pour entraîner nos modèles d'IA
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Traitement en temps réel :</strong> Les actions sont
                    effectuées instantanément, sans stockage permanent du
                    contenu
                  </span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section className="mb-12">
            <H2 className="text-2xl font-bold text-foreground mb-4 flex items-center space-x-2">
              <Clock className="h-6 w-6 text-primary" />
              <span>3. Stockage et sécurité</span>
            </H2>

            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <H3 className="font-semibold text-foreground mb-2">
                  Tokens OAuth
                </H3>
                <P className="text-sm text-muted-foreground">
                  Stockés de manière sécurisée dans notre base de données
                  (Supabase) avec chiffrement
                </P>
              </div>

              <div>
                <H3 className="font-semibold text-foreground mb-2">
                  Durée de conservation
                </H3>
                <P className="text-sm text-muted-foreground">
                  Tokens conservés uniquement pendant la durée de votre
                  abonnement
                </P>
              </div>

              <div>
                <H3 className="font-semibold text-foreground mb-2">
                  Suppression automatique
                </H3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>
                    • À la désinscription : suppression dans un délai d'un an
                    (conforme RGPD)
                  </li>
                  <li>• Sur demande explicite : suppression immédiate</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="mb-12">
            <H2 className="text-2xl font-bold text-foreground mb-4 flex items-center space-x-2">
              <Trash2 className="h-6 w-6 text-primary" />
              <span>4. Vos droits</span>
            </H2>

            <P className="text-muted-foreground mb-4">
              Conformément au RGPD, vous disposez des droits suivants :
            </P>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Droit d'accès",
                  desc: "Consulter les données que nous détenons",
                },
                {
                  title: "Droit de rectification",
                  desc: "Modifier vos informations",
                },
                {
                  title: "Droit à l'effacement",
                  desc: "Supprimer définitivement vos données",
                },
                {
                  title: "Droit de révocation",
                  desc: "Déconnecter votre compte Google à tout moment",
                },
              ].map((right, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg p-4"
                >
                  <H3 className="font-semibold text-foreground mb-1">
                    {right.title}
                  </H3>
                  <p className="text-sm text-muted-foreground">{right.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 5 */}
          <section className="mb-12">
            <H2 className="text-2xl font-bold text-foreground mb-4">
              5. Révocation des accès
            </H2>

            <P className="text-muted-foreground mb-4">
              Vous pouvez à tout moment :
            </P>

            <ul className="space-y-2 text-muted-foreground">
              <li>
                • Révoquer l'accès depuis votre compte Oppsys (Paramètres →
                Réseaux Sociaux)
              </li>
              <li>
                • Révoquer l'accès depuis votre compte Google :{" "}
                <a
                  href="https://myaccount.google.com/permissions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  myaccount.google.com/permissions
                </a>
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="mb-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <H2 className="text-2xl font-bold text-blue-900 mb-4">
              6. Conformité Google API Services
            </H2>

            <P className="text-sm text-blue-800 mb-4">
              Cette application respecte les{" "}
              <a
                href="https://developers.google.com/terms/api-services-user-data-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Google API Services User Data Policy
              </a>
              , notamment :
            </P>

            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Limitation de l'utilisation aux seuls usages divulgués</li>
              <li>
                • Interdiction de transfert à des tiers sans consentement
                explicite
              </li>
              <li>• Interdiction d'usage pour de la publicité ciblée</li>
            </ul>
          </section>

          {/* Section 7 - Contact */}
          <section className="bg-card border border-border rounded-lg p-6">
            <H2 className="text-2xl font-bold text-foreground mb-4">
              7. Contact
            </H2>

            <P className="text-muted-foreground mb-4">
              Pour toute question concernant l'utilisation de vos données Google
              :
            </P>

            <ul className="space-y-2 text-muted-foreground">
              <li>
                • Email :{" "}
                <a
                  href="mailto:privacy@oppsys.io"
                  className="text-primary hover:underline"
                >
                  privacy@oppsys.io
                </a>
              </li>
              <li>
                • Page de contact :{" "}
                <a
                  href="https://oppsys.io/contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  oppsys.io/contact
                </a>
              </li>
            </ul>
          </section>

          {/* Footer important */}
          <div className="mt-12 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <P className="text-sm text-amber-900 font-medium">
              <strong>Important :</strong> En connectant votre compte Google,
              vous acceptez cette politique d'utilisation des données.
            </P>
          </div>
        </div>
      </div>
    </div>
  );
}
