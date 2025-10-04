import type { Result } from "@oppsys/types";
import type { Session, User } from "./user";

export type SignUpResult = Result<
  { user: User; session: Session | null },
  Error,
  "SIGNUP_FAILED"
>;
export type SignInResult = Result<
  { user: User; session: Session | null },
  Error,
  "SIGNIN_FAILED"
>;
export type SendMagicLinkResult = Result<void, Error, "MAGIC_LINK_FAILED">;
export type SignOutResult = Result<void, Error, "SIGNOUT_FAILED">;

export interface AuthRepo {
  signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<SignUpResult>;
  signIn(email: string, password: string): Promise<SignInResult>;
  sendMagicLink(
    email: string,
    redirectTo?: string
  ): Promise<SendMagicLinkResult>;
  signOut(): Promise<SignOutResult>;
}
