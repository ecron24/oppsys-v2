import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Email invalide").min(1, "Email requis"),
  password: z
    .string()
    .min(6, "Minimum 6 caractères")
    .min(1, "Mot de passe requis"),
});

export const signupSchema = loginSchema
  .extend({
    fullName: z.string().min(1, "Nom requis"),
    confirmPassword: z.string().min(6, "Minimum 6 caractères"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
