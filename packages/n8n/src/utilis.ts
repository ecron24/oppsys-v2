import type { N8nInput, N8nModule, N8nResult } from "./n8n-type";

export function extractMessageFromN8n(result: N8nResult) {
  let extractedMessage = "";

  if (result.module_type == "ai-writer") {
    return result.output.question;
  }

  if (result.module_type == "document-generator") {
    return "Document generated";
  }

  if (result.module_type == "social-factory") {
    return "Post generated";
  }

  if (result) {
    if (
      result.output &&
      typeof result.output === "string" &&
      result.output.trim()
    ) {
      extractedMessage = result.output.trim();
    } else if (
      result.response &&
      typeof result.response === "string" &&
      result.response.trim()
    ) {
      extractedMessage = result.response.trim();
    } else if (
      result.message &&
      typeof result.message === "string" &&
      result.message.trim()
    ) {
      extractedMessage = result.message.trim();
    } else if (result.data && typeof result.data === "object") {
      if (result.data.output && typeof result.data.output === "string") {
        extractedMessage = result.data.output.trim();
      } else if (
        result.data.message &&
        typeof result.data.message === "string"
      ) {
        extractedMessage = result.data.message.trim();
      } else if (
        result.data.response &&
        typeof result.data.response === "string"
      ) {
        extractedMessage = result.data.response.trim();
      }
    } else if (Array.isArray(result) && result.length > 0 && result[0]) {
      const firstItem = result[0];
      if (firstItem.output) extractedMessage = firstItem.output;
      else if (firstItem.message) extractedMessage = firstItem.message;
      else if (firstItem.response) extractedMessage = firstItem.response;
    } else {
      console.log("❌ AUCUNE SOURCE DE MESSAGE TROUVÉE");
      console.log(
        "🔍 Structure complète result:",
        JSON.stringify(result, null, 2)
      );
    }
  } else {
    console.log("❌ Result est null/undefined");
  }

  return extractedMessage;
}

export const buildChatInput = ({ input, module, user }: BuildChatInput) => {
  const baseInput = {
    module_slug: module.slug,
    module_name: module.name,
    module_id: module.id,
  };

  switch (module.slug) {
    case "social-factory":
      return {
        ...baseInput,
        networks: input.networks || [],
        postType: input.postType || "text",
        contentStyle: input.contentStyle || "professional",
        objective: input.objective || "engagement",
        topic: input.topic || "",
        keywords: input.keywords || "",
        callToAction: input.callToAction || "",
        includeHashtags:
          input.includeHashtags !== undefined ? input.includeHashtags : true,
        includeEmojis:
          input.includeEmojis !== undefined ? input.includeEmojis : true,
        autoGenerateHashtags:
          input.autoGenerateHashtags !== undefined
            ? input.autoGenerateHashtags
            : true,
        mentions: input.mentions || "",
        addCTA: input.addCTA !== undefined ? input.addCTA : false,
        ctaType: input.ctaType || "",
        ctaUrl: input.ctaUrl || "",
        schedulePost:
          input.schedulePost !== undefined ? input.schedulePost : false,
        scheduledDate: input.scheduledDate || "",
        scheduledTime: input.scheduledTime || "",
        media: input.media || { imageCount: 0, hasVideo: false },
      };

    case "email-campaign":
      return {
        ...baseInput,
        campaign: input.campaign || {},
        audience: input.audience || {},
        content: input.content || {},
        ai: input.ai || null,
        scheduling: input.scheduling || {},
        testing: input.testing || {},
        tracking: input.tracking || {},
        integration: input.integration || null,
        userPlan: input.userPlan || "free",
        n8nSessionId: input.n8nSessionId || null,
        n8nContext: input.n8nContext || {},
      };

    case "article-writer":
      return {
        ...baseInput,
        // Structure basée sur buildFullContext() du frontend
        article: input.article || {
          title: input.title || "",
          description: input.description || "",
          contentType: input.contentType || "blog",
          tone: input.tone || "professional",
          length: input.length || 1000,
          language: input.language || "fr",
          seoLevel: input.seoLevel || "basic",
        },
        seo: input.seo || {
          targetKeywords: input.targetKeywords || "",
          audience: input.audience || "",
          seoOptimize: input.seoOptimize || false,
          customOutline: input.customOutline || "",
        },
        options: input.options || {
          includeIntro:
            input.includeIntro !== undefined ? input.includeIntro : true,
          includeConclusion:
            input.includeConclusion !== undefined
              ? input.includeConclusion
              : true,
          includeCallToAction: input.includeCallToAction || false,
          includeImages: input.includeImages || false,
          includeFAQ: input.includeFAQ || false,
          ragDocuments: input.ragDocuments || [],
        },
        user: input.user || {
          plan: user.plan,
          isPremium: user.isPremium,
          balance: user.balance || 0,
        },
        conversation: input.conversation || {
          currentStep: input.currentStep || 0,
          isComplete: input.currentStep === 999,
          hasPreConfig: !!(
            input.title ||
            input.description ||
            input.targetKeywords ||
            input.audience
          ),
        },
        metadata: input.metadata || {
          sessionId: input.sessionId,
          timestamp: new Date().toISOString(),
          moduleType: "article-writer",
          currentCost: input.currentCost || 0,
          n8nWebhookUrl: module.endpoint,
        },
        // Support pour l'ancien format si nécessaire
        chatContext: input.chatContext || null,
        n8nWebhookUrl: input.n8nWebhookUrl || module.endpoint,
        // Données brutes pour compatibilité
        title: input.title || "",
        description: input.description || "",
        contentType: input.contentType || "blog",
        tone: input.tone || "professional",
        length: input.length || 1000,
        targetKeywords: input.targetKeywords || "",
        audience: input.audience || "",
        seoLevel: input.seoLevel || "basic",
        language: input.language || "fr",
      };

    default:
      return {
        ...baseInput,
        ...input,
      };
  }
};
type BuildChatInput = {
  module: N8nModule;
  input: N8nInput;
  user: {
    plan: string;
    isPremium: boolean | "";
    balance: number;
  };
};
