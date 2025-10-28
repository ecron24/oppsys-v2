import z from "zod";

const CostedItem = z.object({
  cost: z.number(),
  label: z.string(),
  description: z.string().optional(),
  premium: z.boolean().optional(),
});

const OutputFormat = z.object({
  icon: z.string(),
  label: z.string(),
  value: z.string(),
  premium: z.boolean().optional(),
});

// === 2. Typages spécifiques par type de module ===

// SEO / Analyse / Data modules
const AnalysisConfigSchema = z.object({
  baseCost: z.number(),
  analysisTypes: z
    .record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        premium: z.boolean().optional(),
        new: z.boolean().optional(),
      })
    )
    .optional(),
  dataSources: z.record(z.string(), CostedItem).optional(),
});

// Formations ("formation-prompting-01", "formation-chatgpt-01")
const FormationFormatSchema = z.object({
  id: z.string(),
  cost: z.number(),
  icon: z.string(),
  label: z.string(),
  source: z.record(z.string(), z.any()),
  premium: z.boolean(),
  description: z.string(),
});

const FormationLevelSchema = z.object({
  id: z.string(),
  icon: z.string(),
  label: z.string(),
  premium: z.boolean(),
  chapters: z.number(),
  duration: z.string(),
  objectives: z.array(z.string()),
  description: z.string(),
  formats: z.record(z.string(), FormationFormatSchema),
});

const FormationConfigSchema = z.object({
  id: z.string(),
  type: z.literal("formation"),
  levels: z.record(z.string(), FormationLevelSchema),
});

// Contrats / Baux
const LeaseConfigSchema = z.object({
  leaseTypes: z.record(
    z.string(),
    z.object({
      cost: z.number(),
      label: z.string(),
      durations: z.array(z.string()),
      userModes: z.array(z.string()),
      complexity: z.string(),
      description: z.string(),
    })
  ),
  emailOptions: z
    .object({
      premiumFeatures: z.array(z.string()),
    })
    .optional(),
  outputFormats: z.array(OutputFormat),
  propertyTypes: z.record(
    z.string(),
    z.array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
  ),
});

// Documents / Générateurs
const DocumentConfigSchema = z.object({
  types: z.record(
    z.string(),
    z.object({
      cost: z.number(),
      label: z.string(),
      templates: z.array(z.string()),
      complexity: z.string(),
      description: z.string(),
      legalAdvice: z.boolean(),
    })
  ),
  outputFormats: z.array(OutputFormat),
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
});

// Médias / Réseaux sociaux
const SocialConfigSchema = z.object({
  networks: z
    .record(
      z.string(),
      z.object({
        cost: z.number(),
        label: z.string(),
        iconKey: z.string(),
        features: z.array(z.string()),
        maxImages: z.number(),
      })
    )
    .optional(),
  postTypes: z
    .record(
      z.string(),
      CostedItem.extend({
        iconKey: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  objectives: z
    .record(
      z.string(),
      z.object({
        label: z.string(),
        iconKey: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  contentStyles: z
    .record(
      z.string(),
      z.object({
        label: z.string(),
        iconKey: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  premiumFeatures: z.array(z.string()).optional(),
});

// === 3. Union globale ===
export const ConfigSchema = z.union([
  AnalysisConfigSchema,
  FormationConfigSchema,
  LeaseConfigSchema,
  DocumentConfigSchema,
  SocialConfigSchema,
  //   z.looseObject(z.object({})), // fallback souple
]);
