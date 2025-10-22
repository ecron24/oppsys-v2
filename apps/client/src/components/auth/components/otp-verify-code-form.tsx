import { Button } from "@oppsys/ui";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import z from "zod";
import { FieldGroup } from "@oppsys/ui/components/field";
import { useAuthOperations } from "@/components/auth/hooks/use-auth-operations";
import { useState } from "react";
import { useNavigate } from "react-router";

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
      onChange: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await verifyOtp({ email, otp: value.otpCode });
      if (!result.success) return;
      navigate(result.redirectTo);
    },
  });
  const [resending, setResending] = useState(false);

  const handleSendOTP = async () => {
    setResending(true);
    await signInWithOtp(email);
    setResending(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Code envoyé à{" "}
          <span className="font-medium text-foreground">{email}</span>
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
          <form.SubmitButton form="otp-form">
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
        <Button type="button" onClick={onBack} variant="link">
          ← Utiliser un mot de passe à la place
        </Button>
      </div>
    </div>
  );
}

type OtpVerifyCodeFormProps = {
  onBack: () => void;
  email: string;
};
