import type { Result } from "@oppsys/types";
import type {
  Content,
  ContentApproval,
  ContentStats,
  PaginatedContent,
  SearchFilters,
} from "./content";
import type { GetAllContentQuery } from "../app/get-all-content-use-case";

export type GetContentStatsResult = Result<
  ContentStats,
  Error,
  "UNKNOWN_ERROR"
>;
export type SearchContentResult = Result<Content[], Error, "UNKNOWN_ERROR">;
export type CreateContentResult = Result<Content, Error, "UNKNOWN_ERROR">;
export type GetAllContentResult = Result<
  PaginatedContent,
  Error,
  "UNKNOWN_ERROR"
>;
export type GetContentByIdResult = Result<
  Content | null,
  Error,
  "UNKNOWN_ERROR" | "NOT_FOUND"
>;
export type UpdateContentResult = Result<
  Content,
  Error,
  "UNKNOWN_ERROR" | "NOT_FOUND"
>;
export type DeleteContentResult = Result<
  void,
  Error,
  "UNKNOWN_ERROR" | "NOT_FOUND"
>;
export type SubmitContentForApprovalResult = Result<
  void,
  Error,
  "UNKNOWN_ERROR" | "NOT_FOUND" | "ALREADY_SUBMITTED"
>;
export type GetContentApprovalHistoryResult = Result<
  ContentApproval[],
  Error,
  "UNKNOWN_ERROR"
>;

export interface ContentRepo {
  getStats(params: {
    userId: string;
    period: "week" | "month" | "year";
  }): Promise<GetContentStatsResult>;

  search(params: {
    userId: string;
    query: string;
    filters: SearchFilters;
  }): Promise<SearchContentResult>;

  create(params: {
    userId: string;
    contentData: Omit<Content, "id" | "userId" | "createdAt">;
  }): Promise<CreateContentResult>;

  getAll(params: {
    userId: string;
    query: GetAllContentQuery;
  }): Promise<GetAllContentResult>;

  getById(params: {
    userId: string;
    id: string;
  }): Promise<GetContentByIdResult>;

  update(params: {
    userId: string;
    id: string;
    updateData: Partial<Content>;
  }): Promise<UpdateContentResult>;

  delete(params: { userId: string; id: string }): Promise<DeleteContentResult>;

  submitForApproval(params: {
    userId: string;
    id: string;
  }): Promise<SubmitContentForApprovalResult>;

  getApprovalHistory(params: {
    contentId: string;
  }): Promise<GetContentApprovalHistoryResult>;
}
