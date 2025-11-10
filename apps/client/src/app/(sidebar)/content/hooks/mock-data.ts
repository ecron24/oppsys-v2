import type { Content } from "../types";

export const mockContents: Content[] = [
  {
    id: "c1",
    userId: "u1",
    type: "social-post",
    title: "Promotion Nouvel Atelier",
    moduleSlug: "social-post-generator",
    metadata: {
      targetPlatform: "instagram",
      caption: "Rejoignez-nous pour notre atelier ! 🎨✨",
      hashtags: ["#art", "#atelier", "#creativité"],
      generatedContent: {
        caption: "Découvrez votre créativité à notre atelier ce samedi ✨",
        emojis: "🎨✨",
      },
    },
    createdAt: "2025-01-10T12:00:00Z",
    status: "draft",
  },
  {
    id: "c2",
    userId: "u1",
    type: "blog-post",
    title: "Comment améliorer sa présence sur LinkedIn",
    moduleSlug: "content-writer",
    metadata: {
      content: "Voici comment optimiser votre profil LinkedIn...",
      generatedContent: {
        content: "Pour améliorer ta présence sur LinkedIn, commence par...",
      },
    },
    createdAt: "2025-01-11T09:30:00Z",
    status: "published",
    tags: ["marketing", "personal-branding"],
  },
  {
    id: "c3",
    userId: "u2",
    type: "lease-contract",
    title: "Contrat de Location - Appartement Centre Ville",
    moduleSlug: "real-estate-lease",
    metadata: {
      leaseType: "rent",
      propertyInfo: {
        address: "12 Rue de la Paix",
        rent: "850€ / mois",
        deposit: "850€",
      },
      ownerInfo: { name: "Jean Dupont", email: "jean@example.com" },
      tenantInfo: { name: "Marie Claire", email: "marie@example.com" },
      leaseInfo: { duration: "12 mois", startDate: "2025-02-01" },
    },
    createdAt: "2025-01-12T18:12:00Z",
    status: "approved",
  },
  {
    id: "c4",
    userId: "u3",
    type: "email-template",
    title: "Relance Client Devis",
    moduleSlug: "email-generator",
    metadata: {
      callToAction: "Merci de nous confirmer votre décision.",
      generatedContent: {
        content:
          "Bonjour, nous revenons vers vous concernant le devis envoyé...",
      },
    },
    createdAt: "2025-01-13T07:44:00Z",
    status: "sent",
  },
  {
    id: "c5",
    userId: "u1",
    type: "ai-workflow",
    title: "Workflow Génération Carousel Instagram",
    moduleSlug: "n8n-carousel-creator",
    metadata: {
      workflowResult: {
        post: "Voici le contenu généré pour le carousel...",
      },
      networks: ["instagram", "facebook"],
      selectedNetworks: ["instagram"],
    },
    createdAt: "2025-01-14T11:22:00Z",
    status: "processing",
  },
  {
    id: "c6",
    userId: "u4",
    type: "ads-copy",
    title: "Copy Publicitaire Facebook - Offre Black Friday",
    moduleSlug: "ads-copy-generator",
    metadata: {
      targetPlatform: "facebook",
      generatedContent: {
        post: "🔥 Black Friday : Jusqu'à -70% sur toute la boutique !",
        callToAction: "Commandez maintenant 🚀",
      },
      emojis: ["🔥", "🚀"],
      hashtags: ["#BlackFriday", "#Promo", "#Deals"],
    },
    createdAt: "2025-01-15T13:52:00Z",
    status: "draft",
  },
];
