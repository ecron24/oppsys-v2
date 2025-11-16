import z from "zod";

// Config 1 : plateformes
export const ConfigPlatformsSchema = z.object({
  platforms: z.array(z.enum(["facebook", "instagram", "linkedin"])),
});

// Config 2 : génération d’image
export const ConfigImageGenSchema = z.object({
  size: z.string(), // ex: "1024x1024"
  quality: z.enum(["standard", "high"]).optional(),
});

// Config 3 : social media content
const NetworkSchema = z.object({
  cost: z.number(),
  label: z.string(),
  iconKey: z.string(),
  features: z.array(z.string()),
  maxImages: z.number(),
});

const PostTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  iconKey: z.string(),
  description: z.string(),
});

const ObjectiveSchema = z.object({
  label: z.string(),
  iconKey: z.string(),
  description: z.string(),
});

const ContentStyleSchema = z.object({
  label: z.string(),
  iconKey: z.string(),
  description: z.string(),
});

export const ConfigSocialMediaSchema = z.object({
  networks: z.record(z.string(), NetworkSchema),
  postTypes: z.record(z.string(), PostTypeSchema),
  objectives: z.record(z.string(), ObjectiveSchema),
  contentStyles: z.record(z.string(), ContentStyleSchema),
  premiumFeatures: z.array(z.string()).optional(),
});

// Config 4 : YouTube
const CategorySchema = z.object({
  label: z.string(),
  value: z.string(),
});

const VideoTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  formats: z.array(z.string()),
  iconKey: z.string(),
  maxSize: z.number(),
  description: z.string(),
});

const PrivacyOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
  description: z.string(),
});

export const ConfigYoutubeSchema = z.object({
  categories: z.array(CategorySchema),
  videoTypes: z.record(z.string(), VideoTypeSchema),
  privacyOptions: z.array(PrivacyOptionSchema),
  premiumFeatures: z.array(z.string()).optional(),
});

// Config 5 : contrats immobiliers
const LeaseTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  durations: z.array(z.coerce.number()),
  userModes: z.array(z.string()),
  complexity: z.string().optional(),
  description: z.string(),
});

const EmailOptionsSchema = z.object({
  premiumFeatures: z.array(z.string()).optional(),
});

const OutputFormatSchema = z.object({
  icon: z.string(),
  label: z.string(),
  value: z.string(),
  premium: z.boolean().optional(),
});

const PropertyTypeItem = z.object({
  label: z.string(),
  value: z.string(),
});

export const ConfigRealEstateSchema = z.object({
  leaseTypes: z.record(z.string(), LeaseTypeSchema),
  emailOptions: EmailOptionsSchema,
  outputFormats: z.array(OutputFormatSchema),
  propertyTypes: z.record(z.string(), z.array(PropertyTypeItem)),
});

// Config 6 : traduction
const LanguageSchema = z.object({
  cost: z.number(),
  flag: z.string(),
  tier: z.number(),
  label: z.string(),
});

const TranslationTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  wordLimit: z.number(),
});

export const ConfigTranslationSchema = z.object({
  baseCost: z.number(),
  languages: z.record(z.string(), LanguageSchema),
  translationTypes: z.record(z.string(), TranslationTypeSchema),
});

// Config 7 : simple
export const ConfigTrainingSchema = z.object({
  model: z.string(),
  training: z.boolean(),
});

// Config 8 : RH / Talent
const AnalysisTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  maxCvs: z.number().optional(),
  premium: z.boolean().optional(),
});

export const ConfigTalentSchema = z.object({
  baseCost: z.number(),
  analysisTypes: z.record(z.string(), AnalysisTypeSchema),
});

// Config 9 : contenu textuel : options
const ToneSchema = z.object({
  label: z.string(),
  value: z.string(),
});

const LengthSchema = z.object({
  label: z.string(),
  value: z.string(),
  multiplier: z.number(),
  description: z.string(),
});

const ContentTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  description: z.string(),
  placeholder: z.string(),
});

const ImageOptionSchema = z.object({
  cost: z.number(),
  label: z.string(),
  value: z.string(),
  description: z.string(),
});

export const ConfigWritingAssistantSchema = z.object({
  tones: z.array(ToneSchema),
  lengths: z.array(LengthSchema),
  contentTypes: z.record(z.string(), ContentTypeSchema),
  imageOptions: z.array(ImageOptionSchema),
  premiumFeatures: z.array(z.string()).optional(),
});

// Config 10 : rédaction avancée
const ArticleTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  maxWords: z.number(),
  minWords: z.number(),
  description: z.string(),
});

const LanguageEntrySchema = z.object({
  flag: z.string(),
  label: z.string(),
  value: z.string(),
});

const SeoLevelSchema = z.object({
  label: z.string(),
  features: z.array(z.string()),
  multiplier: z.number(),
  description: z.string(),
});

const WritingToneSchema = z.object({
  label: z.string(),
  description: z.string(),
});

export const ConfigAdvancedWritingSchema = z.object({
  types: z.record(z.string(), ArticleTypeSchema).optional(),
  languages: z.array(LanguageEntrySchema),
  seoLevels: z.record(z.string(), SeoLevelSchema),
  writingTones: z.record(z.string(), WritingToneSchema),
  premiumFeatures: z.array(z.string()).optional(),
});

// Config 11 : formation
const FormatSchema = z.object({
  id: z.string(),
  cost: z.number(),
  icon: z.string(),
  label: z.string(),
  source: z.object({
    path: z.string().optional(),
    type: z.string(),
    bucket: z.string().optional(),
    id: z.string().optional(),
    platform: z.string().optional(),
  }),
  premium: z.boolean(),
  description: z.string(),
});

const LevelSchema = z.object({
  id: z.string(),
  icon: z.string(),
  label: z.string(),
  formats: z.record(z.string(), FormatSchema),
  premium: z.boolean(),
  chapters: z.number(),
  duration: z.string(),
  objectives: z.array(z.string()),
  description: z.string(),
});

export const ConfigFormationSchema = z.object({
  id: z.string(),
  type: z.string(),
  levels: z.record(z.string(), LevelSchema),
});

// Config 12 : leads
export const ConfigLeadsSchema = z.object({
  sectors: z.record(
    z.string(),
    z.object({
      cost: z.number(),
      label: z.string(),
    })
  ),
  baseCost: z.number(),
  leadQuality: z.record(
    z.string(),
    z.object({
      cost: z.number(),
      label: z.string(),
    })
  ),
});

// Config 13 : analyse texte
export const ConfigAnalysisSchema = z.object({
  baseCost: z.number(),
  analysisTypes: z.record(
    z.string(),
    z.object({
      cost: z.number(),
      label: z.string(),
    })
  ),
});

// Config 14 : documents pro
const DocTypeSchema = z.object({
  cost: z.number(),
  label: z.string(),
  templates: z.array(z.string()).optional(),
  complexity: z.string().optional(),
  description: z.string(),
  legalAdvice: z.boolean().optional(),
});

const OutputFmtSchema = z.object({
  icon: z.string(),
  label: z.string(),
  value: z.string(),
  premium: z.boolean().optional(),
});

const DocStyleSchema = z.object({
  color: z.string(),
  label: z.string(),
  description: z.string(),
});

const LangSchema = z.object({
  flag: z.string(),
  label: z.string(),
  value: z.string(),
});

export const ConfigDocumentsSchema = z.object({
  types: z.record(z.string(), DocTypeSchema).optional(),
  outputFormats: z.array(OutputFmtSchema).optional(),
  documentStyles: z.record(z.string(), DocStyleSchema).optional(),
  premiumFeatures: z.array(z.string()).optional(),
  supportedLanguages: z.array(LangSchema).optional(),
});

export const ConfigSchema = z.union([
  ConfigPlatformsSchema,
  ConfigImageGenSchema,
  ConfigSocialMediaSchema,
  ConfigYoutubeSchema,
  ConfigRealEstateSchema,
  ConfigTranslationSchema,
  ConfigTrainingSchema,
  ConfigTalentSchema,
  ConfigWritingAssistantSchema,
  ConfigAdvancedWritingSchema,
  ConfigFormationSchema,
  ConfigLeadsSchema,
  ConfigAnalysisSchema,
  ConfigDocumentsSchema,
  //   z.looseObject(z.object({})), // fallback souple
]);
