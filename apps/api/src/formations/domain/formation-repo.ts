import type { Result } from "@oppsys/types";
import type { Formation, FormationAccess } from "./formation";

export type GetFormationByIdResult = Result<
  Formation,
  Error,
  "UNKNOWN_ERROR" | "FORMATION_NOT_FOUND"
>;

export type GetFormationAccessResult = Result<
  FormationAccess,
  Error,
  "UNKNOWN_ERROR" | "FORMATION_NOT_FOUND"
>;

export type GetAllFormationsAccessResult = Result<
  FormationAccess[],
  Error,
  "UNKNOWN_ERROR"
>;

export type CreateFormationAccessResult = Result<void, Error, "UNKNOWN_ERROR">;

export interface FormationRepo {
  getById(id: string): Promise<GetFormationByIdResult>;
  getFormationAccess(query: {
    userId: string;
    formationId: string;
    levelId: string;
    formatId: string;
  }): Promise<GetFormationAccessResult>;
  getAllFormationsAccess(query: {
    userId: string;
  }): Promise<GetAllFormationsAccessResult>;
  createAccess(
    access: Omit<FormationAccess, "id" | "accessedAt">
  ): Promise<CreateFormationAccessResult>;
}
