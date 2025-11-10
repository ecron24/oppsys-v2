// src/components/account/TwoFactorAuthSetup.jsx - VERSION SANS TRADUCTIONS
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  RefreshCw,
} from "lucide-react";

const TwoFactorAuthSetup = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [factorId, setFactorId] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // Vérifier le statut 2FA
  useEffect(() => {
    const check2FAStatus = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("twofa_enabled")
          .eq("id", userId)
          .single();

        if (error) throw error;
        setIs2FAEnabled(data?.twofa_enabled || false);
      } catch (err) {
        console.error("Error checking 2FA status:", err);
        setError("Erreur lors de la vérification du statut 2FA");
      } finally {
        setLoading(false);
      }
    };

    check2FAStatus();
  }, [userId]);

  const startMFAEnrollment = async () => {
    try {
      setEnrolling(true);
      setError(null);
      setSuccess(null);

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "My App",
      });

      if (error) throw error;

      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
    } catch (err) {
      console.error("Error starting MFA enrollment:", err);
      setError(err.message || "Erreur lors de la configuration 2FA");
    } finally {
      setEnrolling(false);
    }
  };

  const verifyTOTP = async () => {
    try {
      setVerifying(true);
      setError(null);
      setSuccess(null);

      if (!verificationCode || verificationCode.length !== 6) {
        throw new Error("Code à 6 chiffres requis");
      }

      if (!factorId) {
        throw new Error("ID de facteur manquant");
      }

      const { data: challengeData, error: challengeError } =
        await supabase.auth.mfa.challenge({
          factorId: factorId,
        });

      if (challengeError) throw challengeError;

      const { data: verifyData, error: verifyError } =
        await supabase.auth.mfa.verify({
          factorId: factorId,
          challengeId: challengeData.id,
          code: verificationCode,
        });

      if (verifyError) throw verifyError;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ twofa_enabled: true })
        .eq("id", userId);

      if (updateError) throw updateError;

      setIs2FAEnabled(true);
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setVerificationCode("");
      setSuccess("Authentification à deux facteurs activée avec succès !");
    } catch (err) {
      console.error("Error verifying TOTP:", err);
      setError(err.message || "Erreur lors de la vérification");
    } finally {
      setVerifying(false);
    }
  };

  const disableMFA = async () => {
    const confirmText =
      "Êtes-vous sûr de vouloir désactiver l'authentification à deux facteurs ? Cela réduit la sécurité de votre compte.";

    if (!window.confirm(confirmText)) {
      return;
    }

    try {
      setDisabling(true);
      setError(null);
      setSuccess(null);

      const { data: factorsData, error: factorsError } =
        await supabase.auth.mfa.listFactors();
      if (factorsError) throw factorsError;

      const totpFactor = factorsData?.totp?.find(
        (factor) => factor.status === "verified"
      );
      if (totpFactor) {
        const { error: unenrollError } = await supabase.auth.mfa.unenroll({
          factorId: totpFactor.id,
        });
        if (unenrollError) throw unenrollError;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ twofa_enabled: false })
        .eq("id", userId);

      if (updateError) throw updateError;

      setIs2FAEnabled(false);
      setSuccess("Authentification à deux facteurs désactivée");
    } catch (err) {
      console.error("Error disabling 2FA:", err);
      setError(err.message || "Erreur lors de la désactivation");
    } finally {
      setDisabling(false);
    }
  };

  const resetError = () => setError(null);
  const resetSuccess = () => setSuccess(null);

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center justify-center py-6">
          <RefreshCw className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
          <span className="text-muted-foreground">
            Chargement des paramètres d'authentification...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-gradient-to-br from-primary to-orange-600 p-3">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground">
            Authentification à deux facteurs
          </h3>
        </div>
        {(error || success) && (
          <button
            onClick={error ? resetError : resetSuccess}
            className="text-muted-foreground transition-colors hover:text-card-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex items-center">
            <AlertCircle className="mr-3 h-5 w-5 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">Erreur</p>
              <p className="mt-1 text-sm text-destructive/80">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center">
            <CheckCircle className="mr-3 h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">Succès</p>
              <p className="mt-1 text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {is2FAEnabled ? (
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-card-foreground">
                Authentification à deux facteurs activée
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Votre compte est protégé par une couche de sécurité
                supplémentaire.
              </p>
            </div>
          </div>

          <button
            onClick={disableMFA}
            disabled={disabling}
            className="inline-flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 disabled:cursor-not-allowed disabled:opacity-50"
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
          </button>
        </div>
      ) : qrCode ? (
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="mb-4 text-card-foreground">
                <span className="font-semibold">Étape 1:</span>{" "}
                <span className="text-muted-foreground">
                  Scannez ce code QR avec votre application d'authentification
                  (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                </span>
              </p>

              <div className="mb-4 flex items-center justify-center rounded-lg border border-border bg-white p-6">
                <img
                  src={qrCode}
                  alt="QR Code pour l'authentification à deux facteurs"
                  className="max-h-[200px] max-w-[200px]"
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
              <label
                htmlFor="verificationCode"
                className="mb-3 block text-sm font-medium text-card-foreground"
              >
                <span className="font-semibold">Étape 2:</span>{" "}
                <span className="text-muted-foreground">
                  Entrez le code de vérification à 6 chiffres
                </span>
              </label>
              <div className="flex space-x-3">
                <input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6)
                    )
                  }
                  placeholder="123456"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={6}
                  disabled={verifying}
                />
                <button
                  onClick={verifyTOTP}
                  disabled={verifying || verificationCode.length !== 6}
                  className="rounded-lg bg-gradient-to-r from-primary to-orange-600 px-6 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {verifying ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Vérification...
                    </div>
                  ) : (
                    "Vérifier"
                  )}
                </button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Saisissez le code à 6 chiffres affiché dans votre application
                d'authentification.
              </p>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <button
              onClick={() => {
                setQrCode(null);
                setSecret(null);
                setFactorId(null);
                setVerificationCode("");
              }}
              className="text-sm text-muted-foreground underline transition-colors hover:text-card-foreground"
            >
              Annuler la configuration
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="mb-3 text-card-foreground">
              L'authentification à deux facteurs (2FA) ajoute une couche
              supplémentaire de sécurité à votre compte.
            </p>
            <p className="text-sm text-muted-foreground">
              Une fois activée, vous devrez fournir à la fois votre mot de passe
              et un code unique généré par une application d'authentification
              pour accéder à votre compte.
            </p>
          </div>

          <button
            onClick={startMFAEnrollment}
            disabled={enrolling}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
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
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuthSetup;
