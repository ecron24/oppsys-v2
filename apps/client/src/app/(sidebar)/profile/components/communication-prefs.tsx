import { useState, useEffect } from "react";
import { Button } from "@oppsys/ui/components/button";
import { H4, P } from "@oppsys/ui/components/typography";
import { Input } from "@oppsys/ui/components/input";
import { Label } from "@oppsys/ui/components/label";
import { toast } from "@oppsys/ui/lib/sonner";
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
import {
  communicationPrefsSchema,
  type CommunicationPrefs as CommunicationPrefsType,
} from "@/components/communication-prefs/communication-prefs-types";
import { communicationPrefsService } from "@/components/communication-prefs/communication-prefs-service";

export const CommunicationPrefs = ({ clientId }: CommunicationPrefsProps) => {
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [productUpdates, setProductUpdates] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [usageReports, setUsageReports] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialPrefs, setInitialPrefs] =
    useState<CommunicationPrefsType | null>(null);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!clientId) return;
      setLoading(true);
      const result = await communicationPrefsService.getByClientId(clientId);

      if (result.success && result.data) {
        setMarketingEmails(result.data.marketingEmails || false);
        setProductUpdates(result.data.productUpdates || false);
        setSecurityAlerts(result.data.securityAlerts !== false);
        setUsageReports(result.data.usageReports || false);
        const data = communicationPrefsSchema.safeParse(result.data).data;
        if (data) {
          setInitialPrefs(data);
        }
      }
      setLoading(false);
    };
    fetchPreferences();
  }, [clientId]);

  const hasChanges =
    initialPrefs?.marketingEmails !== marketingEmails ||
    initialPrefs?.productUpdates !== productUpdates ||
    initialPrefs?.securityAlerts !== securityAlerts ||
    initialPrefs?.usageReports !== usageReports;

  const savePreferences = async () => {
    if (!clientId) return;

    setSaving(true);

    const prefsData = {
      clientId,
      marketingEmails,
      productUpdates,
      securityAlerts,
      usageReports,
      updatedAt: new Date().toISOString(),
    };

    const upsertedResult = await communicationPrefsService.upsertByClientId(
      clientId,
      prefsData
    );
    setSaving(false);
    if (upsertedResult.success && initialPrefs) {
      setInitialPrefs({ ...initialPrefs, ...prefsData });
      toast.success("Préférences sauvegardées avec succès");
      return;
    }
    toast.error("Erreur lors de la sauvegarde");
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
          <div className="bg-gradient-primary p-3 rounded-lg">
            <Mail className="h-5 w-5 text-white" />
          </div>
          <H4 className="text-lg font-semibold text-card-foreground">
            Préférences de communication
          </H4>
        </div>
        <Button onClick={resetToDefaults} variant={"muted"} disabled={saving}>
          <RotateCcw className="h-4 w-4" />
          Réinitialiser
        </Button>
      </div>

      <div className="space-y-6">
        <P className="text-sm text-muted-foreground">
          Choisissez les types de communications que vous souhaitez recevoir par
          email.
        </P>

        <div className="space-y-4">
          <div className="flex items-start p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center h-5 mt-1">
              <Input
                id="security_alerts"
                type="checkbox"
                checked={securityAlerts}
                onChange={(e) => setSecurityAlerts(e.target.checked)}
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <Label
                  htmlFor="security_alerts"
                  className="font-medium text-blue-900 cursor-pointer"
                >
                  Alertes de sécurité
                </Label>
              </div>
              <P className="text-sm text-blue-700">
                Notifications importantes concernant la sécurité de votre compte
                (fortement recommandé).
              </P>
            </div>
          </div>
          <div className="flex items-start p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <Input
                id="product_updates"
                type="checkbox"
                checked={productUpdates}
                onChange={(e) => setProductUpdates(e.target.checked)}
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Rocket className="h-4 w-4 text-muted-foreground" />
                <Label
                  htmlFor="product_updates"
                  className="font-medium text-card-foreground cursor-pointer"
                >
                  Mises à jour produit
                </Label>
              </div>
              <P className="text-sm text-muted-foreground">
                Informations sur les nouvelles fonctionnalités et améliorations
                de la plateforme.
              </P>
            </div>
          </div>
          <div className="flex items-start p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <Input
                id="usage_reports"
                type="checkbox"
                checked={usageReports}
                onChange={(e) => setUsageReports(e.target.checked)}
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <Label
                  htmlFor="usage_reports"
                  className="font-medium text-card-foreground cursor-pointer"
                >
                  Rapports d'utilisation
                </Label>
              </div>
              <P className="text-sm text-muted-foreground">
                Résumés mensuels de votre activité, statistiques d'utilisation
                et conseils d'optimisation.
              </P>
            </div>
          </div>
          <div className="flex items-start p-4 border border-border rounded-lg hover:border-primary/50 transition-colors">
            <div className="flex items-center h-5 mt-1">
              <Input
                id="marketing_emails"
                type="checkbox"
                checked={marketingEmails}
                onChange={(e) => setMarketingEmails(e.target.checked)}
              />
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label
                  htmlFor="marketing_emails"
                  className="font-medium text-card-foreground cursor-pointer"
                >
                  Emails marketing
                </Label>
              </div>
              <P className="text-sm text-muted-foreground">
                Offres spéciales, conseils d'utilisation, actualités et contenus
                exclusifs.
              </P>
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
          <Button
            onClick={savePreferences}
            disabled={saving || !hasChanges}
            className="bg-gradient-primary"
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
          </Button>
        </div>
      </div>
    </div>
  );
};

type CommunicationPrefsProps = {
  clientId?: string;
};
