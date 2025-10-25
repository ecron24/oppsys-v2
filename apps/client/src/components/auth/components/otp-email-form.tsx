import { Button, P } from "@oppsys/ui";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import z from "zod";
import { FieldGroup } from "@oppsys/ui/components/field";
import { useAuthOperations } from "@/components/auth/hooks/use-auth-operations";
import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router";
import { routes } from "@/routes";

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
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await signInWithOtp.mutateAsync(value.email);
      onSent({ email: value.email });
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <P className="text-sm text-muted-foreground">
          Nous vous enverrons un code pour vous connecter
        </P>
      </div>
      <form
        id="otp-form"
        className="space-y-6"
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
                  iconLeft={<Mail className="text-muted-foreground" />}
                />
              );
            }}
          />
        </FieldGroup>
        <form.AppForm>
          <form.SubmitButton form="otp-form" className="w-full">
            Envoyer le code
          </form.SubmitButton>
        </form.AppForm>
      </form>
      <div className="flex flex-col space-y-3">
        <Button type="button" onClick={onBack} variant="link" asChild>
          <Link to={routes.auth.login()}>
            <ArrowLeft /> Utiliser un mot de passe à la place
          </Link>
        </Button>
      </div>
    </div>
  );
}

type OtpEmailFormProps = {
  onBack?: () => void;
  onSent: (params: { email: string }) => void;
};
