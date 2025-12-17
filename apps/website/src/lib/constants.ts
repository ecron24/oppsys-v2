// apps/website/src/lib/constants.ts
export const SITE_CONFIG = {
  name: "Oppsys",
  description:
    "Automatisez vos tâches et boostez votre productivité avec nos workers IA intelligents.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://oppsys.io",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://app.oppsys.io",
  adminUrl: process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.oppsys.io",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "https://api.oppsys.io",
  links: {
    twitter: "https://twitter.com/oppsys",
    linkedin: "https://linkedin.com/company/oppsys",
    github: "https://github.com/oppsys",
  },
};

export const NAVIGATION_ITEMS = [
  { name: "Accueil", href: "/" },
  { name: "Fonctionnalités", href: "/#features" },
  { name: "Tarifs", href: "/pricing" },
  { name: "Contact", href: "/contact" },
];
