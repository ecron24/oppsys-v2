import { useAuth } from "@/components/auth/hooks/use-auth";
import { useProfile } from "../hooks/use-profile";
import { SecurityFormSchema } from "../profile-types";
import { Lock } from "lucide-react";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import { H3 } from "@oppsys/ui";
import { TwoFactorAuthSetup } from "./two-factor-auth-setup";
import { FieldGroup } from "@oppsys/ui/components/field";

export const SecurityTab = () => {
  const { user } = useAuth();
  const { changePasswordMutation, isChangingPassword } = useProfile();

  const form = useAppForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      await changePasswordMutation.mutateAsync(value);
      form.reset();
    },
    validators: {
      onSubmit: SecurityFormSchema,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <H3 className="mb-4 text-lg font-medium text-card-foreground">
          Changer le mot de passe
        </H3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="max-w-md space-y-4"
        >
          <FieldGroup>
            <form.AppField
              name="currentPassword"
              children={(field) => (
                <field.InputPasswordField
                  label="Mot de passe actuel"
                  placeholder="Votre mot de passe actuel"
                />
              )}
            />

            <form.AppField
              name="newPassword"
              children={(field) => (
                <field.InputPasswordField
                  label="Nouveau mot de passe"
                  placeholder="Votre nouveau mot de passe"
                />
              )}
            />

            <form.AppField
              name="confirmPassword"
              children={(field) => (
                <field.InputPasswordField
                  label="Confirmer le mot de passe"
                  placeholder="Confirmer le nouveau mot de passe"
                />
              )}
            />
          </FieldGroup>

          <form.AppForm>
            <form.SubmitButton
              disabled={isChangingPassword}
              isLoading={isChangingPassword}
              className="flex items-center space-x-2 px-6 py-2"
            >
              <Lock className="h-4 w-4" />
              <span>Changer le mot de passe</span>
            </form.SubmitButton>
          </form.AppForm>
        </form>
      </div>

      {/* Authentification à deux facteurs */}
      <div className="border-t border-border pt-6">
        <H3 className="mb-4 text-lg font-medium text-card-foreground">
          Authentification à deux facteurs
        </H3>
        {user && <TwoFactorAuthSetup user={user} />}
      </div>
    </div>
  );
};
