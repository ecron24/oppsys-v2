import { authService } from "./auth-service";
import { userService } from "./user-service";

export const twoFactorService = {
  verifyTOTP: async (params: {
    verificationCode: string;
    factorId: string;
  }) => {
    if (!(params.verificationCode.length !== 6)) {
      return {
        success: false,
        error: "Code à 6 chiffres requis",
      } as const;
    }

    const challengeResult = await authService.challengeMfa({
      factorId: params.factorId,
    });
    if (!challengeResult.success) return challengeResult;
    if (!challengeResult.data) {
      return {
        success: false,
        error: "Échec de la création du challenge MFA",
      } as const;
    }

    const verifyResult = await authService.verifyMfa({
      factorId: params.factorId,
      challengeId: challengeResult.data.id,
      code: params.verificationCode,
    });
    if (!verifyResult.success) return verifyResult;

    const updateResult = await userService.updateProfile({
      twofaEnabled: true,
    });
    return updateResult;
  },

  disableMfa: async () => {
    const listFactorsResult = await authService.listFactorsMfa();
    if (!listFactorsResult.success) return listFactorsResult;

    const factorsData = listFactorsResult.data;
    const totpFactor = factorsData?.totp?.find(
      (factor) => factor.status === "verified"
    );
    if (totpFactor) {
      const unenrollResult = await authService.unenroll({
        factorId: totpFactor.id,
      });
      if (!unenrollResult.success) return unenrollResult;
    }

    const updateResult = await userService.updateProfile({
      twofaEnabled: false,
    });

    return updateResult;
  },
};
