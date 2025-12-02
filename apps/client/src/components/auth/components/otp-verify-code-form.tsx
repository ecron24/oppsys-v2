import { Button } from "@oppsys/ui/components/button";
import { P } from "@oppsys/ui/components/typography";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import z from "zod";
import { FieldGroup } from "@oppsys/ui/components/field";
import { useAuthOperations } from "@/components/auth/hooks/use-auth-operations";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { routes } from "@/routes";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  otpCode: z
    .string()
    .length(6, "Code à 6 chiffres requis")
    .regex(/^\d{6}$/, "Code à 6 chiffres requis"),
});

export function OtpVerifyCodeForm({ onBack, email }: OtpVerifyCodeFormProps) {
  const { signInWithOtp, verifyOtp } = useAuthOperations();
  const navigate = useNavigate();
  const form = useAppForm({
    defaultValues: {
      otpCode: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await verifyOtp.mutateAsync({ email, otp: value.otpCode });
      if (!result.success) return;
      navigate(result.redirectTo);
    },
  });
  const [resending, setResending] = useState(false);

  const handleSendOTP = async () => {
    setResending(true);
    await signInWithOtp.mutateAsync(email);
    setResending(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <P className="text-sm text-muted-foreground mb-4">
          Code envoyé à{" "}
          <span className="font-medium text-foreground">{email}</span>
        </P>
      </div>
      <form
        id="verify-code-form"
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField
            name="otpCode"
            children={(field) => {
              return (
                <field.InputField
                  label="Code de connexion (6 chiffres)"
                  placeholder="123456"
                />
              );
            }}
          />
        </FieldGroup>
        <form.AppForm>
          <form.SubmitButton form="verify-code-form" className="w-full">
            Vérifier le code
          </form.SubmitButton>
        </form.AppForm>
      </form>
      <div className="flex flex-col space-y-3">
        <Button
          type="button"
          onClick={handleSendOTP}
          disabled={resending}
          variant="link"
        >
          Renvoyer le code
        </Button>
        <Button type="button" onClick={onBack} variant="link" asChild>
          <Link to={routes.auth.login()}>
            <ArrowLeft /> Utiliser un mot de passe à la place
          </Link>
        </Button>
      </div>
    </div>
  );
}

type OtpVerifyCodeFormProps = {
  onBack?: () => void;
  email: string;
};
