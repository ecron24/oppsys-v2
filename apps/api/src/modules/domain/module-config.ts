import { z } from "zod";

/* ----------------------------- Helpers ----------------------------- */
const SourceSchema = z.object({
  id: z.string().optional(),
  path: z.string().optional(),
  type: z.string(),
  bucket: z.string().optional(),
  platform: z.string().optional(),
});

const FormatSchema = z.object({
  id: z.string(),
  cost: z.number(),
  icon: z.string(),
  label: z.string(),
  source: SourceSchema,
  premium: z.boolean(),
  description: z.string(),
});

/* ------------------ 1. competitor-analysis ------------------ */
export const CompetitorAnalysisConfigSchema = z
  .object({
    baseCost: z.number(),
    analysisTypes: z.object({
      seo: z.object({ cost: z.number(), label: z.string() }),
      basic: z.object({ cost: z.number(), label: z.string() }),
      complete: z.object({ cost: z.number(), label: z.string() }),
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "competitor-analysis" as const }));

/* ------------------ 2. data-analyzer ------------------ */
export const DataAnalyzerConfigSchema = z
  .object({
    baseCost: z.number(),
    dataSources: z.object({
      csv: z.object({ cost: z.number(), label: z.string() }),
    }),
    analysisTypes: z.object({
      predictive: z.object({
        cost: z.number(),
        label: z.string(),
        premium: z.boolean().optional(),
      }),
      exploratory: z.object({ cost: z.number(), label: z.string() }),
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "data-analyzer" as const }));

/* ------------------ 3. seo-analyzer ------------------ */
export const SeoAnalyzerConfigSchema = z
  .object({
    baseCost: z.number(),
    analysisTypes: z.object({
      geo: z.object({
        new: z.boolean().optional(),
        cost: z.number(),
        label: z.string(),
      }),
      audit: z.object({ cost: z.number(), label: z.string() }),
      complete: z.object({ cost: z.number(), label: z.string() }),
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "seo-analyzer" as const }));

/* ------------------ 4. email-campaign ------------------ */
const CostLabelSchema = z.object({
  cost: z.number(),
  label: z.string(),
  description: z.string().optional(),
  premium: z.boolean().optional(),
});
const ContentStyleSchema = z.object({
  label: z.string(),
  tone: z.string(),
  industry: z.string(),
});
const AiModelSchema = CostLabelSchema.extend({
  description: z.string(),
});
const IntegrationOptionSchema = z.object({
  label: z.string(),
  setupCost: z.number(),
  monthlyCost: z.number(),
  premium: z.boolean().optional(),
});
const CampaignTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  premium: z.boolean().optional(),
});

export const EmailCampaignConfigSchema = z
  .object({
    baseCost: z.number(),
    aiModels: z.record(z.string(), AiModelSchema),
    audienceTypes: z.record(z.string(), CostLabelSchema),
    contentStyles: z.record(z.string(), ContentStyleSchema),
    integrationOptions: z.record(z.string(), IntegrationOptionSchema),
    campaignTypes: z.record(z.string(), CampaignTypeSchema),
  })
  .transform((cfg) => ({
    ...cfg,
    configType: "email-campaign" as const,
  }));

/* ------------------ LevelSchema shared for formations ------------------ */
const LevelSchema = z.object({
  id: z.string(),
  icon: z.string(),
  label: z.string(),
  formats: z.object({
    pdf: FormatSchema,
    video: FormatSchema,
    podcast: FormatSchema,
  }),
  premium: z.boolean(),
  chapters: z.number(),
  duration: z.string(),
  objectives: z.array(z.string()),
  description: z.string(),
});

/* ------------------ 5. formation-prompting ------------------ */
export const FormationPromptingConfigSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    levels: z.object({
      middle: LevelSchema,
      advanced: LevelSchema,
      debutant: LevelSchema,
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "formation-prompting" as const }));

/* ------------------ 6. formation-chatgpt ------------------ */
export const FormationChatGPTConfigSchema = z
  .object({
    id: z.string(),
    type: z.string(),
    levels: z.object({
      middle: LevelSchema,
      advanced: LevelSchema,
      debutant: LevelSchema,
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "formation-chatgpt" as const }));

/* ------------------ 7. real-estate-lease-generator ------------------ */
export const RealEstateLeaseGeneratorConfigSchema = z
  .object({
    leaseTypes: z.object({
      furnished: z.object({
        cost: z.number(),
        label: z.string(),
        durations: z.array(z.coerce.number()),
        userModes: z.array(z.string()),
        complexity: z.string(),
        description: z.string(),
      }),
      commercial: z.object({
        cost: z.number(),
        label: z.string(),
        durations: z.array(z.coerce.number()),
        userModes: z.array(z.string()),
        complexity: z.string(),
        description: z.string(),
      }),
      professional: z.object({
        cost: z.number(),
        label: z.string(),
        durations: z.array(z.coerce.number()),
        userModes: z.array(z.string()),
        complexity: z.string(),
        description: z.string(),
      }),
      residentialPro: z.object({
        cost: z.number(),
        label: z.string(),
        durations: z.array(z.coerce.number()),
        userModes: z.array(z.string()),
        complexity: z.string(),
        description: z.string(),
      }),
      residentialFree: z.object({
        cost: z.number(),
        label: z.string(),
        durations: z.array(z.coerce.number()),
        userModes: z.array(z.string()),
        complexity: z.string(),
        description: z.string(),
      }),
    }),
    emailOptions: z.object({
      premiumFeatures: z.array(z.string()),
    }),
    outputFormats: z.array(
      z.object({
        icon: z.string(),
        label: z.string(),
        value: z.string(),
        premium: z.boolean(),
      })
    ),
    propertyTypes: z.object({
      commercial: z.array(z.object({ label: z.string(), value: z.string() })),
      residential: z.array(z.object({ label: z.string(), value: z.string() })),
    }),
  })
  .transform((cfg) => ({
    ...cfg,
    configType: "real-estate-lease-generator" as const,
  }));

/* ------------------ 8. document-generator ------------------ */
export const DocumentGeneratorConfigSchema = z
  .object({
    types: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        templates: z.array(z.string()),
        complexity: z.string(),
        description: z.string(),
        legalAdvice: z.boolean().optional(),
      })
    ),
    outputFormats: z.array(
      z.object({
        icon: z.string(),
        label: z.string(),
        value: z.string(),
        premium: z.boolean(),
      })
    ),
    documentStyles: z.record(
      z.string(),
      z.object({
        color: z.string(),
        label: z.string(),
        description: z.string(),
      })
    ),
    premiumFeatures: z.array(z.string()),
    supportedLanguages: z.array(
      z.object({
        flag: z.string(),
        label: z.string(),
        value: z.string(),
      })
    ),
  })
  .transform((cfg) => ({ ...cfg, configType: "document-generator" as const }));

/* ------------------ 9. lead-generator ------------------ */
export const LeadGeneratorConfigSchema = z
  .object({
    sectors: z.object({
      finance: z.object({ cost: z.number(), label: z.string() }),
      healthcare: z.object({ cost: z.number(), label: z.string() }),
      technology: z.object({ cost: z.number(), label: z.string() }),
    }),
    baseCost: z.number(),
    leadQuality: z.object({
      basic: z.object({ cost: z.number(), label: z.string() }),
      standard: z.object({ cost: z.number(), label: z.string() }),
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "lead-generator" as const }));

/* ------------------ 10. social-factory ------------------ */
export const SocialFactoryConfigSchema = z
  .object({
    networks: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        iconKey: z.string(),
        features: z.array(z.string()),
        maxImages: z.number(),
      })
    ),
    postTypes: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        iconKey: z.string(),
        description: z.string().optional(),
      })
    ),
    objectives: z.record(
      z.string(),
      z.object({
        label: z.string(),
        iconKey: z.string(),
        description: z.string(),
      })
    ),
    contentStyles: z.record(
      z.string(),
      z.object({
        label: z.string(),
        iconKey: z.string(),
        description: z.string(),
      })
    ),
    premiumFeatures: z.array(z.string()),
  })
  .transform((cfg) => ({ ...cfg, configType: "social-factory" as const }));

/* ------------------ 11. article-writer ------------------ */
export const ArticleWriterConfigSchema = z
  .object({
    types: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        maxWords: z.number().optional(),
        minWords: z.number().optional(),
        description: z.string(),
      })
    ),
    languages: z.array(
      z.object({ flag: z.string(), label: z.string(), value: z.string() })
    ),
    seoLevels: z.object({
      basic: z.object({
        label: z.string(),
        features: z.array(z.string()),
        multiplier: z.number(),
        description: z.string(),
      }),
      expert: z.object({
        label: z.string(),
        features: z.array(z.string()),
        multiplier: z.number(),
        description: z.string(),
      }),
      advanced: z.object({
        label: z.string(),
        features: z.array(z.string()),
        multiplier: z.number(),
        description: z.string(),
      }),
    }),
    writingTones: z.record(
      z.string(),
      z.object({
        label: z.string(),
        description: z.string(),
      })
    ),
    premiumFeatures: z.array(z.string()),
  })
  .transform((cfg) => ({ ...cfg, configType: "article-writer" as const }));

/* ------------------ 12. ai-writer ------------------ */
export const AiWriterConfigSchema = z
  .object({
    tones: z.array(z.object({ label: z.string(), value: z.string() })),
    lengths: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        multiplier: z.number(),
        description: z.string(),
      })
    ),
    contentTypes: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        description: z.string(),
        placeholder: z.string().optional(),
      })
    ),
    imageOptions: z.array(
      z.object({
        cost: z.number(),
        label: z.string(),
        value: z.string(),
        description: z.string().optional(),
      })
    ),
    premiumFeatures: z.array(z.string()),
  })
  .transform((cfg) => ({ ...cfg, configType: "ai-writer" as const }));

/* ------------------ 13. talent-analyzer ------------------ */
export const TalentAnalyzerConfigSchema = z
  .object({
    baseCost: z.number(),

    analysisTypes: z.record(
      z.string(),
      z.object({
        label: z.string(),
        cost: z.number(),
        description: z.string(),
        features: z.array(z.string()),
        duration: z.string(),
        icon: z.string(),
        maxCvs: z.number().optional(),
        maxProfiles: z.number().optional(),
        premium: z.boolean().optional(),
      })
    ),
    industries: z.record(
      z.string(),
      z.object({
        label: z.string(),
        multiplier: z.number(),
        icon: z.string(),
        skillsFocus: z.array(z.string()),
        specialties: z.array(z.string()),
      })
    ),
    scoringLevels: z.record(
      z.string(),
      z.object({
        label: z.string(),
        cost: z.number(),
        description: z.string(),
        features: z.array(z.string()),
        premium: z.boolean().optional(),
      })
    ),
    hrOptions: z.record(
      z.string(),
      z.object({
        label: z.string(),
        cost: z.number(),
        description: z.string(),
        premium: z.boolean().optional(),
      })
    ),
    premiumFeatures: z.array(z.string()),
    availableCriteria: z.array(
      z.object({
        id: z.string(),
        label: z.string(),
        icon: z.string(),
      })
    ),
  })
  .transform((cfg) => ({
    ...cfg,
    configType: "talent-analyzer" as const,
  }));

/* ------------------ 14. content-translator ------------------ */
export const ContentTranslatorConfigSchema = z
  .object({
    baseCost: z.number(),
    languages: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        flag: z.string(),
        tier: z.number(),
        label: z.string(),
      })
    ),
    translationTypes: z.object({
      simple: z.object({
        cost: z.number(),
        label: z.string(),
        wordLimit: z.number().optional(),
      }),
      professional: z.object({
        cost: z.number(),
        label: z.string(),
        wordLimit: z.number().optional(),
      }),
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "content-translator" as const }));

/* ------------------ 15. transcription ------------------ */
export const TranscriptionConfigSchema = z
  .object({
    types: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        formats: z.array(z.string()),
        maxSize: z.number().optional(),
        features: z.array(z.string()).optional(),
        description: z.string(),
        maxDuration: z.number().optional(),
      })
    ),
    languages: z.array(
      z.object({ code: z.string(), flag: z.string(), label: z.string() })
    ),
    outputFormats: z.array(
      z.object({ icon: z.string(), label: z.string(), value: z.string() })
    ),
    qualityLevels: z.object({
      high: z.object({
        label: z.string(),
        accuracy: z.string(),
        multiplier: z.number(),
        description: z.string(),
      }),
      premium: z.object({
        label: z.string(),
        accuracy: z.string(),
        multiplier: z.number(),
        description: z.string(),
      }),
      standard: z.object({
        label: z.string(),
        accuracy: z.string(),
        multiplier: z.number(),
        description: z.string(),
      }),
    }),
  })
  .transform((cfg) => ({ ...cfg, configType: "transcription" as const }));

/* ------------------ 16. youtube-uploader ------------------ */
export const YoutubeUploaderConfigSchema = z
  .object({
    categories: z.array(z.object({ label: z.string(), value: z.string() })),
    videoTypes: z.record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        formats: z.array(z.string()),
        iconKey: z.string(),
        maxSize: z.number(),
        description: z.string(),
      })
    ),
    privacyOptions: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        description: z.string(),
      })
    ),
    premiumFeatures: z.array(z.string()),
  })
  .transform((cfg) => ({ ...cfg, configType: "youtube-uploader" as const }));

/* ---------------------------- Union Schema ------------------------- */
export const ConfigSchema = z.union([
  CompetitorAnalysisConfigSchema,
  DataAnalyzerConfigSchema,
  SeoAnalyzerConfigSchema,
  EmailCampaignConfigSchema,
  FormationPromptingConfigSchema,
  FormationChatGPTConfigSchema,
  RealEstateLeaseGeneratorConfigSchema,
  DocumentGeneratorConfigSchema,
  LeadGeneratorConfigSchema,
  SocialFactoryConfigSchema,
  ArticleWriterConfigSchema,
  AiWriterConfigSchema,
  TalentAnalyzerConfigSchema,
  ContentTranslatorConfigSchema,
  TranscriptionConfigSchema,
  YoutubeUploaderConfigSchema,
]);

export type ModuleConfig = z.infer<typeof ConfigSchema>;
