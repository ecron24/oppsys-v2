import apiService from "./apiService";
import { getModuleBySlug } from "../config/modules.config.jsx";

/**
 * Service Layer pour la gestion du contenu généré
 * Architecture hybride : API REST pour les opérations complexes, Supabase pour les opérations CRUD simples
 */
class ContentService {
  constructor() {
    this.apiService = apiService;
  }

  // =====================================================
  // MÉTHODES DE LECTURE (Supabase Direct - Plus rapide)
  // =====================================================

  async getUserContent(userId, limit = 50, type = null) {
    try {
      console.log("📖 ContentService.getUserContent:", { userId, limit, type });
      if (!userId) throw new Error("ID utilisateur requis");

      let query = supabase
        .from("generated_content")
        .select(
          `
          *,
          modules!generated_content_module_id_fkey(name, slug)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (type && type !== "all") {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;

      console.log("✅ Contenu récupéré:", data?.length || 0, "éléments");
      return data || [];
    } catch (error) {
      console.error("❌ Erreur getUserContent:", error);
      throw new Error(
        `Erreur lors de la récupération du contenu: ${error.message}`
      );
    }
  }

  // ✅ MÉTHODE CORRIGÉE dans contentService.js
  async getContentById(contentId) {
    try {
      console.log("📖 ContentService.getContentById:", contentId);

      // ✅ ESSAYER D'ABORD SUPABASE DIRECT
      const { data, error } = await supabase
        .from("generated_content")
        .select(
          `
        *,
        modules!generated_content_module_id_fkey(
          id,
          name,
          slug,
          category
        )
      `
        )
        .eq("id", contentId)
        .single();

      if (error) {
        console.warn("⚠️ Supabase direct failed, trying API fallback:", error);

        // ✅ FALLBACK VERS API SI SUPABASE ÉCHOUE
        try {
          const response = await this.apiService.get(
            `/content/generated/${contentId}`
          );
          if (response && response.success) {
            console.log("✅ Contenu récupéré via API fallback");
            return response.data;
          }
        } catch (apiError) {
          console.error("❌ API fallback failed:", apiError);
        }

        throw error;
      }

      console.log("✅ Contenu trouvé via Supabase:", data?.title);
      return data;
    } catch (error) {
      console.error("❌ Erreur getContentById:", error);
      throw new Error(`Contenu non trouvé: ${error.message}`);
    }
  }

  // =====================================================
  // MÉTHODES DE MODIFICATION (Supabase Direct)
  // =====================================================

  async toggleFavorite(contentId, isFavorite) {
    try {
      console.log("⭐ ContentService.toggleFavorite:", {
        contentId,
        isFavorite,
      });
      const { data, error } = await supabase
        .from("generated_content")
        .update({
          is_favorite: isFavorite,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Favori mis à jour");
      return data;
    } catch (error) {
      console.error("❌ Erreur toggleFavorite:", error);
      throw new Error(
        `Erreur lors de la mise à jour des favoris: ${error.message}`
      );
    }
  }

  async deleteContent(contentId) {
    try {
      console.log("🗑️ ContentService.deleteContent:", contentId);
      const { error } = await supabase
        .from("generated_content")
        .delete()
        .eq("id", contentId);

      if (error) throw error;

      console.log("✅ Contenu supprimé");
      return true;
    } catch (error) {
      console.error("❌ Erreur deleteContent:", error);
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  async updateContentStatus(contentId, status, metadata = {}) {
    try {
      console.log("📝 ContentService.updateContentStatus:", {
        contentId,
        status,
      });
      const { data, error } = await supabase
        .from("generated_content")
        .update({
          status,
          metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentId)
        .select()
        .single();

      if (error) throw error;

      console.log("✅ Statut mis à jour:", status);
      return data;
    } catch (error) {
      console.error("❌ Erreur updateContentStatus:", error);
      throw new Error(
        `Erreur lors de la mise à jour du statut: ${error.message}`
      );
    }
  }

  // =====================================================
  // MÉTHODES D'APPROBATION (Supabase Direct)
  // =====================================================

  async updateContentApproval(contentId, userId, status, feedback = "") {
    try {
      console.log("✅ ContentService.updateContentApproval:", {
        contentId,
        status,
      });
      const { data, error } = await supabase
        .from("content_approvals")
        .update({
          approver_id: userId,
          status,
          feedback,
          reviewed_at: new Date().toISOString(),
        })
        .eq("content_id", contentId)
        .select();

      if (error) throw error;
      console.log("✅ Approbation mise à jour");
      return data;
    } catch (error) {
      console.error("❌ Erreur updateContentApproval:", error);
      throw new Error(
        `Erreur lors de la mise à jour de l'approbation: ${error.message}`
      );
    }
  }

  async processContentDecision(
    contentId,
    userId,
    approved,
    feedback = "",
    originalMetadata = {}
  ) {
    try {
      console.log("🔄 ContentService.processContentDecision:", {
        contentId,
        userId,
        approved,
      });

      if (!contentId || !userId) {
        throw new Error("ID du contenu et utilisateur requis");
      }

      const approvalResult = await this.updateContentApproval(
        contentId,
        userId,
        approved ? "approved" : "declined",
        feedback
      );

      const newStatus = approved ? "approved" : "declined";
      const updatedMetadata = {
        ...originalMetadata,
        approved_at: new Date().toISOString(),
        approval_feedback: feedback,
      };

      const contentResult = await this.updateContentStatus(
        contentId,
        newStatus,
        updatedMetadata
      );

      console.log("✅ Décision enregistrée avec succès dans la BDD.");

      const resumeUrl = originalMetadata?.resume_webhook_url;
      if (resumeUrl) {
        console.log("🚀 Tentative de reprise du workflow n8n via webhook...");

        // ✅ PAYLOAD N8N CORRIGÉ SELON LA STRUCTURE RÉELLE
        const n8nPayload = {
          // ✅ STRUCTURE IDENTIQUE À L'OUTPUT N8N
          sessionId: userId,
          chatInput: JSON.stringify({
            // Données de décision pour N8N
            approved: approved,
            decision: approved ? "approved" : "declined",
            feedback: feedback,
            content_id: contentId,
            decision_timestamp: new Date().toISOString(),

            // Données originales si disponibles
            ...(originalMetadata.original_input || {}),
          }),
          metadata: {
            // ✅ STRUCTURE CONFORME À L'OUTPUT
            worker_result_id: userId,
            client_id: originalMetadata?.client_email || "unknown@example.com",

            // Informations système
            system: {
              module_id: originalMetadata?.module_id,
              module_name: originalMetadata?.module_name || "Content Approval",
              action: "approval_decision",
              content_id: contentId,
            },

            // Informations de décision
            approval_info: {
              approved: approved,
              status: approved ? "approved" : "declined",
              feedback: feedback,
              approver_id: userId,
              timestamp: new Date().toISOString(),
            },
          },
        };

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
        approval: approvalResult,
        content: contentResult,
        success: true,
      };
    } catch (error) {
      console.error("❌ Erreur processContentDecision:", error);
      throw new Error(
        `Erreur lors du traitement de la décision: ${error.message}`
      );
    }
  }

  // =====================================================
  // MÉTHODES API REST (Pour opérations complexes)
  // =====================================================

  async getContentStats(userId, period = "30d") {
    try {
      console.log("📊 ContentService.getContentStats");
      const result = await this.apiService.get(`/content/stats`, {
        user_id: userId,
        period,
      });
      console.log("✅ Statistiques récupérées");
      return result;
    } catch (error) {
      console.warn("⚠️ API indisponible, fallback vers Supabase");
      return this.getBasicStatsFromSupabase(userId);
    }
  }

  async getBasicStatsFromSupabase(userId) {
    try {
      const { data, error } = await supabase
        .from("generated_content")
        .select("id, type, status, created_at, is_favorite")
        .eq("user_id", userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        by_type: {},
        by_status: {},
        favorites: data.filter((c) => c.is_favorite).length,
      };

      data.forEach((content) => {
        stats.by_type[content.type] = (stats.by_type[content.type] || 0) + 1;
        stats.by_status[content.status] =
          (stats.by_status[content.status] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("❌ Erreur getBasicStatsFromSupabase:", error);
      throw new Error(
        `Erreur lors du calcul des statistiques: ${error.message}`
      );
    }
  }

  // =====================================================
  // MÉTHODES UTILITAIRES (Connectées à la configuration)
  // =====================================================

  requiresApproval(content) {
    if (!content) return false;
    if (content.type === "social-post") return true;

    const moduleConfig = getModuleBySlug(content.module_slug);
    return moduleConfig?.category === "social";
  }

  formatContentForDisplay(rawContent) {
    if (!rawContent) return null;

    return {
      ...rawContent,
      formatted_date: new Date(rawContent.created_at).toLocaleDateString(
        "fr-FR",
        {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      requires_approval: this.requiresApproval(rawContent),
      module_display_name: this.getModuleDisplayName(rawContent.module_slug),
    };
  }

  getModuleDisplayName(moduleSlug) {
    if (!moduleSlug) return "Inconnu";
    const moduleConfig = getModuleBySlug(moduleSlug);
    return moduleConfig?.name || moduleSlug;
  }
}

// =====================================================
// EXPORT SINGLETON
// =====================================================

const contentService = new ContentService();
export { contentService };
export default contentService;
