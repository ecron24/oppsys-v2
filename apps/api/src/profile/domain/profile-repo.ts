import type { Result } from "@oppsys/types";
import type { CreditCheckResult } from "src/modules/domain/module";
import type { Profile, ProfileWithPlan, UpdateProfile } from "./profile";

export type UpdateProfileResult = Result<
  ProfileWithPlan,
  Error,
  "UPDATE_PROFILE_FAILED"
>;

export type CreateProfileResult = Result<void, Error, "PROFILE_CREATE_FAILED">;
export type GetProfileResult = Result<
  ProfileWithPlan,
  Error,
  "PROFILE_NOT_FOUND"
>;
export type CheckCreditsResult = Result<
  CreditCheckResult,
  Error,
  "UNKNOWN_ERROR" | "PROFILE_NOT_FOUND"
>;
export type DeductCreditsResult = Result<
  void,
  Error,
  "UNKNOWN_ERROR" | "INSUFFICIENT_CREDITS"
>;
export type AddCreditsResult = Result<void, Error, "UNKNOWN_ERROR">;

export interface ProfileRepo {
  create(profile: Profile): Promise<CreateProfileResult>;
  getByIdWithPlan(id: string): Promise<GetProfileResult>;
  checkCredits(
    userId: string,
    requiredCredits: number
  ): Promise<CheckCreditsResult>;
  deductCredits(userId: string, amount: number): Promise<DeductCreditsResult>;
  addCredits(userId: string, amount: number): Promise<AddCreditsResult>;
  update(id: string, profile: UpdateProfile): Promise<UpdateProfileResult>;
}
