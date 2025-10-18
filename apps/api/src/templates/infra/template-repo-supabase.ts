import type {
  TemplateRepo,
  GetTemplatesResult,
  GetTemplateByIdResult,
  CreateTemplateResult,
  UpdateTemplateResult,
  DeleteTemplateResult,
} from "../domain/template-repo";
import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { tryCatch } from "src/lib/try-catch";
import {
  RealEstateTemplateSchema,
  type CreateTemplateInput,
  type RealEstateTemplate,
  type UpdateTemplateInput,
} from "../domain/template";
import { toCamelCase } from "src/lib/to-camel-case";
import type { Logger } from "src/logger/domain/logger";

export class TemplateRepoSupabase implements TemplateRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async getTemplates(query: {
    userId: string;
    includePublic?: boolean;
  }): Promise<GetTemplatesResult> {
    return await tryCatch(async () => {
      let selectQuery = this.supabase.from("real_estate_templates").select("*");

      if (query.includePublic) {
        selectQuery = selectQuery.or(
          `is_public.eq.true,user_id.eq.${query.userId}`
        );
      } else {
        selectQuery = selectQuery.eq("user_id", query.userId);
      }

      const { data, error } = await selectQuery.order("created_at", {
        ascending: false,
      });

      if (error) {
        this.logger.error("[getTemplates]: ", error, { query });
        throw error;
      }

      const templates = (data || []).map((item) =>
        RealEstateTemplateSchema.parse(toCamelCase(item) as RealEstateTemplate)
      );

      return {
        success: true,
        data: templates,
      };
    });
  }

  async getTemplateById(
    id: string,
    userId: string
  ): Promise<GetTemplateByIdResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("real_estate_templates")
        .select("*")
        .eq("id", id)
        .or(`is_public.eq.true,user_id.eq.${userId}`)
        .maybeSingle();

      if (error) {
        this.logger.error("[getTemplateById]: ", error, { id, userId });
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "TEMPLATE_NOT_FOUND",
          error: new Error("Template not found"),
        } as const;
      }

      const template = RealEstateTemplateSchema.parse(
        toCamelCase(data) as RealEstateTemplate
      );
      return {
        success: true,
        data: template,
      };
    }, "TEMPLATE_NOT_FOUND");
  }

  async createTemplate(
    input: CreateTemplateInput
  ): Promise<CreateTemplateResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("real_estate_templates")
        .insert({
          user_id: input.userId,
          name: input.name,
          file_path: input.filePath,
          file_size: input.fileSize,
          lease_type: input.leaseType,
          category: input.category || "real_estate",
          is_public: input.isPublic || false,
        })
        .select()
        .single();

      if (error) {
        this.logger.error("[createTemplate]: ", error, { input });
        throw error;
      }

      const template = RealEstateTemplateSchema.parse(
        toCamelCase(data) as RealEstateTemplate
      );
      return {
        success: true,
        data: template,
      };
    }, "TEMPLATE_ALREADY_EXISTS");
  }

  async updateTemplate(
    id: string,
    input: UpdateTemplateInput,
    userId: string
  ): Promise<UpdateTemplateResult> {
    return await tryCatch(async () => {
      const updateData: Record<string, string | boolean> = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.leaseType !== undefined)
        updateData.lease_type = input.leaseType;
      if (input.category !== undefined) updateData.category = input.category;
      if (input.isPublic !== undefined) updateData.is_public = input.isPublic;

      const { data, error } = await this.supabase
        .from("real_estate_templates")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .maybeSingle();

      if (error) {
        this.logger.error("[updateTemplate]: ", error, { id, input, userId });
        throw error;
      }

      if (!data) {
        return {
          success: false,
          kind: "TEMPLATE_NOT_FOUND",
          error: new Error("Template not found"),
        } as const;
      }

      const template = RealEstateTemplateSchema.parse(
        toCamelCase(data) as RealEstateTemplate
      );
      return {
        success: true,
        data: template,
      };
    });
  }

  async deleteTemplate(
    id: string,
    userId: string
  ): Promise<DeleteTemplateResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase
        .from("real_estate_templates")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        this.logger.error("[deleteTemplate]: ", error, { id, userId });
        throw error;
      }

      return {
        success: true,
        data: undefined,
      };
    });
  }
}
