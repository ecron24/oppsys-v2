import { handleApiCall } from "@/lib/handle-api-call";
import { supabase } from "@/lib/supabase";
import { honoClient } from "@/lib/hono-client";
import type { ApiResponse } from "@oppsys/types";
import type { AuthChangeEvent, AuthSession, Provider } from "@oppsys/supabase";
import { toCamelCase } from "@/lib/to-camel-case";

export const authService = {
  async signInWithPassword(email: string, password: string) {
    return handleApiCall(
      await honoClient.api.auth.signin.$post({ json: { email, password } })
    );
  },

  async signUp(
    email: string,
    password: string,
    userData: { fullName?: string } = {}
  ) {
    return handleApiCall(
      await honoClient.api.auth.signup.$post({
        json: { email, password, fullName: userData.fullName },
      })
    );
  },

  async signOut(): Promise<ApiResponse<void>> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[signOut]: ", error);
      return {
        success: false,
        error: "Signout error",
        details: error.message,
        status: 500,
      };
    }
    return {
      success: true,
      data: undefined,
      status: 200,
    };
  },

  async resetPasswordForEmail(
    email: string,
    redirectTo: string
  ): Promise<ApiResponse<void>> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      console.error("[resetPasswordForEmail]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: undefined,
      status: 200,
    } as const;
  },

  async updatePasswordUser(newPassword: string): Promise<ApiResponse<void>> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      console.error("[updatePasswordUser]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: undefined,
      status: 200,
    } as const;
  },

  async signInWithOAuth(
    provider: Provider,
    redirectTo: string
  ): Promise<ApiResponse<void>> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      console.error("[signInWithOAuth]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: undefined,
      status: 200,
    } as const;
  },

  async signInWithOtp(email: string, redirectTo: string) {
    return handleApiCall(
      await honoClient.api.auth["magic-link"].$post({
        json: { email, redirectTo },
      })
    );
  },

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: AuthSession | null) => void
  ) {
    return supabase.auth.onAuthStateChange(callback);
  },

  async verifyOtp(params: { email: string; otp: string }) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: params.email,
      token: params.otp,
      type: "email" as const,
    });
    if (error) {
      console.error("[verifyOtp]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: toCamelCase(data),
      status: 200,
    } as const;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("[getSession]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data.session ? toCamelCase(data.session) : null,
      status: 200,
    } as const;
  },
};
