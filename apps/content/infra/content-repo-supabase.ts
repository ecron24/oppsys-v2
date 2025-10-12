import type {
  ContentRepo,
  GetContentStatsResult,
  SearchContentResult,
  CreateContentResult,
  GetAllContentResult,
  GetContentByIdResult,
  UpdateContentResult,
  DeleteContentResult,
  SubmitContentForApprovalResult,
  GetContentApprovalHistoryResult,
  ToggleContentFavoriteResult,
} from "../domain/content-repo";
import type { Content } from "../domain/content";
import { supabase } from "src/lib/supabase";
import { ContentSchema } from "../domain/content";
import { tryCatch } from "src/lib/try-catch";

export class ContentRepoSupabase implements ContentRepo {
  async getStats(params: {
    userId: string;
    period: "week" | "month" | "year";
  }): Promise<GetContentStatsResult> {
    return tryCatch(async () => {
      // Implement stats query here
      return {
        success: true,
        data: {
          total: 0,
          favorites: 0,
          byType: {
            article: 0,
            audio: 0,
            video: 0,
            image: 0,
            data: 0,
            "social-post": 0,
          },
          byModule: {},
        },
      };
    });
  }

  async search(params: {
    userId: string;
    query: string;
    filters: any;
  }): Promise<SearchContentResult> {
    return tryCatch(async () => {
      // Implement search query here
      return { success: true, data: [] };
    });
  }

  async create(params: {
    userId: string;
    contentData: Omit<Content, "id" | "userId" | "createdAt">;
  }): Promise<CreateContentResult> {
    return tryCatch(async () => {
      const { userId, contentData } = params;
      const { data, error } = await supabase
        .from("generated_content")
        .insert([
          {
            ...contentData,
            user_id: userId,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data: ContentSchema.parse(data) };
    });
  }

  async getAll(params: {
    userId: string;
    limit: number;
    offset: number;
    type?: string;
  }): Promise<GetAllContentResult> {
    return tryCatch(async () => {
      const { userId, limit, offset, type } = params;
      let query = supabase
        .from("generated_content")
        .select("*")
        .eq("user_id", userId)
        .limit(limit)
        .offset(offset);

      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { success: true, data: ContentSchema.array().parse(data) };
    });
  }

  async getById(params: {
    userId: string;
    id: string;
  }): Promise<GetContentByIdResult> {
    return tryCatch(async () => {
      const { userId, id } = params;
      const { data, error } = await supabase
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
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data: ContentSchema.parse(data) };
    });
  }

  async update(params: {
    userId: string;
    id: string;
    updateData: Partial<Content>;
  }): Promise<UpdateContentResult> {
    return tryCatch(async () => {
      const { userId, id, updateData } = params;
      const { data, error } = await supabase
        .from("generated_content")
        .update({ ...updateData, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data: ContentSchema.parse(data) };
    });
  }

  async delete(params: {
    userId: string;
    id: string;
  }): Promise<DeleteContentResult> {
    return tryCatch(async () => {
      const { userId, id } = params;
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      return { success: true };
    });
  }

  async submitForApproval(params: {
    userId: string;
    id: string;
  }): Promise<SubmitContentForApprovalResult> {
    return tryCatch(async () => {
      const { userId, id } = params;
      const { data, error } = await supabase
        .from("generated_content")
        .select("id, status")
        .eq("id", id)
        .eq("user_id", userId)
        .single();

      if (error || !data) {
        return {
          success: false,
          kind: "NOT_FOUND",
          error: new Error("Content not found"),
        };
      }

      if (data.status === "pending") {
        return {
          success: false,
          kind: "ALREADY_SUBMITTED",
          error: new Error("Content already submitted for approval"),
        };
      }

      // Approval logic can be added here

      return { success: true };
    });
  }

  async getApprovalHistory(params: {
    id: string;
  }): Promise<GetContentApprovalHistoryResult> {
    return tryCatch(async () => {
      const { id } = params;
      const { data, error } = await supabase
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
        .eq("content_id", id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return { success: true, data: data || [] };
    });
  }

  async toggleFavorite(params: {
    userId: string;
    id: string;
    isFavorite: boolean;
  }): Promise<ToggleContentFavoriteResult> {
    return tryCatch(async () => {
      const { userId, id, isFavorite } = params;
      const { data, error } = await supabase
        .from("generated_content")
        .update({
          is_favorite: isFavorite,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return { success: true, data: ContentSchema.parse(data) };
    });
  }
}
