// apps/website/src/components/marketing/FeaturesSection.tsx
import Link from "next/link";
import { PenTool, Share2, Mic, FileText, ArrowRight } from "lucide-react";

const features = [
  {
    title: "Rédaction assistée par IA",
    description:
      "Créez des contenus professionnels en quelques secondes : articles, newsletters, descriptions produits, scripts vidéo, et plus encore. Optimisé SEO, ton personnalisable, prêt à publier.",
    icon: PenTool,
    color: "text-blue-600 bg-blue-50",
  },
  {
    title: "Gestion des réseaux sociaux",
    description:
      "Centralisez vos publications, planifiez vos posts avec un calendrier intelligent et analysez vos performances. Recommandations d'horaires et hashtags inclus.",
    icon: Share2,
    color: "text-green-600 bg-green-50",
  },
  {
    title: "Transcription intelligente",
    description:
      "Transformez vos fichiers audio et vidéo en texte exploitable. Transcription multilingue, détection de locuteurs et résumés automatiques intégrés.",
    icon: Mic,
    color: "text-purple-600 bg-purple-50",
  },
  {
    title: "Génération d'articles de blog",
    description:
      "Rédigez des articles captivants et bien structurés en quelques clics. Intégration de mots-clés, mise en page automatique et optimisation SEO native.",
    icon: FileText,
    color: "text-red-600 bg-red-50",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Pourquoi choisir Oppsys ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Une suite complète d'outils d'IA pour automatiser vos tâches et
            booster votre productivité
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* ✅ NOUVEAU: CTA vers le catalogue */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Explorez tous nos outils d'IA
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Découvrez notre catalogue complet avec plus de 20 workers
              spécialisés pour chaque besoin : création de contenu, réseaux
              sociaux, transcription et bien plus.
            </p>
            <Link
              href="/catalogue"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Voir le catalogue complet</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                20+ outils disponibles
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                Nouveautés chaque mois
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                Essai gratuit
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
