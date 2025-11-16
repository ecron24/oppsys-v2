import type { OppSysSupabaseClient } from "@oppsys/supabase";
import {
  ModuleSchema,
  ModuleUsageSchema,
  type Module,
  type ModuleUsage,
} from "../domain/module";
import type {
  CreateModuleUsageResult,
  GetModuleByIdOrSlugResult,
  GetModulesResult,
  GetModuleUsageHistoryResult,
  ModuleRepo,
  UpdateModuleUsageResult,
} from "../domain/module-repo";
import { tryCatch } from "src/lib/try-catch";
import type { Logger } from "src/logger/domain/logger";
import { toCamelCase } from "src/lib/to-camel-case";
import z from "zod";
import type { ListModulesQuery } from "../app/get-modules-use-case";
import type { ModuleUsageHistoryQuery } from "../app/get-module-usage-history-use-case";
import { toSnakeCase } from "src/lib/to-snake-case";

export class ModuleRepoSupabase implements ModuleRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {
    void this.logger;
  }

  async list(query: ListModulesQuery): Promise<GetModulesResult> {
    return await tryCatch(async () => {
      let q = this.supabase.from("modules").select(`*`, { count: "exact" });

      if (!query.includeInactive) {
        q = q.eq("is_active", true);
      }
      if (query.type) {
        q = q.eq("type", query.type);
      }
      if (query.category) {
        q = q.eq("category", query.category);
      }
      if (query.search) {
        q = q.or(
          `name.ilike.%${query.search}%,description.ilike.%${query.search}%,slug.ilike.%${query.search}%`
        );
      }

      q = q.order(query.sort, { ascending: query.order === "asc" });

      if (typeof query.limit === "number" && typeof query.page === "number") {
        const offset = (query.page - 1) * query.limit;
        q = q.range(offset, offset + query.limit - 1);
      }

      const { data, error, count } = await q;

      if (error) {
        this.logger.error("[list] :", error, { query });
        throw error;
      }

      const modules = data.map(toCamelCase);

      return {
        success: true,
        data: { data: z.array(ModuleSchema).parse(modules), total: count || 0 },
      } as const;
    });
  }

  async findByIdOrSlug(idOrSlug: string): Promise<GetModuleByIdOrSlugResult> {
    return await tryCatch(async () => {
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          idOrSlug
        );

      let q = this.supabase.from("modules").select("*").eq("is_active", true);
      if (isUUID) {
        q = q.eq("id", idOrSlug);
      } else {
        q = q.eq("slug", idOrSlug);
      }

      const { data, error } = await q.maybeSingle();

      if (error) {
        this.logger.error("[findByIdOrSlug] :", error, { idOrSlug });
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "MODULE_NOT_FOUND",
          error: new Error("MODULE not found : params=" + idOrSlug),
        } as const;
      }

      return {
        success: true,
        data: ModuleSchema.parse(toCamelCase(data) as Module),
      } as const;
    });
  }

  async listUsageHistory(
    userId: string,
    query: ModuleUsageHistoryQuery
  ): Promise<GetModuleUsageHistoryResult> {
    return await tryCatch(async () => {
      let selectFields = `
        id,
        module_id,
        module_slug,
        credits_used,
        status,
        used_at,
        error_message,
        metadata,
        modules (
          name,
          type,
          description,
          category
        )
      `;

      if (query.includeOutput) {
        selectFields += ", output";
      }

      let q = this.supabase
        .from("module_usage")
        .select(selectFields, { count: "exact" })
        .eq("user_id", userId);

      if (query.moduleId) q = q.eq("module_id", query.moduleId);
      if (query.moduleSlug) q = q.eq("module_slug", query.moduleSlug);
      if (query.status) q = q.eq("status", query.status);
      if (query.startDate) q = q.gte("used_at", query.startDate);
      if (query.endDate) q = q.lte("used_at", query.endDate);

      q = q.order(query.sort, { ascending: query.order === "asc" });
      if (typeof query.limit === "number" && typeof query.page === "number") {
        const offset = (query.page - 1) * query.limit;
        q = q.range(offset, offset + query.limit - 1);
      }

      const { data, error, count } = await q;

      if (error) {
        this.logger.error("[listUsageHistory] :", error, { query });
        throw error;
      }

      const history = data.map(toCamelCase);

      return {
        success: true as const,
        data: {
          data: z.array(ModuleUsageSchema).parse(history),
          total: count || 0,
        },
      };
    });
  }

  async createUsage(
    usage: Omit<ModuleUsage, "id" | "usedAt">
  ): Promise<CreateModuleUsageResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("module_usage")
        .insert({
          output: null,
          used_at: new Date().toISOString(),
          ...toSnakeCase(usage),
        })
        .select("*")
        .single();

      if (error) {
        this.logger.error("[createUsage] :", error, { usage });
        throw error;
      }

      return {
        success: true,
        data: ModuleUsageSchema.parse(toCamelCase(data) as ModuleUsage),
      } as const;
    });
  }

  async updateUsage(
    id: string,
    usageUpdate: Partial<Omit<ModuleUsage, "id">>
  ): Promise<UpdateModuleUsageResult> {
    return await tryCatch(async () => {
      const { error, data } = await this.supabase
        .from("module_usage")
        .update({
          ...toSnakeCase(usageUpdate),
        })
        .eq("id", id)
        .select();

      if (error) {
        this.logger.error("[updateUsage]", error);
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "MODULE_NOT_FOUND",
          error: new Error("unknown error"),
        } as const;
      }

      return { success: true as const, data: undefined };
    });
  }
}
