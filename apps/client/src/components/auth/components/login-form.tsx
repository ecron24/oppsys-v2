import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import z from "zod";
import { useAuthOperations } from "../hooks/use-auth-operations";
import { FieldGroup } from "@oppsys/ui/components/field";
import { Lock, Mail, Zap } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { routes } from "@/routes";
import { Button } from "@oppsys/ui";

const formSchema = z.object({
  email: z.email("Email invalide").min(1, "Email requis"),
  password: z
    .string()
    .min(6, "Minimum 6 caractères")
    .min(1, "Mot de passe requis"),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { signIn } = useAuthOperations();
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await signIn({
        email: value.email,
        password: value.password,
      });
      if (result.success) {
        navigate(routes.dashboard.index());
      }
    },
  });

  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">ou</span>
        </div>
      </div>
      <form
        id="login-form"
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
          <form.AppField
            name="password"
            children={(field) => {
              return (
                <field.InputPasswordField
                  label="Mot de passe"
                  placeholder="******"
                  iconLeft={<Lock className="text-muted-foreground" />}
                />
              );
            }}
          />
        </FieldGroup>
        <form.AppForm>
          <form.SubmitButton form="login-form" className="w-full">
            Se connecter
          </form.SubmitButton>
        </form.AppForm>
      </form>
      <div className="text-center">
        <Button type="button" variant={"link"} asChild>
          <Link to={routes.auth.otp()}>
            <Zap className="h-4 w-4 mr-2" />
            Mot de passe oublié ? Recevoir un code
          </Link>
        </Button>
      </div>
    </div>
  );
}
