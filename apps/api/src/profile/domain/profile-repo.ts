import type { Result } from "@oppsys/types";
import type { Profile, ProfileWithPlan } from "./profile";

export type CreateProfileResult = Result<void, Error, "PROFILE_CREATE_FAILED">;
export type GetProfileResult = Result<
  ProfileWithPlan,
  Error,
  "PROFILE_NOT_FOUND"
>;

export interface ProfileRepo {
  create(profile: Profile): Promise<CreateProfileResult>;
  getByIdWithPlan(id: string): Promise<GetProfileResult>;
}
