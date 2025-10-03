import type { OppSysSupabaseClient } from "@oppsys/supabase";
import type {
  AuthRepo,
  SendMagicLinkResult,
  SignInResult,
  SignOutResult,
  SignUpResult,
} from "src/auth/domain/auth-repo";
import { catchError } from "src/lib/catch-error";
import type { Logger } from "src/logger/domain/logger";
import { UserSchema } from "../domain/user";

export class AuthRepoSupabase implements AuthRepo {
  constructor(
    private supabase: OppSysSupabaseClient,
    private logger: Logger
  ) {}

  async signUp(
    email: string,
    password: string,
    fullName?: string | undefined
  ): Promise<SignUpResult> {
    return await catchError(async () => {
      const { data: authData, error: authError } =
        await this.supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName || "",
            },
          },
        });

      if (authError) {
        this.logger.error("Auth signup error:", authError);
        return {
          success: false,
          error: authError,
          kind: "SIGNUP_FAILED",
        } as const;
      }

      if (!authData.user) {
        return {
          success: false,
          error: new Error("User creation failed"),
          kind: "SIGNUP_FAILED",
        } as const;
      }

      const { data: freePlan } = await this.supabase
        .from("plans")
        .select("*")
        .eq("name", "Free")
        .single();

      const profileData = {
        id: authData.user.id,
        full_name: fullName || null,
        role: "client",
        plan_id: freePlan?.id || null,
        credit_balance: freePlan?.monthly_credits || 300,
        language: "fr",
        timezone: "Europe/Paris",
      } as const;

      const { error: profileError } = await this.supabase
        .from("profiles")
        .insert(profileData);

      if (profileError) {
        this.logger.error("Profile creation error:", profileError);
        await this.supabase.auth.admin.deleteUser(authData.user.id);

        return {
          success: false,
          error: profileError,
          kind: "SIGNUP_FAILED",
        } as const;
      }

      return {
        success: true,
        data: {
          id: authData.user.id,
          email: authData.user.email!,
          fullName: authData.user.user_metadata.full_name,
          role: "client",
          planId: freePlan?.id || undefined,
          creditBalance: freePlan?.monthly_credits || 300,
          language: "fr",
          timezone: "Europe/Paris",
        },
      } as const;
    });
  }

  async signIn(email: string, password: string): Promise<SignInResult> {
    return await catchError(async () => {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        this.logger.error("Auth signin error:", error);
        return {
          success: false,
          error: error,
          kind: "SIGNIN_FAILED",
        } as const;
      }

      const { error: profileError } = await this.supabase
        .from("profiles")
        .select(
          `
        *,
        plans (
          name,
          monthly_credits,
          price_cents
        )
      `
        )
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        this.logger.error("Profile fetch error:", profileError);
        return {
          success: false,
          error: profileError,
          kind: "SIGNIN_FAILED",
        } as const;
      }

      return {
        success: true,
        data: UserSchema.parse(data),
      } as const;
    });
  }

  async sendMagicLink(
    email: string,
    redirectTo?: string | undefined
  ): Promise<SendMagicLinkResult> {
    return await catchError(async () => {
      const { error } = await this.supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
        },
      });

      if (error) {
        this.logger.error("Magic link error:", error);
        return {
          success: false,
          error: error,
          kind: "MAGIC_LINK_FAILED",
        } as const;
      }

      return {
        success: true,
        data: undefined,
      } as const;
    });
  }

  async signOut(): Promise<SignOutResult> {
    return await catchError(async () => {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        this.logger.error("Signout error:", error);
        return {
          success: false,
          error: error,
          kind: "SIGNOUT_FAILED",
        } as const;
      }
      return {
        success: true,
        data: undefined,
      } as const;
    });
  }
}
