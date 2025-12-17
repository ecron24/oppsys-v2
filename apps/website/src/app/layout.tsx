// apps/website/src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/marketing/Navigation";
import { Footer } from "@/components/marketing/Footer";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap", // Performance optimisée
});

export const metadata: Metadata = {
  metadataBase: new URL("https://oppsys.io"),
  title: {
    default: "Oppsys - Automatisation et IA pour votre productivité",
    template: "%s | Oppsys",
  },
  description:
    "Boostez votre productivité avec les workers IA d'Oppsys. Automatisez vos tâches et générez du contenu professionnel.",
  keywords: [
    "IA",
    "automatisation",
    "productivité",
    "workers",
    "content generation",
  ],
  authors: [{ name: "Oppsys" }],
  creator: "Oppsys",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://oppsys.io",
    title: "Oppsys - Automatisation et IA",
    description: "Boostez votre productivité avec les workers IA d'Oppsys",
    siteName: "Oppsys",
    images: [
      {
        url: "/logo-oppsys-192.png",
        width: 192,
        height: 192,
        alt: "Logo Oppsys",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "Oppsys - Automatisation et IA",
    description: "Boostez votre productivité avec les workers IA d'Oppsys",
    creator: "@oppsys",
    images: ["/logo-oppsys-192.png"],
  },

  // SEO et robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icônes
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-oppsys-192.png",
  },

  // Données structurées JSON-LD
  other: {
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Oppsys",
      description:
        "Boostez votre productivité avec l'IA d'Oppsys. Automatisez vos tâches, générez du contenu percutant et professionnalisez votre communication digitale.",
      url: "https://oppsys.io",
      applicationCategory: "ProductivityApplication",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        url: "https://oppsys.io/pricing",
      },
      author: {
        "@type": "Organization",
        name: "Oppsys",
      },
    }),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        {/* Theme color pour les navigateurs mobiles */}
        <meta name="theme-color" content="#F97316" />
        <meta name="msapplication-TileColor" content="#F97316" />

        {/* Préconnexions pour la performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <noscript>
          <div
            style={{
              textAlign: "center",
              padding: "20px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              margin: "20px",
            }}
          >
            <h1 style={{ color: "#dc2626", marginBottom: "10px" }}>
              JavaScript est requis
            </h1>
            <p style={{ color: "#7f1d1d" }}>
              Veuillez activer JavaScript pour utiliser Oppsys.{" "}
              <a
                href="https://enable-javascript.com/fr/"
                style={{ color: "#dc2626", textDecoration: "underline" }}
              >
                Instructions ici
              </a>
              .
            </p>
          </div>
        </noscript>

        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
