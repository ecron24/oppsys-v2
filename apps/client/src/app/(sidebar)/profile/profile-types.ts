import type { honoClient } from "@/lib/hono-client";
import type { InferRequestType } from "hono";
import { z } from "zod";

export type Platform = InferRequestType<
  typeof honoClient.api.social.init.$post
>["json"]["platform"];

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

export interface SocialConnection {
  id: string;
  userId: string;
  platform: Platform;
  accessToken: string;
  refreshToken: string | null;
  expiresAt: string | null;
  scopes: string[] | null;
  platformUserId: string | null;
  platformUsername: string | null;
  isValid: boolean | null;
  lastUsed: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SocialStats {
  valid: number;
  invalid: number;
  expiringSoon: number;
  total: number;
}

export type ProfilePageProps = Record<string, never>;
