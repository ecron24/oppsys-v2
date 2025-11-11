import { useAuth } from "@/components/auth/hooks/use-auth";
import { useProfile } from "../hooks/use-profile";
import { GeneralFormSchema, type GeneralForm } from "../profile-types";
import { Save } from "lucide-react";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import { FieldGroup } from "@oppsys/ui/components/field";
import { H3, Input, Label, P } from "@oppsys/ui";

interface GeneralTabProps {
  initialData: GeneralForm;
}

export const GeneralTab = ({ initialData }: GeneralTabProps) => {
  const { user } = useAuth();
  const { updateProfile, isUpdating } = useProfile();

  const form = useAppForm({
    defaultValues: initialData,
    onSubmit: async ({ value }) => {
      updateProfile(value);
    },
    validators: {
      onSubmit: GeneralFormSchema,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <H3 className="mb-4 text-lg font-medium text-card-foreground">
          Informations personnelles
        </H3>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <form.AppField
                name="fullName"
                children={(field) => (
                  <field.InputField
                    label="Nom complet"
                    placeholder="Votre nom complet"
                  />
                )}
              />

              <div>
                <Label className="mb-2 block text-sm font-medium text-card-foreground">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="cursor-not-allowed bg-muted text-muted-foreground"
                  />
                </div>
                <P className="mt-1 text-xs text-muted-foreground">
                  L'email ne peut pas être modifié
                </P>
              </div>

              <form.AppField
                name="language"
                children={(field) => (
                  <field.SelectField
                    label="Langue"
                    options={[
                      { label: "Français", value: "fr" },
                      { label: "English", value: "en" },
                      { label: "Español", value: "es" },
                      { label: "Deutsch", value: "de" },
                    ]}
                    placeholder="Choisir la langue"
                    required
                  />
                )}
              />

              <form.AppField
                name="timezone"
                children={(field) => (
                  <field.SelectField
                    label="Fuseau horaire"
                    options={[
                      { label: "Paris (UTC+1)", value: "Europe/Paris" },
                      { label: "Londres (UTC+0)", value: "Europe/London" },
                      { label: "New York (UTC-5)", value: "America/New_York" },
                      {
                        label: "Los Angeles (UTC-8)",
                        value: "America/Los_Angeles",
                      },
                      { label: "Tokyo (UTC+9)", value: "Asia/Tokyo" },
                    ]}
                    placeholder="Choisir le fuseau horaire"
                    required
                  />
                )}
              />
            </div>
          </FieldGroup>

          <form.AppForm>
            <div className="mt-6">
              <form.SubmitButton
                disabled={isUpdating}
                isLoading={isUpdating}
                className="flex items-center space-x-2 px-6 py-2"
              >
                <Save className="h-4 w-4" />
                <span>Sauvegarder</span>
              </form.SubmitButton>
            </div>
          </form.AppForm>
        </form>
      </div>
    </div>
  );
};
