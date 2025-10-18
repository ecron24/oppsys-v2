import { buildUseCase } from "../../lib/use-case-builder";
import z from "zod";
import type { OppSysContext } from "../../get-context";
import { UserInContextSchema } from "src/lib/get-user-in-context";
import {
  InsufficientCreditError,
  PremiumOnlyError,
} from "src/modules/domain/exception";

export const GetFormationContentBody = z.object({
  formationId: z.uuid(),
  levelId: z.string(),
  formatId: z.string(),
});

export const GetFormationContentInputSchema = z.object({
  user: UserInContextSchema,
  body: GetFormationContentBody,
});

export type GetFormationContentInput = z.infer<
  typeof GetFormationContentInputSchema
>;

export const getFormationContentUseCase = buildUseCase()
  .input(GetFormationContentInputSchema)
  .handle(async (ctx: OppSysContext, input) => {
    const { formationId, levelId, formatId } = input.body;
    const { id: userId } = input.user;

    // 1. Get formation
    const formationResult = await ctx.formationRepo.getById(formationId);
    if (!formationResult.success) return formationResult;
    const formation = formationResult.data;

    // 2. Extract level and format config
    const levelConfig = formation.config.levels[levelId];
    const formatConfig = levelConfig?.formats[formatId];
    if (!levelConfig || !formatConfig) {
      return {
        success: false,
        kind: "CONTENT_NOT_FOUND",
        error: new Error("Content not found"),
      };
    }

    // 3. Check premium requirement
    if (formatConfig.premium) {
      const profileResult = await ctx.profileRepo.getByIdWithPlan(userId);
      if (!profileResult.success) return profileResult;
      const isPremium = ["solo", "standard", "premium"].includes(
        profileResult.data.plans?.name.toLocaleLowerCase() || "free"
      );
      if (!isPremium) {
        return {
          success: false,
          kind: "PREMIUM_REQUIRED",
          error: new PremiumOnlyError("Premium plan required"),
        };
      }
    }

    // 4.  Vérifier si déjà acheté
    const accessResult = await ctx.formationRepo.getFormationAccess({
      userId,
      formatId,
      formationId,
      levelId,
    });
    if (!accessResult.success) {
      if (accessResult.kind == "UNKNOWN_ERROR") return accessResult;

      // 5. Si pas acheté et coût > 0, procéder à l'achat
      if (formatConfig.cost > 0) {
        const creditCheckResult = await ctx.profileRepo.checkCredits(
          userId,
          formatConfig.cost
        );
        if (!creditCheckResult.success) return creditCheckResult;
        if (!creditCheckResult.data.hasEnoughCredits)
          return {
            success: false,
            kind: "INSUFFICIENT_CREDITS",
            error: new InsufficientCreditError({
              available: creditCheckResult.data.currentBalance,
              required: formatConfig.cost,
              shortfall: creditCheckResult.data.shortfall,
            }),
          };

        // Deduct credits
        const deductResult = await ctx.profileRepo.deductCredits(
          userId,
          formatConfig.cost
        );
        if (!deductResult.success) return deductResult;

        // Create access record
        await ctx.formationRepo.createAccess({
          userId,
          moduleId: formationId,
          levelId,
          formatId,
          filePath: formatConfig.source.path || "",
          creditsSpent: formatConfig.cost,
          metadata: {
            moduleName: formation.name,
            levelLabel: levelConfig.label || "unknown",
            formatLabel: formatConfig.label || "unknown",
          },
        });
      }
    }

    // 6. Generate response based on source type
    let responseData;
    switch (formatConfig.source.type) {
      case "supabase": {
        // TODO
        const signedUrlResult = await ctx.supabase.storage
          .from("formations")
          .createSignedUrl(formatConfig.source.path!, 3600); // 1 heure
        if (signedUrlResult.error) {
          return {
            success: false,
            kind: "UNKNOWN_ERROR",
            error: new Error("Failed to generate signed URL"),
          };
        }
        responseData = {
          type: "supabase_url" as const,
          url: signedUrlResult.data.signedUrl,
          expiresIn: 3600,
          filename: formatConfig.source.path!.split("/").pop(),
        };
        break;
      }
      case "vimeo":
        responseData = {
          type: "video" as const,
          platform: "vimeo" as const,
          id: formatConfig.source.id,
        };
        break;
      case "youtube":
        responseData = {
          type: "video" as const,
          platform: "youtube" as const,
          id: formatConfig.source.id,
        };
        break;
      default:
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Unsupported content type"),
        };
    }

    return {
      success: true,
      data: responseData,
    };
  });
