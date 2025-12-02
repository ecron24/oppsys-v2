import { Link, useNavigate } from "react-router";
import z from "zod";
import { useAuthOperations } from "../hooks/use-auth-operations";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import { routes } from "@/routes";
import { FieldGroup } from "@oppsys/ui/components/field";
import { Lock, Mail } from "lucide-react";
import { Button } from "@oppsys/ui/components/button";

const formSchema = z
  .object({
    email: z.email("Email invalide").min(1, "Email requis"),
    password: z
      .string()
      .min(6, "Minimum 6 caractères")
      .min(1, "Mot de passe requis"),
    fullName: z.string().min(1, "Nom requis"),
    confirmPassword: z.string().min(6, "Minimum 6 caractères"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const navigate = useNavigate();
  const { signUp } = useAuthOperations();
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await signUp.mutateAsync({
        email: value.email,
        password: value.password,
        fullName: value.fullName,
      });
      if (result.success) {
        navigate(routes.dashboard.index());
      }
    },
  });

  return (
    <div className="space-y-6">
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
            name="fullName"
            children={(field) => {
              return (
                <field.InputField
                  label="Adresse email"
                  placeholder="Votre nom complet"
                />
              );
            }}
          />
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
          <form.AppField
            name="confirmPassword"
            children={(field) => {
              return (
                <field.InputPasswordField
                  label="Confirmer le mot de passe"
                  placeholder="******"
                  iconLeft={<Lock className="text-muted-foreground" />}
                />
              );
            }}
          />
        </FieldGroup>
        <form.AppForm>
          <form.SubmitButton form="login-form" className="w-full">
            Créer mon compte
          </form.SubmitButton>
        </form.AppForm>
      </form>
      <div className="space-y-2">
        <div className="text-center">
          <Button type="button" variant={"link"} asChild>
            <Link to={routes.auth.login()}>Déjà un compte ? Se connecter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
