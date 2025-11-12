import { useCompleteProfileForm } from "./hooks/use-complete-profile";
import { getPasswordStrength } from "@/lib/password-utils";
import { H2, H4, P } from "@oppsys/ui";
import {
  User,
  Lock,
  AlertCircle,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function CompleteProfilePage() {
  const { form, error } = useCompleteProfileForm();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-card text-card-foreground rounded-2xl shadow-lg border border-border overflow-hidden">
          <div className="bg-gradient-primary px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <H2 className="text-2xl font-bold text-white mb-2">
              Complétez votre profil
            </H2>
            <P className="text-primary-foreground/80">
              Quelques informations pour finaliser votre compte
            </P>
          </div>

          <div className="p-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-6 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <P className="font-medium">Erreur</P>
                  <P className="text-sm">{error}</P>
                </div>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <form.AppField
                name="fullName"
                children={(field) => (
                  <field.InputField
                    label="Nom complet"
                    iconLeft={
                      <User className="h-5 w-5 text-muted-foreground" />
                    }
                    placeholder="Jean Dupont"
                    required
                  />
                )}
              />

              <div>
                <form.AppField
                  name="password"
                  children={(field) => (
                    <field.InputPasswordField
                      label="Mot de passe"
                      iconLeft={
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      }
                      placeholder="••••••••"
                      required
                    />
                  )}
                />

                {/* Indicateur de force */}
                <form.Subscribe
                  selector={(state) => state.values.password}
                  children={(password) => {
                    if (!password) return null;
                    const passwordStrength = getPasswordStrength(password);
                    return (
                      <div className="mt-3 space-y-2">
                        <div className="flex space-x-1">
                          {[...Array(4)].map((_, i) => (
                            <div
                              key={i}
                              className={`h-2 flex-1 rounded-full ${
                                i < passwordStrength.score
                                  ? passwordStrength.score <= 1
                                    ? "bg-red-500"
                                    : passwordStrength.score <= 2
                                      ? "bg-yellow-500"
                                      : passwordStrength.score <= 3
                                        ? "bg-blue-500"
                                        : "bg-green-500"
                                  : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="mb-1">
                            Force:{" "}
                            {passwordStrength.score <= 1
                              ? "Faible"
                              : passwordStrength.score <= 2
                                ? "Moyenne"
                                : passwordStrength.score <= 3
                                  ? "Bonne"
                                  : "Excellente"}
                          </p>
                          {passwordStrength.issues.length > 0 && (
                            <div className="text-xs">
                              <P>
                                Manque: {passwordStrength.issues.join(", ")}
                              </P>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }}
                />
              </div>

              {/* Champ Confirmer mot de passe */}
              <div>
                <form.AppField
                  name="confirmPassword"
                  children={(field) => (
                    <field.InputPasswordField
                      label="Confirmer le mot de passe"
                      iconLeft={
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      }
                      placeholder="••••••••"
                      required
                    />
                  )}
                />
              </div>

              {/* Bouton Submit */}
              <form.AppForm>
                <form.SubmitButton className="w-full flex items-center justify-center space-x-2 py-3">
                  <span>Finaliser mon compte</span>
                  <ArrowRight className="h-4 w-4" />
                </form.SubmitButton>
              </form.AppForm>
            </form>

            {/* Conseils de sécurité */}
            <div className="mt-8 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <H4 className="font-medium text-card-foreground mb-2">
                    Sécurité de votre compte
                  </H4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Votre mot de passe est chiffré et sécurisé</li>
                    <li>• Vous pourrez le modifier à tout moment</li>
                    <li>
                      • Nous ne stockons jamais vos mots de passe en clair
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <P className="text-xs text-muted-foreground">
            En finalisant votre compte, vous acceptez nos{" "}
            <button className="text-primary hover:text-primary/80 transition-colors underline">
              Conditions d'utilisation
            </button>{" "}
            et notre{" "}
            <button className="text-primary hover:text-primary/80 transition-colors underline">
              Politique de confidentialité
            </button>
          </P>
        </div>
      </div>
    </div>
  );
}
