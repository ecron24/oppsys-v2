import { z } from "zod";

export const communicationPrefsSchema = z
  .object({
    billingReminders: z.boolean(),
    clientId: z.string(),
    createdAt: z.string(),
    digestFrequency: z.enum(["daily", "weekly", "monthly", "never"]),
    emailFormat: z.enum(["html", "text"]),
    featureAnnouncements: z.boolean(),
    id: z.string(),
    maintenanceAlerts: z.boolean(),
    marketingEmails: z.boolean(),
    newsletter: z.boolean(),
    productUpdates: z.boolean(),
    securityAlerts: z.boolean(),
    updatedAt: z.string(),
    usageReports: z.boolean(),
  })
  .strict();

export type CommunicationPrefs = z.infer<typeof communicationPrefsSchema>;
