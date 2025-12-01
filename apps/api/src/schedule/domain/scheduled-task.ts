import z from "zod";
import {
  IsoDatetime,
  nullableSchema,
  UuidSchema,
} from "src/common/common-schema";

export const ScheduledTaskStatusSchema = z.enum([
  "scheduled",
  "running",
  "completed",
  "failed",
]);

export const ScheduledTaskSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  moduleId: UuidSchema,
  executionTime: IsoDatetime,
  payload: z.record(z.string(), z.unknown()),
  status: ScheduledTaskStatusSchema,
  startedAt: IsoDatetime.nullable(),
  completedAt: IsoDatetime.nullable(),
  result: z.record(z.string(), z.unknown()).nullable(),
  createdAt: IsoDatetime.nullable(),
  updatedAt: IsoDatetime.nullable(),
  modules: nullableSchema(
    z.object({
      id: z.string(),
      name: z.string(),
      slug: z.string(),
      creditCost: z.number(),
      endpoint: z.url(),
    })
  ),
  generatedContent: z
    .object({
      id: z.string(),
      title: z.string().nullable(),
      type: z.string().nullable(),
      htmlPreview: z.string().nullable(),
      status: z.string(),
      metadata: z.record(z.string(), z.unknown()),
    })
    .optional()
    .nullable(),
  profiles: nullableSchema(
    z.object({
      email: z.string(),
    })
  ),
});

export type ScheduledTask = z.infer<typeof ScheduledTaskSchema>;

export const CreateScheduledTaskSchema = ScheduledTaskSchema.omit({
  id: true,
  status: true,
  startedAt: true,
  completedAt: true,
  result: true,
  createdAt: true,
  updatedAt: true,
  modules: true,
  generatedContent: true,
});

export type CreateScheduledTask = z.infer<typeof CreateScheduledTaskSchema>;

export const UpdateScheduledTaskSchema = z.object({
  executionTime: IsoDatetime.optional(),
  status: ScheduledTaskStatusSchema.optional(),
  startedAt: IsoDatetime.nullable().optional(),
  completedAt: IsoDatetime.nullable().optional(),
  result: z.record(z.string(), z.unknown()).nullable().optional(),
});

export type UpdateScheduledTask = z.infer<typeof UpdateScheduledTaskSchema>;
