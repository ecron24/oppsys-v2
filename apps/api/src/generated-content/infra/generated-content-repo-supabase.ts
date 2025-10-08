import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type { GeneratedContent } from "../../modules/domain/module";
import type {
  GeneratedContentRepo,
  SaveGeneratedContentResult,
} from "../domain/generated-content-repo";
import { tryCatch } from "src/lib/try-catch";
import { toCamelCase } from "src/lib/to-camel-case";

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
}
