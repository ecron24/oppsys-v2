import { honoClient } from "@/lib/hono-client";
import type {
  Content,
  ContentMetadata,
  GetContentQuery,
  ProcessContentDecisionParams,
} from "../../app/(sidebar)/content/content-types";
import { handleApiCall } from "@/lib/handle-api-call";
import type { Period } from "../../app/(sidebar)/dashboard/services/dashboard-service";
import { toSnakeCase } from "@oppsys/shared";
import type { User } from "../auth/auth-types";

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

  async deleteContent(params: { content: Content; user?: User }) {
    if (params.content?.status === "pending") {
      const { resumeWebhookUrl } = params.content.metadata;

      if (resumeWebhookUrl) {
        try {
          const payload = toSnakeCase({
            approved: false,
            content_id: params.content.id,
            approver_id: params.user?.id,
            feedback: "Supprimé par l'utilisateur",
            declined_at: new Date().toISOString(),
          });
          await fetch(resumeWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
        } catch (e) {
          console.warn("⚠️ Erreur webhook (non bloquant):", e);
        }
      }
    }

    const apiResult = handleApiCall(
      await honoClient.api.content.generated[":id"].$delete({
        param: { id: params.content.id },
      })
    );

    return apiResult;
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
    user,
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
      const n8nPayload = toSnakeCase({
        approved,
        content_id: contentId,
        approver_id: user.id,
        feedback: approved ? "Approuvé" : "Refusé",
        approved_at: new Date().toISOString(),
        user_info: {
          email: user?.email,
          name: user?.fullName,
          plan: user?.planId,
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
