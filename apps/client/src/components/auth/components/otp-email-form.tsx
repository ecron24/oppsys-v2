import { Button } from "@oppsys/ui";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import z from "zod";
import { FieldGroup } from "@oppsys/ui/components/field";
import { useAuthOperations } from "@/components/auth/hooks/use-auth-operations";

const formSchema = z.object({
  email: z.email("Email invalide").min(1, "Email requis"),
});

export function OtpEmailForm({ onBack, onSent }: OtpEmailFormProps) {
  const { signInWithOtp } = useAuthOperations();
  const form = useAppForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      await signInWithOtp(value.email);
      onSent({ email: value.email });
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Nous vous enverrons un code pour vous connecter
        </p>
      </div>
      <form
        id="otp-form"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField
            name="email"
            children={(field) => {
              return (
                <field.InputField
                  label="Adresse email"
                  placeholder="example@gmail.com"
                  type="email"
                  //  TODO: iconLeft
                />
              );
            }}
          />
        </FieldGroup>
        <form.AppForm>
          <form.SubmitButton form="otp-form">Envoyer le code</form.SubmitButton>
        </form.AppForm>
      </form>
      <div className="flex flex-col space-y-3">
        <Button type="button" onClick={onBack} variant="link">
          ← Utiliser un mot de passe à la place
        </Button>
      </div>
    </div>
  );
}

type OtpEmailFormProps = {
  onBack: () => void;
  onSent: (params: { email: string }) => void;
};
