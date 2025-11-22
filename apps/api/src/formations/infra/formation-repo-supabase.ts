import type { Json, OppSysSupabaseClient } from "@oppsys/supabase";
import type { Logger } from "../../logger/domain/logger";
import type {
  FormationRepo,
  GetFormationByIdResult,
  GetFormationAccessResult,
  CreateFormationAccessResult,
  GetAllFormationsAccessResult,
} from "../domain/formation-repo";
import type { Formation, FormationAccess } from "../domain/formation";
import { tryCatch } from "src/lib/try-catch";
import { toSnakeCase } from "@oppsys/shared";
import { toCamelCase } from "@oppsys/shared";

export class FormationRepoSupabase implements FormationRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async getById(formationId: string): Promise<GetFormationByIdResult> {
    return tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("modules")
        .select("*")
        .eq("id", formationId)
        .eq("category", "formation")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        this.logger.error("[FormationRepo] getById failed", error, {
          formationId,
        });
        return {
          success: false,
          kind: "FORMATION_NOT_FOUND",
          error: error,
        } as const;
      }

      if (!data) {
        return {
          success: false,
          kind: "FORMATION_NOT_FOUND",
          error: new Error("Formation not found"),
        } as const;
      }

      const formation = toCamelCase({
        ...data,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        config: data.config as any,
      }) as Formation;

      return {
        success: true,
        data: formation,
      } as const;
    });
  }

  getAllFormationsAccess(query: {
    userId: string;
  }): Promise<GetAllFormationsAccessResult> {
    return tryCatch(async () => {
      const { data, error } = await this.supabase
        .from("formation_access")
        .select(
          `
          *,
          modules (name, slug)
        `
        )
        .eq("user_id", query.userId);

      if (error) {
        this.logger.error("[FormationRepo] getUserAccess failed", error, {
          query,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to fetch access"),
        } as const;
      }

      const formationsAccess = toCamelCase(data || []) as FormationAccess[];
      return {
        success: true,
        data: formationsAccess,
      } as const;
    });
  }

  async getFormationAccess(query: {
    userId: string;
    formationId?: string;
    levelId?: string;
    formatId?: string;
  }): Promise<GetFormationAccessResult> {
    return tryCatch(async () => {
      let q = this.supabase
        .from("formation_access")
        .select(
          `
          *,
          modules (name, slug)
        `
        )
        .eq("user_id", query.userId);

      if (query.formationId) {
        q = q.eq("module_id", query.formationId);
      }
      if (query.levelId) {
        q = q.eq("level_id", query.levelId);
      }
      if (query.formatId) {
        q = q.eq("format_id", query.formatId);
      }

      const { data, error } = await q.maybeSingle();

      if (error) {
        this.logger.error("[FormationRepo] getUserAccess failed", error, {
          query,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to fetch access"),
        } as const;
      }

      if (!data) {
        return {
          success: false,
          kind: "FORMATION_NOT_FOUND",
          error: new Error("Formation not found"),
        } as const;
      }

      const formationsAccess = toCamelCase(data) as FormationAccess;
      return {
        success: true,
        data: formationsAccess,
      } as const;
    });
  }

  async createAccess(
    access: Omit<FormationAccess, "id" | "accessedAt">
  ): Promise<CreateFormationAccessResult> {
    return tryCatch(async () => {
      const { error } = await this.supabase
        .from("formation_access")
        .insert(toSnakeCase({ ...access, metadata: access.metadata as Json }));

      if (error) {
        this.logger.error("[FormationRepo] createAccess failed", error, {
          access,
        });
        return {
          success: false,
          kind: "UNKNOWN_ERROR",
          error: new Error("Failed to create access"),
        } as const;
      }

      return {
        success: true,
        data: undefined,
      };
    });
  }
}
