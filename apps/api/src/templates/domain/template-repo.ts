import type { Result } from "@oppsys/utils";
import type {
  RealEstateTemplate,
  CreateTemplateInput,
  UpdateTemplateInput,
  GetTemplatesQuery,
} from "./template";

export type GetTemplatesResult = Result<
  RealEstateTemplate[],
  Error,
  "UNKNOWN_ERROR" | "TEMPLATES_NOT_FOUND"
>;

export type GetTemplateByIdResult = Result<
  RealEstateTemplate,
  Error,
  "UNKNOWN_ERROR" | "TEMPLATE_NOT_FOUND"
>;

export type CreateTemplateResult = Result<
  RealEstateTemplate,
  Error,
  "UNKNOWN_ERROR"
>;

export type UpdateTemplateResult = Result<
  RealEstateTemplate,
  Error,
  "UNKNOWN_ERROR" | "TEMPLATE_NOT_FOUND"
>;

export type DeleteTemplateResult = Result<void, Error, "UNKNOWN_ERROR">;

export interface TemplateRepo {
  getTemplates(query: GetTemplatesQuery): Promise<GetTemplatesResult>;
  getTemplateById(id: string, userId: string): Promise<GetTemplateByIdResult>;
  createTemplate(input: CreateTemplateInput): Promise<CreateTemplateResult>;
  updateTemplate(
    id: string,
    input: UpdateTemplateInput,
    userId: string
  ): Promise<UpdateTemplateResult>;
  deleteTemplate(id: string, userId: string): Promise<DeleteTemplateResult>;
}
