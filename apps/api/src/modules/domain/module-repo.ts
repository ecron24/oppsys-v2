import type { Result } from "@oppsys/types";
import type { ListModulesQuery, Module } from "./module";

export type GetModulesResult = Result<Module[], Error, "UNKNOWN_ERROR">;

export interface ModuleRepo {
  getAll(query: ListModulesQuery): Promise<GetModulesResult>;
}
