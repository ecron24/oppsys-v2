import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type {
  GeneratedContentRepo,
  GetGeneratedContentHistoryResult,
  SaveGeneratedContentResult,
} from "../domain/generated-content-repo";
import { tryCatch } from "src/lib/try-catch";
import { toCamelCase } from "src/lib/to-camel-case";
import {
  GeneratedContentSchema,
  type GeneratedContent,
  type GetGeneratedContentQuery,
} from "../domain/module";
import z from "zod";

export class GeneratedContentRepoSupabase implements GeneratedContentRepo {
  constructor(private supabase: OppSysSupabaseClient) {}

  async save(
    content: Omit<GeneratedContent, "id" | "createdAt">
  ): Promise<SaveGeneratedContentResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("generated_content")
        .insert({
          user_id: content.userId,
          module_id: content.moduleId,
          module_slug: content.moduleSlug,
          title: content.title,
          type: content.type,
          content: content.content,
          url: content.url,
          metadata: content.metadata,
          status: content.status || "draft",
        })
        .select()
        .single();

      if (error) throw error;

      const mapped: GeneratedContent = toCamelCase(data);

      return { success: true as const, data: mapped };
    });
  }

  async getHistoryByUserId(
    userId: string,
    query: GetGeneratedContentQuery
  ): Promise<GetGeneratedContentHistoryResult> {
    return await tryCatch(async () => {
      const offset = (query.page - 1) * query.limit;

      let supabaseQuery = this.supabase
        .from("generated_content")
        .select(
          `
            *,
            modules (
              name,
              type
            )
          `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (query.type) {
        supabaseQuery = supabaseQuery.eq("type", query.type);
      }

      const { data, error, count } = await supabaseQuery.range(
        offset,
        offset + query.limit - 1
      );

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: {
          data: z.array(GeneratedContentSchema).parse(data.map(toCamelCase)),
          pagination: {
            page: query.page,
            limit: query.limit,
            total: count || 0,
            pages: Math.ceil((count || 0) / query.limit),
          },
        },
      };
    });
  }
}
