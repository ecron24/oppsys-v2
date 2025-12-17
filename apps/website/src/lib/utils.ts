// apps/website/src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Type Feature pour les plans
export interface Feature {
  text: string;
  included: boolean;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number | string): string {
  if (typeof price === "string") return price;
  if (price === 0) return "Gratuit";
  return `${price}€`;
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function getFeaturesByPlanType(planType: string): Feature[] {
  switch (planType) {
    case "free":
      return [
        { text: "5 utilisations worker IA", included: true },
        { text: "Accès limité aux workers IA", included: true },
        { text: "Assistance par email", included: false },
        { text: "Accès à la communauté", included: true },
        { text: "Analyses avancées", included: false },
        { text: "Personnalisation des modèles IA", included: false },
        { text: "Assistance prioritaire", included: false },
      ];
    case "solo":
      return [
        { text: "15 utilisations worker IA", included: true },
        { text: "Accès aux workers IA", included: true },
        { text: "Assistance par email", included: true },
        { text: "Accès à la communauté", included: true },
        { text: "Analyses avancées", included: false },
        { text: "Personnalisation des modèles IA", included: false },
        { text: "Assistance prioritaire", included: false },
      ];
    case "standard":
      return [
        { text: "25 utilisations worker IA", included: true },
        { text: "Accès à tous les workers IA", included: true },
        { text: "Assistance par email et chat", included: true },
        { text: "Accès à la communauté", included: true },
        { text: "Analyses avancées", included: true },
        { text: "Personnalisation des modèles IA", included: false },
        { text: "Assistance prioritaire", included: false },
      ];
    case "premium":
      return [
        { text: "Projets illimités", included: true },
        { text: "Accès à tous les workers IA", included: true },
        { text: "Assistance par email, chat et téléphone", included: true },
        { text: "Accès à la communauté", included: true },
        { text: "Analyses avancées", included: true },
        { text: "Personnalisation des modèles IA", included: true },
        { text: "Assistance prioritaire", included: true },
      ];
    case "entreprise":
    default:
      return [
        { text: "Team entreprise", included: true },
        { text: "Projets illimités", included: true },
        { text: "Accès à tous les workers IA", included: true },
        { text: "Assistance dédiée 24/7", included: true },
        { text: "Accès à la communauté", included: true },
        { text: "Analyses avancées", included: true },
        { text: "Personnalisation des modèles IA", included: true },
        { text: "Assistance prioritaire", included: true },
        { text: "Serveurs dédiés", included: true },
        { text: "Formation sur mesure", included: true },
      ];
  }
}
