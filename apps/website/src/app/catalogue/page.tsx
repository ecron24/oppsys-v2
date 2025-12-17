// apps/website/src/app/catalogue/page.tsx
import { Metadata } from "next";
import { CatalogSection } from "../../components/marketing/CatalogSection";

export const metadata: Metadata = {
  title:
    "Catalogue des Workers IA - OppSys | +30 Outils d'Intelligence Artificielle",
  description:
    "Découvrez notre collection complète d'outils IA : analyse concurrentielle, SEO + GEO, traduction, email marketing, RH, analytics. Automatisez vos tâches avec l'IA conversationnelle.",
  keywords: [
    "IA",
    "automatisation",
    "outils",
    "workers",
    "intelligence artificielle",
    "productivité",
    "analyse concurrentielle",
    "SEO",
    "GEO",
    "traduction",
    "email marketing",
    "RH",
    "recrutement",
    "analytics",
    "données",
    "création contenu",
    "réseaux sociaux",
  ].join(", "),
  openGraph: {
    title: "Catalogue des Workers IA - OppSys | +30 Outils d'IA",
    description:
      "Plus de 30 outils d'IA pour automatiser vos tâches : analyse, marketing, contenu, SEO, RH, traduction...",
    type: "website",
    url: "https://oppsys.io/catalogue",
    images: [
      {
        url: "https://oppsys.io/images/catalogue-og.jpg",
        width: 1200,
        height: 630,
        alt: "Catalogue des Workers IA OppSys",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Catalogue des Workers IA - OppSys",
    description: "+30 outils d'IA pour automatiser vos tâches quotidiennes",
    images: ["https://oppsys.io/images/catalogue-twitter.jpg"],
  },
  alternates: {
    canonical: "https://oppsys.io/catalogue",
  },
};

export default function CataloguePage() {
  return (
    <>
      {/* ✅ JSON-LD Schema étendu */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Catalogue des Workers IA",
            description:
              "Collection complète d'outils d'intelligence artificielle pour automatiser vos tâches",
            url: "https://oppsys.io/catalogue",
            mainEntity: {
              "@type": "ItemList",
              name: "Outils IA disponibles",
              numberOfItems: 30,
              itemListElement: [
                {
                  "@type": "SoftwareApplication",
                  name: "Analyse Concurrentielle",
                  description:
                    "Analysez vos concurrents avec surveillance continue",
                  applicationCategory: "BusinessApplication",
                },
                {
                  "@type": "SoftwareApplication",
                  name: "SEO + GEO Analyzer",
                  description:
                    "Optimisation SEO traditionnelle et pour IA génératives",
                  applicationCategory: "BusinessApplication",
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Talent Analyzer",
                  description: "IA RH pour screening et matching de talents",
                  applicationCategory: "BusinessApplication",
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Email Campaign",
                  description: "Campagnes email avec IA conversationnelle",
                  applicationCategory: "BusinessApplication",
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Content Translator",
                  description:
                    "Traduction dans +20 langues avec adaptation culturelle",
                  applicationCategory: "BusinessApplication",
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Data Analyzer",
                  description: "Analyse de données avec Machine Learning",
                  applicationCategory: "BusinessApplication",
                },
              ],
            },
          }),
        }}
      />
      <CatalogSection />
    </>
  );
}
