import type { Result } from "@oppsys/types";
import type { GeneratedContent } from "./module";

export type SaveGeneratedContentResult = Result<
  GeneratedContent,
  Error,
  "UNKNOWN_ERROR"
>;

export interface GeneratedContentRepo {
  save(
    content: Omit<GeneratedContent, "id" | "createdAt">
  ): Promise<SaveGeneratedContentResult>;
}
