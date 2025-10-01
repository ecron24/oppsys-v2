import type { ListModulesQuery, Module } from "./module";

export type GetModulesResult =
  | { success: true; data: Module[] }
  | { success: false; kind: "UNKNOWN_ERROR"; error: Error };

export interface ModuleRepo {
  getAll(query: ListModulesQuery): Promise<GetModulesResult>;
}
