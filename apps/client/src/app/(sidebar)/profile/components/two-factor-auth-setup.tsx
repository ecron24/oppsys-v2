import { useState } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";
import type { User } from "@/components/auth/auth-types";
import { Button } from "@oppsys/ui/components/button";
import { H4, P } from "@oppsys/ui/components/typography";
import { Input } from "@oppsys/ui/components/input";
import { Label } from "@oppsys/ui/components/label";
import { toast } from "@oppsys/ui/lib/sonner";
import { authService } from "@/components/auth/services/auth-service";
import { twoFactorService } from "@/components/auth/services/two-factor-service";

export const TwoFactorAuthSetup = ({ user }: TwoFactorAuthSetupProps) => {
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const is2FAEnabled = user.twofaEnabled || false;

  const startMFAEnrollment = async () => {
    setEnrolling(true);
    setError(null);
    setSuccess(null);

    const result = await authService.enrollMfa({
      factorType: "totp",
      friendlyName: "My App",
    });
    setEnrolling(false);

    if (result.success) {
      setQrCode(result.data.totp.qrCode);
      setSecret(result.data.totp.secret);
      setFactorId(result.data.id);
      return;
    }
    setError(result.error);
  };

  const verifyTOTP = async () => {
    setVerifying(true);
    setError(null);
    setSuccess(null);
    if (!factorId) {
      toast.error("ID de facteur manquant");
      return;
    }
    const verifyResult = await twoFactorService.verifyTOTP({
      factorId,
      verificationCode,
    });
    setVerifying(false);
    if (verifyResult.success) {
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerificationCode("");
      setSuccess("Authentification à deux facteurs activée avec succès !");
      return;
    }

    setError(verifyResult.error);
  };

  const disableMFA = async () => {
    const confirmText =
      "Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ? Cela réduit la sécurité de votre compte.";

    if (!window.confirm(confirmText)) {
      return;
    }

    setDisabling(true);
    setError(null);
    setSuccess(null);
    const result = await twoFactorService.disableMfa();
    setDisabling(false);
    if (result.success) {
      setSuccess("Authentification à deux facteurs désactivée");
      return;
    }

    setError(result.error || "Erreur lors de la désactivation");
  };

  const resetError = () => setError(null);
  const resetSuccess = () => setSuccess(null);

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-primary p-3 rounded-lg">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <H4 className="text-lg font-semibold text-card-foreground">
            Authentification à deux facteurs
          </H4>
        </div>
        {(error || success) && (
          <Button
            onClick={error ? resetError : resetSuccess}
            variant={"ghost"}
            size={"icon"}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-destructive mr-3" />
            <div>
              <p className="text-sm font-medium text-destructive">Erreur</p>
              <p className="text-sm text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Succès</p>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {is2FAEnabled ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <P className="font-medium text-card-foreground mt-1">
                Authentification à deux facteurs activée
              </P>
              <P className="mt-1 text-sm text-muted-foreground">
                Votre compte est protégé par une couche de sécurité
                supplémentaire.
              </P>
            </div>
          </div>

          <Button
            onClick={disableMFA}
            disabled={disabling}
            variant={"destructive-outline"}
          >
            {disabling ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Désactivation en cours...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4" />
                Désactiver l'authentification à deux facteurs
              </>
            )}
          </Button>
        </div>
      ) : qrCode ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <P className="mb-4 text-card-foreground">
                <span className="font-semibold">Étape 1:</span>{" "}
                <span className="text-muted-foreground">
                  Scannez ce code QR avec votre application d'authentification
                  (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                </span>
              </P>

              <div className="bg-white border border-border rounded-lg p-6 flex items-center justify-center mb-4">
                <img
                  src={qrCode}
                  alt="QR Code pour l'authentification à deux facteurs"
                  className="max-w-[200px] max-h-[200px]"
                />
              </div>

              <div className="rounded-lg bg-muted p-4">
                <p className="mb-2 text-sm font-medium text-card-foreground">
                  Code secret (si scan impossible):
                </p>
                <code className="break-all rounded border border-border bg-card px-3 py-2 text-sm text-card-foreground">
                  {secret}
                </code>
              </div>
            </div>

            <div>
              <Label
                htmlFor="verificationCode"
                className="mb-3 block text-sm font-medium text-card-foreground"
              >
                <span className="font-semibold">Étape 2:</span>{" "}
                <span className="text-muted-foreground">
                  Entrez le code de vérification à 6 chiffres
                </span>
              </Label>
              <div className="flex space-x-3">
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="123456"
                  maxLength={6}
                  disabled={verifying}
                />
                <Button
                  onClick={verifyTOTP}
                  disabled={verifying || verificationCode.length !== 6}
                  className="bg-gradient-primary"
                >
                  {verifying ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Vérification...
                    </div>
                  ) : (
                    "Vérifier"
                  )}
                </Button>
              </div>
              <P className="mt-2 text-sm text-muted-foreground">
                Saisissez le code à 6 chiffres affiché dans votre application
                d'authentification.
              </P>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <Button
              onClick={() => {
                setQrCode(null);
                setSecret(null);
                setFactorId(null);
                setVerificationCode("");
              }}
              variant={"muted"}
            >
              Annuler la configuration
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <P className="mb-3 text-card-foreground">
              L'authentification à deux facteurs (2FA) ajoute une couche
              supplémentaire de sécurité à votre compte.
            </P>
            <P className="text-sm text-muted-foreground">
              Une fois activée, vous devrez fournir à la fois votre mot de passe
              et un code unique généré par une application d'authentification
              pour accéder à votre compte.
            </P>
          </div>

          <Button
            onClick={startMFAEnrollment}
            disabled={enrolling}
            className="bg-gradient-primary"
          >
            {enrolling ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Initialisation...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Activer l'authentification à deux facteurs
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

type TwoFactorAuthSetupProps = {
  user: User;
};
