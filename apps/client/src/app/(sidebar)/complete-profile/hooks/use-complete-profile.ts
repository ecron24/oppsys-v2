import { useState } from "react";
import { z } from "zod";
import { useAuthOperations } from "@/components/auth/hooks/use-auth-operations";
import { useNavigate } from "react-router";
import { routes } from "@/routes";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import { toast } from "@oppsys/ui/lib/sonner";

const completeProfileSchema = z
  .object({
    fullName: z.string().min(1, "Le nom complet est requis"),
    password: z
      .string()
      .min(8, "Le mot de passe doit faire au moins 8 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Le mot de passe doit contenir au moins un caractère spécial"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type CompleteProfileForm = z.infer<typeof completeProfileSchema>;

export function useCompleteProfileForm() {
  const [error, setError] = useState<string>("");
  const { updatePassword, updateProfile } = useAuthOperations();
  const navigate = useNavigate();

  const form = useAppForm({
    defaultValues: {
      fullName: "",
      password: "",
      confirmPassword: "",
    } as CompleteProfileForm,
    validators: {
      onChange: completeProfileSchema,
    },
    onSubmit: async ({ value }) => {
      setError("");

      // Update password
      const passwordResult = await updatePassword.mutateAsync(value.password);
      if (!passwordResult.success) {
        setError(
          passwordResult.error ||
            "Erreur lors de la mise à jour du mot de passe"
        );
        toast.error("Erreur lors de la mise à jour du mot de passe");

        return;
      }

      // Update profile
      const profileResult = await updateProfile.mutateAsync({
        fullName: value.fullName.trim(),
      });
      if (!profileResult.success) {
        setError(
          profileResult.error || "Erreur lors de la mise à jour du profil"
        );
        toast.error("Erreur lors de la mise à jour du profil");

        return;
      }

      toast.success("Profil complété avec succès !");
      navigate(routes.dashboard.index());
    },
  });

  return { form, error };
}
