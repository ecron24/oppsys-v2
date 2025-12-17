import {
  NumberNullableSchema,
  StringNullableSchema,
} from "src/common/common-schema";
import { z } from "zod";

const ContactInfoSchema = z.object({
  name: StringNullableSchema,
  email: StringNullableSchema,
});

const PropertyInfoSchema = z.object({
  address: StringNullableSchema,
  rent: StringNullableSchema,
  deposit: StringNullableSchema,
});

const LeaseInfoSchema = z.object({
  duration: StringNullableSchema,
  startDate: StringNullableSchema,
});

const GeneratedContentSchema = z.object({
  post: StringNullableSchema,
  caption: StringNullableSchema,
  content: StringNullableSchema,
  hashtags: z.array(z.string()).optional(),
  callToAction: StringNullableSchema,
  emojis: z.union([z.string(), z.array(z.string())]).optional(),
});

const OutputSchema = z.object({
  post: StringNullableSchema,
  caption: StringNullableSchema,
  content: StringNullableSchema,
});

const ResultSchema = z.object({
  post: StringNullableSchema,
  content: StringNullableSchema,
});

const ExecutionResultSchema = z.object({
  content: StringNullableSchema,
});

export const ContentMetadataSchema = z
  .object({
    targetModuleSlug: StringNullableSchema,
    targetPlatform: StringNullableSchema,
    networks: z.array(z.string()).optional(),
    selectedNetworks: z.array(z.string()).optional(),
    postContent: StringNullableSchema,
    content: StringNullableSchema,
    caption: StringNullableSchema,
    generatedContent: GeneratedContentSchema.optional(),
    output: OutputSchema.optional(),
    result: ResultSchema.optional(),
    workflowResult: z.object({ post: StringNullableSchema }).optional(),
    executionResult: ExecutionResultSchema.optional(),
    hashtags: z.union([z.string(), z.array(z.string())]).optional(),
    callToAction: StringNullableSchema,
    cta: StringNullableSchema,
    emojis: z.union([z.string(), z.array(z.string())]).optional(),
    platform: StringNullableSchema,
    leaseType: StringNullableSchema,
    outputFormat: StringNullableSchema,
    propertyInfo: PropertyInfoSchema.optional(),
    ownerInfo: ContactInfoSchema.optional(),
    tenantInfo: ContactInfoSchema.optional(),
    leaseInfo: LeaseInfoSchema.optional(),
    resumeWebhookUrl: StringNullableSchema,
    originalInput: z.record(z.string(), z.unknown()).optional(),
    moduleId: StringNullableSchema,
    moduleName: StringNullableSchema,
    userId: StringNullableSchema,
    clientEmail: StringNullableSchema,
    clientName: StringNullableSchema,
    clientId: StringNullableSchema,
    planId: StringNullableSchema,
    decisionTimestamp: StringNullableSchema,
    approvedBy: StringNullableSchema,
    originalStatus: StringNullableSchema,
    approvedAt: StringNullableSchema,
    approvalFeedback: StringNullableSchema,
    fileInfo: z
      .object({
        fileName: StringNullableSchema,
        fileSize: NumberNullableSchema,
        mimeType: StringNullableSchema,
        format: StringNullableSchema,
        path: z.string(),
      })
      .optional(),
  })
  // Fallback
  .catchall(z.unknown());
