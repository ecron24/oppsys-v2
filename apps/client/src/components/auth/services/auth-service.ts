import { handleApiCall } from "@/lib/handle-api-call";
import { supabase } from "@/lib/supabase";
import { honoClient } from "@/lib/hono-client";
import type { ApiResponse } from "@oppsys/shared";
import type {
  AuthChangeEvent,
  AuthSession,
  Provider,
  MFAEnrollParams,
  MFAVerifyParams,
  MFAChallengeParams,
  MFAUnenrollParams,
} from "@oppsys/supabase";
import { toCamelCase } from "@oppsys/shared";

export const authService = {
  async signInWithPassword(params: { email: string; password: string }) {
    const { error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });
    if (error) {
      console.error("[signInWithPassword]: ", error, { params });
      return {
        success: false,
        error: "signInWithPassword error",
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: undefined,
      status: 200,
    } as const;
    // return handleApiCall(
    //   await honoClient.api.auth.signin.$post({
    //     json: { email: params.email, password: params.password },
    //   })
    // );
  },

  async signUp(params: { email: string; password: string; fullName?: string }) {
    const { error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: { data: { full_name: params.fullName || "" } },
    });
    if (error) {
      console.error("[signOut]: ", error, { params });
      return {
        success: false,
        error: "signUp error",
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: undefined,
      status: 200,
    } as const;
    // return handleApiCall(
    //   await honoClient.api.auth.signup.$post({
    //     json: {
    //       email: params.email,
    //       password: params.email,
    //       fullName: params.fullName,
    //     },
    //   })
    // );
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
      } as const;
    }
    return {
      success: true,
      data: undefined,
      status: 200,
    } as const;
  },

  async resetPasswordForEmail(
    email: string,
    redirectTo: string
  ): Promise<ApiResponse<void>> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) {
      console.error("[resetPasswordForEmail]: ", error, { email, redirectTo });
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
      console.error("[updatePasswordUser]: ", error, { newPassword });
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
      console.error("[signInWithOAuth]: ", error, { provider, redirectTo });
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
      console.error("[verifyOtp]: ", error, { params });
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: {
        user: data.user ? toCamelCase(data.user) : null,
        session: data.session ? toCamelCase(data.session) : null,
      },
      status: 200,
    } as const;
  },

  async enrollMfa(params: MFAEnrollParams) {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "My App",
    });
    if (error) {
      console.error("[enrollMfa]: ", error, { params });
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

  async verifyMfa(params: MFAVerifyParams) {
    const { data, error } = await supabase.auth.mfa.verify(params);
    if (error) {
      console.error("[verifyMfa]: ", error, { params });
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data ? toCamelCase(data) : null,
      status: 200,
    } as const;
  },

  async challengeMfa(params: MFAChallengeParams) {
    const { data, error } = await supabase.auth.mfa.challenge(params);
    if (error) {
      console.error("[challengeMfa]: ", error, { params });
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data ? toCamelCase(data) : null,
      status: 200,
    } as const;
  },

  async listFactorsMfa() {
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      console.error("[listFactors]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data ? toCamelCase(data) : null,
      status: 200,
    } as const;
  },

  async unenroll(params: MFAUnenrollParams) {
    const { data, error } = await supabase.auth.mfa.unenroll(params);
    if (error) {
      console.error("[listFactors]: ", error);
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data ? toCamelCase(data) : null,
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

  refreshSession: async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("[refreshToken]: ", error);
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

  async exchangeCodeForSession(code: string) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[exchangeCodeForSession]: ", error);
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
