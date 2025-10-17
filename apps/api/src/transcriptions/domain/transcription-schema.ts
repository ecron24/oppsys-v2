import {
  NumberNullableSchema,
  StringNullableSchema,
} from "src/common/common-schema";
import z from "zod";

export const CreateTranscriptionInputSchema = z
  .object({
    transcriptionType: z.enum([
      "audio",
      "video",
      "meeting",
      "interview",
      "live",
    ]),
    language: z.string().default("auto"),
    quality: z.enum(["basic", "standard", "premium"]).default("standard"),
    outputFormat: z.enum(["text", "srt", "vtt", "json"]).default("text"),
    speakerDiarization: z.boolean().default(false),
    removeFillers: z.boolean().default(true),
    addPunctuation: z.boolean().default(true),
    addTimestamps: z.boolean().default(false),
    generateSummary: z.boolean().default(false),
    customInstructions: z.string().optional(),
    publishToContent: z.boolean().default(true),
    liveTranscript: z.string().optional(),
    filePath: z.string().optional(),
    fileName: z.string().optional(),
    fileSize: z.number().optional(),
    fileType: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.transcriptionType === "live" && !data.liveTranscript) {
        return false;
      }
      return true;
    },
    {
      message: "liveTranscript is required when transcriptionType is 'live'",
      path: ["liveTranscript"],
    }
  );

export const ListTranscriptionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.string().optional(),
  type: z.string().optional(),
});

export const TranscriptionStatsQuerySchema = z.object({
  period: z.enum(["week", "month", "year"]).default("month"),
});

export const CreateUploadUrlInputSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileSize: z.number().optional(),
});

export const TranscriptionCallbackInputSchema = z.object({
  success: z.boolean(),
  result: z.object({
    transcript: StringNullableSchema,
    summary: StringNullableSchema,
    speakers: z.any(),
    segments: z.any(),
    confidence: NumberNullableSchema,
    executionId: StringNullableSchema,
    error: StringNullableSchema,
  }),
});

export type CreateTranscriptionInput = z.infer<
  typeof CreateTranscriptionInputSchema
>;
export type ListTranscriptionsQuery = z.infer<
  typeof ListTranscriptionsQuerySchema
>;
export type TranscriptionStatsQuery = z.infer<
  typeof TranscriptionStatsQuerySchema
>;
export type CreateUploadUrlInput = z.infer<typeof CreateUploadUrlInputSchema>;
export type TranscriptionCallbackInput = z.infer<
  typeof TranscriptionCallbackInputSchema
>;
