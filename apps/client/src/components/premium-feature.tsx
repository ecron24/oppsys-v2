import { Crown, Lock } from "lucide-react";
import { Button } from "@oppsys/ui/components/button";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useNavigate } from "react-router";
import type { ReactNode } from "react";

type FeatureType =
  | "media"
  | "scheduling"
  | "analytics"
  | "featureAccess"
  | "hr"
  | "competitors"
  | "leads";

interface PremiumFeatureProps {
  feature: FeatureType;
  children: ReactNode;
  fallback?: ReactNode | null;
  showUpgrade?: boolean;
  upgradeMessage?: string;
}

export function PremiumFeature({
  feature,
  children,
  fallback = null,
  showUpgrade = true,
  upgradeMessage = "Cette fonctionnalité est réservée aux abonnés Premium",
}: PremiumFeatureProps) {
  const permissions = usePremiumFeatures();
  const navigate = useNavigate();

  // Vérifier si l'utilisateur a accès à cette fonctionnalité
  const hasAccess =
    permissions.data?.[feature] &&
    Object.values(permissions.data[feature]).some(Boolean);

  if (hasAccess) {
    return <>{children}</>;
  }

  // Utilisateur Free - Afficher le fallback ou le message d'upgrade
  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  return (
    <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border-2 border-amber-200">
      <div className="relative mb-4">
        <Lock className="h-12 w-12 mx-auto text-amber-500" />
        <Crown className="h-5 w-5 absolute -top-1 -right-1 text-amber-600" />
      </div>
      <h4 className="text-lg font-bold text-amber-900 mb-2">
        Fonctionnalité Premium
      </h4>
      <p className="text-amber-700 mb-4 text-sm">{upgradeMessage}</p>
      <Button
        size="sm"
        className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
        onClick={() => navigate("/billing")}
      >
        <Crown className="h-4 w-4 mr-2" />
        Passer à Premium
      </Button>
    </div>
  );
}

// ✅ COMPOSANTS EXISTANTS
interface PremiumComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function PremiumMediaFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="media"
      upgradeMessage="Débloquez les médias avancés avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumSchedulingFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="scheduling"
      upgradeMessage="Planifiez vos publications avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumAnalyticsFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="analytics"
      upgradeMessage="Accédez aux analytics avancés avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

// ✅ COMPOSANTS POUR LES MODULES
export function PremiumDataFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="analytics"
      upgradeMessage="Accédez à l'enrichissement de données avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumExportFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="featureAccess"
      upgradeMessage="Exportez vos données avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumHRFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="hr"
      upgradeMessage="Accédez aux fonctionnalités RH avancées avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumPredictiveFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="hr"
      upgradeMessage="Débloquez l'analyse prédictive RH avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumMonitoringFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="competitors"
      upgradeMessage="Surveillez vos concurrents en temps réel avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumCompetitorFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="competitors"
      upgradeMessage="Analysez vos concurrents en profondeur avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumLeadFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="leads"
      upgradeMessage="Générez des leads qualifiés avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumSEOFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="analytics"
      upgradeMessage="Optimisez votre SEO avec les outils Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumTrackingFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="analytics"
      upgradeMessage="Suivez vos performances SEO en temps réel avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumMLFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="analytics"
      upgradeMessage="Accédez aux fonctionnalités Machine Learning avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumAutomationFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="scheduling"
      upgradeMessage="Automatisez vos campagnes email avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

// ✅ COMPOSANTS MANQUANTS POUR ContentTranslatorModule
export function PremiumTranslationFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="analytics"
      upgradeMessage="Traduisez automatiquement vos contenus avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

export function PremiumLocalizationFeature({
  children,
  ...props
}: PremiumComponentProps) {
  return (
    <PremiumFeature
      feature="analytics"
      upgradeMessage="Localisez vos contenus pour différents marchés avec Premium"
      {...props}
    >
      {children}
    </PremiumFeature>
  );
}

// ✅ Export par défaut
export default PremiumFeature;
