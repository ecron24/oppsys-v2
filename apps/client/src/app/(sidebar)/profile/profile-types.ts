import { z } from "zod";

export const GeneralFormSchema = z.object({
  fullName: z.string().min(1, "Le nom complet est requis"),
  language: z.enum(["fr", "en", "es", "de"]),
  timezone: z.string().min(1, "Le fuseau horaire est requis"),
});
export type GeneralForm = z.infer<typeof GeneralFormSchema>;

export const SecurityFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z
      .string()
      .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type SecurityForm = z.infer<typeof SecurityFormSchema>;

export const NotificationSettingsSchema = z.object({
  new_features: z.boolean(),
  quota_alerts: z.boolean(),
  billing_notifications: z.boolean(),
});

export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
