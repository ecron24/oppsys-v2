import type { Result } from "@oppsys/types";
import type {
  GeneratedContent,
  GetGeneratedContentQuery,
  PaginatedGeneratedContent,
} from "./module";

export type GetGeneratedContentHistoryResult = Result<
  PaginatedGeneratedContent,
  Error,
  "UNKNOWN_ERROR"
>;

export type SaveGeneratedContentResult = Result<
  GeneratedContent,
  Error,
  "UNKNOWN_ERROR"
>;

export interface GeneratedContentRepo {
  save(
    content: Omit<GeneratedContent, "id" | "createdAt">
  ): Promise<SaveGeneratedContentResult>;
  getHistoryByUserId(
    userId: string,
    query: GetGeneratedContentQuery
  ): Promise<GetGeneratedContentHistoryResult>;
}
