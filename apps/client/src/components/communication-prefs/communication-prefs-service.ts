import { supabase } from "@/lib/supabase";
import { toCamelCase } from "@/lib/to-camel-case";
import type { CommunicationPrefs } from "./communication-prefs-types";
import { toSnakeCase } from "@/lib/to-snake-case";

export const communicationPrefsService = {
  async getByClientId(clientId: string) {
    const { data, error } = await supabase
      .from("communication_preferences")
      .select("*")
      .eq("client_id", clientId)
      .maybeSingle();
    if (error) {
      console.error("communicationPrefsService::getByClientId]: ", error, {
        clientId,
      });
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data ? toCamelCase(data) : null,
      status: 200,
    } as const;
  },

  async create(
    prefs: Omit<CommunicationPrefs, "id" | "createdAt" | "updatedAt">
  ) {
    const { error } = await supabase
      .from("communication_preferences")
      .insert([toSnakeCase(prefs)]);
    if (error) {
      console.error("[communicationPrefsService::create]: ", error, { prefs });
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: null,
      status: 200,
    } as const;
  },

  async updateByClientId(clientId: string, prefs: Partial<CommunicationPrefs>) {
    const { data, error } = await supabase
      .from("communication_preferences")
      .update(toSnakeCase(prefs))
      .eq("client_id", clientId)
      .select()
      .maybeSingle();
    if (error) {
      console.error("[communicationPrefsService::updateByClientId]: ", error, {
        clientId,
      });
      return {
        success: false,
        error: error.name,
        details: error.message,
        status: 500,
      } as const;
    }
    return {
      success: true,
      data: data ? toCamelCase(data) : null,
      status: 200,
    } as const;
  },

  async upsertByClientId(clientId: string, prefs: Partial<CommunicationPrefs>) {
    const foundResult = await this.getByClientId(clientId);
    if (!foundResult.status) return foundResult;

    if (foundResult.data) {
      return this.updateByClientId(clientId, prefs);
    }
    return this.create({
      clientId,
      billingReminders: prefs.billingReminders || false,
      digestFrequency: prefs.digestFrequency || "daily",
      emailFormat: prefs.emailFormat || "html",
      featureAnnouncements: prefs.featureAnnouncements || false,
      maintenanceAlerts: prefs.maintenanceAlerts || false,
      marketingEmails: prefs.marketingEmails || false,
      newsletter: prefs.newsletter || false,
      productUpdates: prefs.productUpdates || false,
      securityAlerts: prefs.securityAlerts || false,
      usageReports: prefs.usageReports || false,
    });
  },
};
