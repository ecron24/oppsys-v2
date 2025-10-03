import type { OppSysSupabaseClient } from "@oppsys/supabase";
import { ListModuleSchema, type ListModulesQuery } from "../domain/module";
import type { GetModulesResult, ModuleRepo } from "../domain/module-repo";
import { catchError } from "src/lib/catch-error";
import type { Logger } from "src/logger/domain/logger";

export class ModuleRepoSupabase implements ModuleRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async getAll(query: ListModulesQuery): Promise<GetModulesResult> {
    this.logger.debug("ListModulesQuery", query);
    return await catchError(async () => {
      const select = this.supabase.from("modules").select(
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
      const { data: modules, error } = await select;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: ListModuleSchema.parse(modules || []),
      } as const;
    });
  }
}
