import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { ListModuleSchema, type ListModulesQuery } from "../domain/module";
import type { GetModulesResult, ModuleRepo } from "../domain/module-repo";

export class ModuleRepoSupabase implements ModuleRepo {
  constructor(private supabase: OppSysSupabaseClient) {}

  async getAll(query: ListModulesQuery): Promise<GetModulesResult> {
    try {
      let query = this.supabase.from("modules").select(
        `
          id,
          name,
          slug,
          type,
          credit_cost,
          description,
          is_active,
          created_at,
          config,
          category
        `,
        { count: "exact" }
      );
      const { data: modules, error } = await query;

      if (error) {
        return {
          success: false,
          error: error,
          kind: "UNKNOWN_ERROR",
        };
      }

      return {
        success: true,
        data: ListModuleSchema.parse(modules || []),
      };
    } catch (error) {
      console.error("[]", error);
      return {
        success: false,
        error: error as Error,
        kind: "UNKNOWN_ERROR",
      };
    }
  }
}
