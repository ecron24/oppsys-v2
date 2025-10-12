import type { Json, OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import type { Logger } from "src/logger/domain/logger";
import type {
  ContentRepo,
  CreateContentResult,
  DeleteContentResult,
  GetAllContentResult,
  GetContentApprovalHistoryResult,
  GetContentByIdResult,
  GetContentStatsResult,
  SearchContentResult,
  SubmitContentForApprovalResult,
  UpdateContentResult,
} from "../domain/content-repo";
import {
  ContentSchema,
  type Content,
  type ContentApproval,
  type SearchFilters,
} from "../domain/content";
import { toSnakeCase } from "src/lib/to-snake-case";
import { toCamelCase } from "src/lib/to-camel-case";
import z from "zod";
import type { GetAllContentQuery } from "../app/get-all-content-use-case";

export class ContentRepoSupabase implements ContentRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async getStats(params: {
    userId: string;
    period: "week" | "month" | "year";
  }): Promise<GetContentStatsResult> {
    return await tryCatch(async () => {
      const startDate = new Date();
      switch (params.period) {
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const { data, error } = await this.supabase
        .from("generated_content")
        .select("type, is_favorite, created_at, module_slug")
        .eq("user_id", params.userId)
        .gte("created_at", startDate.toISOString());

      if (error) {
        this.logger.error("[getStats] failed", error, {
          userId: params.userId,
          period: params.period,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }

      const stats = {
        total: data?.length || 0,
        favorites: data?.filter((item) => item.is_favorite).length || 0,
        byType: {
          article: data?.filter((item) => item.type === "article").length || 0,
          audio: data?.filter((item) => item.type === "audio").length || 0,
          video: data?.filter((item) => item.type === "video").length || 0,
          image: data?.filter((item) => item.type === "image").length || 0,
          data: data?.filter((item) => item.type === "data").length || 0,
          "social-post":
            data?.filter((item) => item.type === "social-post").length || 0,
        },
        byModule:
          data?.reduce((acc: Record<string, number>, item) => {
            if (item.module_slug) {
              acc[item.module_slug] = (acc[item.module_slug] || 0) + 1;
            }
            return acc;
          }, {}) || {},
        period: params.period,
      };

      return {
        success: true,
        data: stats,
      } as const;
    });
  }

  async search(params: {
    userId: string;
    query: string;
    filters: SearchFilters;
  }): Promise<SearchContentResult> {
    return await tryCatch(async () => {
      let dbQuery = this.supabase
        .from("generated_content")
        .select(
          `
          *,
          modules!generated_content_module_id_fkey(
            id,
            name,
            slug,
            category
          )
        `
        )
        .eq("user_id", params.userId);

      if (params.filters.type)
        dbQuery = dbQuery.eq("type", params.filters.type);
      if (params.filters.moduleSlug)
        dbQuery = dbQuery.eq("module_slug", params.filters.moduleSlug);
      if (params.filters.isFavorite !== undefined)
        dbQuery = dbQuery.eq("is_favorite", params.filters.isFavorite);
      if (params.filters.dateFrom)
        dbQuery = dbQuery.gte("created_at", params.filters.dateFrom);
      if (params.filters.dateTo)
        dbQuery = dbQuery.lte("created_at", params.filters.dateTo);
      if (params.query && params.query.trim())
        dbQuery = dbQuery.or(
          `title.ilike.%${params.query}%, content.ilike.%${params.query}%`
        );

      dbQuery = dbQuery.order("created_at", { ascending: false }).limit(100);

      const { data, error } = await dbQuery;

      if (error) {
        this.logger.error("[search] failed", error, {
          userId: params.userId,
          query: params.query,
          filters: params.filters,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }
      const mapped = data.map(toCamelCase) as Content[];

      return {
        success: true,
        data: z.array(ContentSchema).parse(mapped),
      } as const;
    });
  }

  async create(params: {
    userId: string;
    contentData: Omit<Content, "id" | "userId" | "createdAt">;
  }): Promise<CreateContentResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("generated_content")
        .insert({
          ...toSnakeCase({ ...params.contentData, userId: params.userId }),
          metadata: params.contentData.metadata as Json,
        })
        .select()
        .single();

      if (error) {
        this.logger.error("[create] failed", error, { params });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }
      const mapped = toCamelCase(data) as Content;

      return {
        success: true,
        data: mapped,
      } as const;
    });
  }

  async getAll(params: {
    userId: string;
    query: GetAllContentQuery;
  }): Promise<GetAllContentResult> {
    return await tryCatch(async () => {
      const offset = (params.query.page - 1) * params.query.limit;
      let query = this.supabase
        .from("generated_content")
        .select(
          `
          *,
          modules!generated_content_module_id_fkey(
            id,
            name,
            slug,
            category
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", params.userId)
        .order("created_at", { ascending: false })
        .limit(params.query.limit)
        .range(offset, offset + params.query.limit - 1);

      if (params.query.type && params.query.type !== "all")
        query = query.eq("type", params.query.type);

      const { data, error, count } = await query;

      if (error) {
        this.logger.error("[getAll] failed", error, {
          userId: params.userId,
          limit: params.query.limit,
          offset: params.query.page,
          type: params.query.type,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }

      const mapped = data.map(toCamelCase) as Content[];
      return {
        success: true,
        data: {
          data: mapped,
          pagination: {
            page: params.query.page,
            limit: params.query.limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / params.query.limit),
          },
        },
      } as const;
    });
  }

  async getById(params: {
    userId: string;
    id: string;
  }): Promise<GetContentByIdResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("generated_content")
        .select(
          `
          *,
          modules!generated_content_module_id_fkey(
            id,
            name,
            slug,
            category
          )
        `
        )
        .eq("id", params.id)
        .eq("user_id", params.userId)
        .single();

      if (error) {
        this.logger.error("[getById] failed", error, { params });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }

      if (!data) {
        return {
          success: false,
          kind: "NOT_FOUND",
          error: new Error("not found"),
        } as const;
      }

      const mapped = toCamelCase(data) as Content;
      return {
        success: true,
        data: mapped,
      } as const;
    });
  }

  async update(params: {
    userId: string;
    id: string;
    updateData: Partial<Content>;
  }): Promise<UpdateContentResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("generated_content")
        .update(
          toSnakeCase({
            ...params.updateData,
            updatedAt: new Date().toISOString(),
            metadata: params.updateData.metadata as Json,
          })
        )
        .eq("id", params.id)
        .eq("user_id", params.userId)
        .select()
        .single();

      if (error) {
        this.logger.error("[update] failed", error, { params });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }

      if (!data) {
        return {
          success: false,
          kind: "NOT_FOUND",
          error: new Error("not found"),
        } as const;
      }

      const mapped = toCamelCase(data) as Content;
      return {
        success: true,
        data: mapped,
      } as const;
    });
  }

  async delete(params: {
    userId: string;
    id: string;
  }): Promise<DeleteContentResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase
        .from("generated_content")
        .delete()
        .eq("id", params.id)
        .eq("user_id", params.userId);

      if (error) {
        this.logger.error("[delete] failed", error, {
          userId: params.userId,
          id: params.id,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }

      return {
        success: true,
        data: undefined,
      } as const;
    });
  }

  async submitForApproval(params: {
    userId: string;
    id: string;
  }): Promise<SubmitContentForApprovalResult> {
    return await tryCatch(async () => {
      const { data: content, error: contentError } = await this.supabase
        .from("generated_content")
        .select("id, status")
        .eq("id", params.id)
        .eq("user_id", params.userId)
        .single();

      if (contentError || !content) {
        return {
          success: false,
          kind: "NOT_FOUND",
          error: new Error("not found"),
        } as const;
      }

      if (content.status === "pending") {
        return {
          success: false,
          kind: "ALREADY_SUBMITTED",
          error: new Error("already submitted"),
        } as const;
      }

      // Logic for approval...
      // For now, just returning success
      return {
        success: true,
        data: undefined,
      } as const;
    });
  }

  async getApprovalHistory(params: {
    contentId: string;
  }): Promise<GetContentApprovalHistoryResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("content_approvals")
        .select(
          `
          *,
          approver:profiles(
            id,
            full_name,
            email
          )
        `
        )
        .eq("content_id", params.contentId)
        .order("created_at", { ascending: false });

      if (error) {
        this.logger.error("[getApprovalHistory] failed", error, {
          id: params.contentId,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("unknown error"),
        } as const;
      }

      const mapped = data.map(toCamelCase) as ContentApproval[];
      return {
        success: true,
        data: mapped,
      } as const;
    });
  }
}
