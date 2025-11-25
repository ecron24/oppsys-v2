import type {
  TranscriptionRepo,
  CreateTranscriptionResult,
  GetTranscriptionByIdResult,
  ListTranscriptionsResult,
  UpdateTranscriptionResult,
  DeleteTranscriptionResult,
} from "../domain/transcription-repo";
import {
  TranscriptionSchema,
  type Transcription,
} from "../domain/transcription";
import type { Logger } from "src/logger/domain/logger";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { toSnakeCase } from "@oppsys/shared";
import { toCamelCase } from "@oppsys/shared";
import { tryCatch } from "src/lib/try-catch";

export class TranscriptionRepoSupabase implements TranscriptionRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async createTranscription(
    transcription: Omit<Transcription, "id" | "createdAt" | "updatedAt">
  ): Promise<CreateTranscriptionResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("transcriptions")
        .insert(toSnakeCase(transcription))
        .select()
        .single();

      if (error) {
        this.logger.error("[createTranscription] failed", error, {
          transcription,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to create transcription"),
        } as const;
      }

      const mapped = toCamelCase(data) as Transcription;
      return {
        success: true,
        data: TranscriptionSchema.parse(mapped),
      } as const;
    });
  }

  async getTranscriptionById(
    id: string,
    userId?: string
  ): Promise<GetTranscriptionByIdResult> {
    return await tryCatch(async () => {
      let query = this.supabase.from("transcriptions").select("*").eq("id", id);

      if (userId) {
        query = query.eq("user_id", userId);
      }
      const { data, error } = await query.maybeSingle();

      if (error) {
        this.logger.error("[getTranscriptionById] ", error, {
          id,
          userId,
        });
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "NOT_FOUND",
          error: new Error("Transcriptin not found"),
        } as const;
      }

      const mapped = toCamelCase(data) as Transcription;
      return {
        success: true,
        data: TranscriptionSchema.parse(mapped),
      } as const;
    });
  }

  async listTranscriptions(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
      type?: string;
      createdAt?: string;
      expiresAt?: string;
    }
  ): Promise<ListTranscriptionsResult> {
    return await tryCatch(async () => {
      const { limit, offset, status, type, createdAt, expiresAt } = options;

      let query = this.supabase
        .from("transcriptions")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (createdAt) query = query.gte("created_at", createdAt);
      if (expiresAt) query = query.lt("expires_at", expiresAt);
      if (status) query = query.eq("status", status);
      if (type) query = query.eq("transcription_type", type);

      if (typeof limit === "number" && typeof offset === "number") {
        query = query.range(offset, offset + limit - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        this.logger.error("[listTranscriptions] failed", error, {
          userId,
          options,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to list transcriptions"),
        } as const;
      }

      const mapped = toCamelCase(data || []) as Transcription[];
      return {
        success: true,
        data: {
          transcriptions: TranscriptionSchema.array().parse(mapped),
          pagination: {
            limit: limit ?? null,
            offset: offset ?? null,
            total: count || 0,
          },
        },
      } as const;
    });
  }

  async updateTranscription(
    id: string,
    updates: Partial<Transcription>
  ): Promise<UpdateTranscriptionResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("transcriptions")
        .update(toSnakeCase(updates))
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        this.logger.error("[updateTranscription] ", error, {
          id,
          updates,
        });
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "NOT_FOUND",
          error: new Error("Transcription not found"),
        } as const;
      }

      const mapped = toCamelCase(data) as Transcription;
      return {
        success: true,
        data: TranscriptionSchema.parse(mapped),
      } as const;
    });
  }

  async deleteTranscription(where: {
    id?: string;
    userId?: string;
    expiresAt?: string;
  }): Promise<DeleteTranscriptionResult> {
    return await tryCatch(async () => {
      let deleting = this.supabase.from("transcriptions").delete();

      if (where.id) {
        deleting = deleting.eq("id", where.id);
      }
      if (where.userId) {
        deleting = deleting.lt("user_id", where.userId);
      }
      if (where.expiresAt) {
        deleting = deleting.lt("expires_at", where.expiresAt);
      }
      const { error } = await deleting;

      if (error) {
        this.logger.error("[deleteTranscription] failed", error, {
          where,
        });
        return {
          success: false,
          kind: "NOT_FOUND",
          error: new Error("Failed to delete transcription"),
        } as const;
      }

      return {
        success: true,
        data: undefined,
      } as const;
    });
  }
}
