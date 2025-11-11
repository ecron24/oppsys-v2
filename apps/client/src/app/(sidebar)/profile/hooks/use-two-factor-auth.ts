import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/components/auth/services/auth-service";
import { twoFactorService } from "@/components/auth/services/two-factor-service";

export function useTwoFactorAuth() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);

  const enroll = useMutation({
    mutationFn: () =>
      authService.enrollMfa({
        factorType: "totp",
        friendlyName: "My App",
      }),
    onSuccess: (result) => {
      if (result.success) {
        setQrCode(result.data.totp.qrCode);
        setSecret(result.data.totp.secret);
        setFactorId(result.data.id);
      }
    },
  });

  const verify = useMutation({
    mutationFn: (verificationCode: string) =>
      twoFactorService.verifyTOTP({
        factorId: factorId!,
        verificationCode,
      }),
    onSuccess: (result) => {
      if (result.success) {
        setQrCode(null);
        setSecret(null);
        setFactorId(null);
      }
    },
  });

  const disable = useMutation({
    mutationFn: () => twoFactorService.disableMfa(),
  });

  return {
    qrCode,
    secret,
    factorId,

    enrolling: enroll.isPending,
    verifying: verify.isPending,
    disabling: disable.isPending,

    startEnrollment: () => enroll.mutateAsync(),
    verifyTOTP: (code: string) => verify.mutateAsync(code),
    disableMFA: () => disable.mutateAsync(),
  };
}
