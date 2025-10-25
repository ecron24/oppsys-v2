import { UserInContextSchema } from "src/lib/get-user-in-context";
import { buildUseCase } from "src/lib/use-case-builder";
import z from "zod";

const GetPermissionsInput = z.object({
  user: UserInContextSchema,
});

export const getPermissionsUseCase = buildUseCase()
  .input(GetPermissionsInput)
  .handle(async (ctx, input) => {
    const result = await ctx.profileRepo.getByIdWithPlan(input.user.id);

    if (!result.success) return result;

    const planName = result.data.plans?.name?.toLowerCase() || "free";

    // Niveaux d'accès simplifiés basés sur le nom
    const isAtLeastSolo = ["solo", "standard", "premium"].includes(planName);
    const isAtLeastStandard = ["standard", "premium"].includes(planName);
    const isPremium = planName === "premium";

    // Définition des permissions
    const permissions = {
      // Informations sur le plan pour l'affichage
      currentPlan: planName,
      isPremium,
      isFree: !isAtLeastSolo,

      // ✅ Media (corrigé)
      media: {
        canUploadAdvanced: isAtLeastSolo,
        canUseAIGeneration: isAtLeastStandard,
        maxImages: isPremium
          ? 10
          : isAtLeastStandard
            ? 8
            : isAtLeastSolo
              ? 5
              : 1,
        maxVideoSize: isPremium
          ? 500
          : isAtLeastStandard
            ? 250
            : isAtLeastSolo
              ? 100
              : 50,
      },

      // Planification
      scheduling: {
        canSchedule: isAtLeastStandard,
        canBulkSchedule: isPremium,
        canOptimalTiming: isPremium,
      },

      // Accès aux fonctionnalités
      featureAccess: {
        canAccessAnalytics: isAtLeastStandard,
        canUseTeamFeatures: isPremium,
        canExportData: isAtLeastSolo,
      },

      // Support
      supportLevel: {
        hasPrioritySupport: isPremium,
      },

      // Templates
      templates: {
        canSelectTemplates: isAtLeastSolo, // Solo, Standard, Premium
        canUploadCustom: isAtLeastStandard, // Standard, Premium
        canAccessPremiumTemplates: isPremium, // Premium seulement
      },

      // Formation
      formation: {
        canAccessIntermediateLevel: isAtLeastSolo, // Niveau intermédiaire
        canAccessAdvancedLevel: isPremium, // Niveau avancé
        canAccessAudioFormat: isAtLeastSolo, // Format podcast/audio
        canAccessVideoFormat: isAtLeastStandard, // Format vidéo
        canDownloadOffline: isPremium, // Téléchargement hors ligne
      },

      // ✅ AJOUTS pour les nouveaux modules
      analytics: {
        canAccessAdvanced: isAtLeastStandard,
        canExportReports: isAtLeastSolo,
        canUseRealTime: isPremium,
      },

      competitors: {
        canMonitorCompetitors: isAtLeastSolo,
        canAccessAdvancedMetrics: isAtLeastStandard,
        canUsePredictiveAnalysis: isPremium,
      },

      hr: {
        canAnalyzeTalents: isAtLeastSolo,
        canUsePredictiveHR: isPremium,
        canAccessBiasDetection: isAtLeastStandard,
      },

      leads: {
        canGenerateLeads: isAtLeastSolo,
        canUseAdvancedFilters: isAtLeastStandard,
        canAccessEnrichment: isPremium,
      },
    };

    return { success: true, data: permissions } as const;
  });
