import { honoClient } from "@/lib/hono-client";
import type {
  Content,
  ContentMetadata,
  GetContentQuery,
  ProcessContentDecisionParams,
} from "../types";
import { handleApiCall } from "@/lib/handle-api-call";
import type { Period } from "../../dashboard/services/dashboard-service";
import { toSnakeCase } from "@/lib/to-snake-case";

export class ContentService {
  async getUserContent(query: GetContentQuery = {}) {
    return handleApiCall(
      await honoClient.api.content.generated.$get({ query })
    );
  }

  async getContentById(contentId: string) {
    return handleApiCall(
      await honoClient.api.content.generated[":id"].$get({
        param: { id: contentId },
      })
    );
  }

  async toggleFavorite(contentId: string, isFavorite: boolean) {
    return handleApiCall(
      await honoClient.api.content.generated[":id"].favorite.$patch({
        json: { isFavorite },
        param: { id: contentId },
      })
    );
  }

  async deleteContent(contentId: string) {
    return handleApiCall(
      await honoClient.api.content.generated[":id"].$delete({
        param: { id: contentId },
      })
    );
  }

  async updateContentStatus(
    contentId: string,
    status: string,
    metadata: ContentMetadata = {}
  ) {
    return handleApiCall(
      await honoClient.api.content.generated[":id"].$put({
        json: { status, metadata },
        param: { id: contentId },
      })
    );
  }

  async updateContentApproval(
    contentId: string,
    status: string,
    feedback = ""
  ) {
    return handleApiCall(
      await honoClient.api.content.generated[":id"]["approval-history"].$put({
        param: { id: contentId },
        json: { status, feedback },
      })
    );
  }

  async processContentDecision({
    userId,
    contentId,
    approved,
    feedback = "",
    originalMetadata = {},
  }: ProcessContentDecisionParams) {
    // TODO: maybe make in server ?
    const approvalResult = await this.updateContentApproval(
      contentId,
      approved ? "approved" : "declined",
      feedback
    );
    if (!approvalResult.success) return approvalResult;

    const newStatus = approved ? "approved" : "declined";
    const updatedMetadata: ContentMetadata = {
      ...originalMetadata,
      approvedAt: new Date().toISOString(),
      approvalFeedback: feedback,
    };

    const contentResult = await this.updateContentStatus(
      contentId,
      newStatus,
      updatedMetadata
    );
    if (!contentResult.success) return contentResult;

    const resumeUrl = originalMetadata?.resumeWebhookUrl as string;
    if (resumeUrl) {
      console.log("🚀 Tentative de reprise du workflow n8n via webhook...");

      const n8nPayload = toSnakeCase({
        sessionId: userId,
        chatInput: JSON.stringify({
          approved: approved,
          decision: approved ? "approved" : "declined",
          feedback: feedback,
          content_id: contentId,
          decision_timestamp: new Date().toISOString(),
          ...(originalMetadata.originalInput || {}),
        }),
        metadata: {
          worker_result_id: userId,
          client_id: originalMetadata?.client_email || "unknown@example.com",
          system: {
            module_id: originalMetadata?.moduleId,
            module_name: originalMetadata?.moduleName || "Content Approval",
            action: "approval_decision",
            content_id: contentId,
          },
          approval_info: {
            approved: approved,
            status: approved ? "approved" : "declined",
            feedback: feedback,
            approver_id: userId,
            timestamp: new Date().toISOString(),
          },
        },
      });
      const response = await fetch(resumeUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      });

      if (!response.ok) {
        console.error(
          "❌ Erreur webhook N8N:",
          response.status,
          response.statusText
        );
      } else {
        console.log("✅ Webhook n8n appelé avec succès.");
      }
    }

    return {
      success: true,
      data: {
        approval: approvalResult.data,
        content: contentResult.data,
      },
    } as const;
  }

  async getContentStats(period: Period = "month") {
    handleApiCall(
      await honoClient.api.content.stats.$get({
        query: { period },
      })
    );
  }

  async getBasicStatsFromSupabase(period?: Period) {
    return handleApiCall(
      await honoClient.api.content.stats.$get({ query: { period } })
    );
  }

  requiresApproval(content: Content): boolean {
    if (!content) return false;
    if (content.type === "social-post") return true;
    return false;
  }

  formatContentForDisplay(rawContent: Content): Content {
    if (!rawContent) return rawContent;

    return {
      ...rawContent,
      formattedDate: new Date(rawContent.createdAt).toLocaleDateString(
        "fr-FR",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      requiresApproval: this.requiresApproval(rawContent),
      moduleDisplayName: this.getModuleDisplayName(rawContent.moduleSlug),
    } as Content;
  }

  getModuleDisplayName(moduleSlug?: string): string {
    if (!moduleSlug) return "Inconnu";
    return moduleSlug;
  }
}

export const contentService = new ContentService();
