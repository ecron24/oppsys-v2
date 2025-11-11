import { useState, useEffect } from "react";
import { toast } from "@oppsys/ui";
import {
  Mail,
  Shield,
  Rocket,
  BarChart3,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export const CommunicationPrefs = ({ clientId }: CommunicationPrefsProps) => {
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [productUpdates, setProductUpdates] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [usageReports, setUsageReports] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(null);
  const [initialPrefs, setInitialPrefs] = useState<{
    client_id: string;
    marketing_emails: boolean;
    product_updates: boolean;
    security_alerts: boolean;
    usage_reports: boolean;
    updated_at: string;
  } | null>(null);

  // FIXME: I just avoid linter
  void error;
  void success;

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!clientId) return;
      try {
        setLoading(true);
        setError(null);
        // TODO: use api
        const { data, error } = await supabase
          .from("communication_preferences")
          .select("*")
          .eq("client_id", clientId)
          .maybeSingle();

        if (error) {
          throw new Error("Erreur lors du chargement des préférences");
        }

        if (data) {
          setMarketingEmails(data.marketing_emails || false);
          setProductUpdates(data.product_updates || false);
          setSecurityAlerts(data.security_alerts !== false);
          setUsageReports(data.usage_reports || false);
          setInitialPrefs(data);
        }
      } catch {
        setError("Erreur lors du chargement des préférences");
      } finally {
        setLoading(false);
      }
    };
    fetchPreferences();
  }, [clientId]);

  const hasChanges =
    initialPrefs?.marketing_emails !== marketingEmails ||
    initialPrefs?.product_updates !== productUpdates ||
    initialPrefs?.security_alerts !== securityAlerts ||
    initialPrefs?.usage_reports !== usageReports;

  const savePreferences = async () => {
    if (!clientId) return;
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const prefsData = {
        client_id: clientId,
        marketing_emails: marketingEmails,
        product_updates: productUpdates,
        security_alerts: securityAlerts,
        usage_reports: usageReports,
        updated_at: new Date().toISOString(),
      };

      const { data: existingPrefs } = await supabase
        .from("communication_preferences")
        .select("id")
        .eq("client_id", clientId)
        .maybeSingle();

      const { error: saveError } = existingPrefs
        ? await supabase
            .from("communication_preferences")
            .update(prefsData)
            .eq("client_id", clientId)
        : await supabase.from("communication_preferences").insert([prefsData]);

      if (saveError) throw saveError;

      setInitialPrefs(prefsData); // Mettre à jour l'état initial après sauvegarde
      toast.success("Préférences sauvegardées avec succès");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setMarketingEmails(false);
    setProductUpdates(false);
    setSecurityAlerts(true);
    setUsageReports(false);
  };

  if (loading) {
    return (
      <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
        <div className="flex justify-center items-center py-6">
          <RefreshCw className="h-5 w-5 text-muted-foreground animate-spin mr-2" />
          <span className="text-muted-foreground">
            Chargement des préférences...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card text-card-foreground rounded-xl p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-primary to-orange-600 p-3 rounded-lg">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-card-foreground">
            Préférences de communication
          </h2>
        </div>
        <button
          onClick={resetToDefaults}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-card-foreground transition-colors"
          disabled={saving}
        >
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </button>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Choisissez les types de communications que vous souhaitez recevoir par
          email.
        </p>

        <div className="space-y-4">
          <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center h-5 mt-1">
              <input
                id="security_alerts"
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
                className="h-4 w-4 text-primary rounded border-border focus:ring-primary"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <label
                  htmlFor="security_alerts"
                  className="font-medium text-blue-900 cursor-pointer"
                >
                  Alertes de sécurité
                </label>
              </div>
              <p className="text-sm text-blue-700">
                Notifications importantes concernant la sécurité de votre compte
                (fortement recommandé).
              </p>
            </div>
          </div>
          <div className="flex items-start p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input
                id="product_updates"
                type="checkbox"
                checked={productUpdates}
                onChange={(e) => setProductUpdates(e.target.checked)}
                className="h-4 w-4 text-primary rounded border-border focus:ring-primary"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Rocket className="h-4 w-4 text-muted-foreground" />
                <label
                  htmlFor="product_updates"
                  className="font-medium text-card-foreground cursor-pointer"
                >
                  Mises à jour produit
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Informations sur les nouvelles fonctionnalités et améliorations
                de la plateforme.
              </p>
            </div>
          </div>
          <div className="flex items-start p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input
                id="usage_reports"
                type="checkbox"
                checked={usageReports}
                onChange={(e) => setUsageReports(e.target.checked)}
                className="h-4 w-4 text-primary rounded border-border focus:ring-primary"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <label
                  htmlFor="usage_reports"
                  className="font-medium text-card-foreground cursor-pointer"
                >
                  Rapports d'utilisation
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Résumés mensuels de votre activité, statistiques d'utilisation
                et conseils d'optimisation.
              </p>
            </div>
          </div>
          <div className="flex items-start p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <input
                id="marketing_emails"
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
                className="h-4 w-4 text-primary rounded border-border focus:ring-primary"
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <label
                  htmlFor="marketing_emails"
                  className="font-medium text-card-foreground cursor-pointer"
                >
                  Emails marketing
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Offres spéciales, conseils d'utilisation, actualités et contenus
                exclusifs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="text-sm">
            {hasChanges && !saving && (
              <span className="text-orange-600 flex items-center space-x-1">
                <AlertCircle className="h-4 w-4" />
                <span>Vous avez des modifications non sauvegardées</span>
              </span>
            )}
          </div>
          <button
            onClick={savePreferences}
            disabled={saving || !hasChanges}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary to-orange-600 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Sauvegarder les préférences</span>
                {hasChanges && <span className="ml-1">*</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

type CommunicationPrefsProps = {
  clientId?: string;
};
