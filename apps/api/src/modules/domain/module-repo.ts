import type { Result } from "src/result-type";
import type { ListModulesQuery, Module } from "./module";

export type GetModulesResult = Result<Module[], Error, "UNKNOWN_ERROR">;

export interface ModuleRepo {
  getAll(query: ListModulesQuery): Promise<GetModulesResult>;
}
