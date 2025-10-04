import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type {
  AuthRepo,
  SendMagicLinkResult,
  SignInResult,
  SignOutResult,
  SignUpResult,
} from "src/auth/domain/auth-repo";
import { tryCatch } from "src/lib/try-catch";
import type { Logger } from "src/logger/domain/logger";

export class AuthRepoSupabase implements AuthRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async signUp(
    email: string,
    password: string,
    fullName?: string
  ): Promise<SignUpResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName || "" } },
      });

      if (error) {
        this.logger.error("Auth signup error:", error);
        return { success: false, error, kind: "SIGNUP_FAILED" } as const;
      }

      if (!data.user) {
        return {
          success: false,
          error: new Error("User creation failed"),
          kind: "SIGNUP_FAILED",
        } as const;
      }

      return {
        success: true,
        data: {
          user: {
            id: data.user.id,
          },
          session: data.session,
        },
      } as const;
    });
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    return await tryCatch(async () => {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error("Auth signin error:", error);
        return { success: false, error, kind: "SIGNIN_FAILED" } as const;
      }

      if (!data.user) {
        return {
          success: false,
          error: new Error("User sign-in failed"),
          kind: "SIGNIN_FAILED",
        } as const;
      }

      return {
        success: true,
        data: {
          user: {
            id: data.user.id,
          },
          session: data.session,
        },
      } as const;
    });
  }

  async sendMagicLink(
    email: string,
    redirectTo?: string
  ): Promise<SendMagicLinkResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        this.logger.error("Magic link error:", error);
        return { success: false, error, kind: "MAGIC_LINK_FAILED" } as const;
      }
      return { success: true, data: undefined } as const;
    });
  }

  async signOut(): Promise<SignOutResult> {
    return await tryCatch(async () => {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        this.logger.error("Signout error:", error);
        return { success: false, error, kind: "SIGNOUT_FAILED" } as const;
      }
      return { success: true, data: undefined } as const;
    });
  }
}
