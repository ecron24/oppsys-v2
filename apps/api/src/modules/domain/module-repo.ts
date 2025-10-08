import type { Result } from "@oppsys/types";
import type { Module, ModuleUsage } from "./module";
import type { ModuleUsageHistoryQuery } from "../app/get-module-usage-history-use-case";
import type { ListModulesQuery } from "../app/get-modules-use-case";

export type GetModulesResult = Result<
  { data: Module[]; total: number },
  Error,
  "UNKNOWN_ERROR"
>;
export type GetModuleByIdOrSlugResult = Result<
  Module,
  Error,
  "UNKNOWN_ERROR" | "MODULE_NOT_FOUND"
>;
export type GetModuleUsageHistoryResult = Result<
  { data: ModuleUsage[]; total: number },
  Error,
  "UNKNOWN_ERROR"
>;
export type CreateModuleUsageResult = Result<
  ModuleUsage,
  Error,
  "UNKNOWN_ERROR"
>;
export type UpdateModuleUsageResult = Result<void, Error, "UNKNOWN_ERROR">;

export interface ModuleRepo {
  list(query: ListModulesQuery): Promise<GetModulesResult>;
  findByIdOrSlug(idOrSlug: string): Promise<GetModuleByIdOrSlugResult>;
  listUsageHistory(
    userId: string,
    query: ModuleUsageHistoryQuery
  ): Promise<GetModuleUsageHistoryResult>;
  createUsage(
    usage: Omit<ModuleUsage, "id" | "usedAt">
  ): Promise<CreateModuleUsageResult>;
  updateUsage(
    id: string,
    data: Partial<Omit<ModuleUsage, "id">>
  ): Promise<UpdateModuleUsageResult>;
}
