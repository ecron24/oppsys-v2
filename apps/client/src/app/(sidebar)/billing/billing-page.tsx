import { Button, cn, H2, H3, H4, P, toast } from "@oppsys/ui";
import { WithHeader } from "../_components/with-header";
import { useAuth } from "@/components/auth/hooks/use-auth";
import {
  Calendar,
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  Headphones,
  Info,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@oppsys/ui/components/card";
import { usePlans } from "@/components/plans/use-plans";
import { useState } from "react";
import { LinkButton } from "@/components/link-button";

export default function BillingPage() {
  const { user } = useAuth();
  const { plans } = usePlans();
  const [upgrading, setUpgrading] = useState(false);

  const currentPlan = user?.plans?.name || "Free";

  const handlePlanChange = async (planName: string) => {
    if (planName === currentPlan) return;

    setUpgrading(true);
    toast.warning("Changement de plan non implémenté pour le moment");
    setUpgrading(false);

    // FIXME: it doesn't work yet
    // setUpgrading(true);
    // try {
    //   const planConfig = PLANS_CONFIG[planName];

    //   // À implémenter avec votre backend Stripe
    //   const response = await apiService.post("/billing/change-plan", {
    //     priceId: planConfig.priceId,
    //     planName: planName,
    //   });

    //   toast.success(`Abonnement ${planName} activé avec succès`);
    //   await refreshProfile();
    // } catch (error) {
    //   toast.error(`Erreur Stripe: ${error.message}`);
    // } finally {
    //   setUpgrading(false);
    // }
  };

  return (
    <WithHeader title="Facturation">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <H2 className="md:text-3xl text-foreground">
              Facturation & Abonnements
            </H2>
            <P className="text-muted-foreground mt-2">
              Gérez votre abonnement et suivez votre consommation de crédits
            </P>
          </div>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <P className="text-sm font-medium text-muted-foreground">
                  Crédits restants
                </P>
                <P className="text-2xl font-bold text-primary">
                  {user?.creditBalance || 0}
                </P>
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="flex items-center space-x-3">
              <div className="bg-muted p-3 rounded-lg">
                <Crown className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <P className="text-sm font-medium text-muted-foreground">
                  Plan actuel
                </P>
                <P className="text-2xl font-bold text-foreground">
                  {user?.plans?.name || "Free"}
                </P>
              </div>
            </CardContent>
          </Card>

          <Card className="">
            <CardContent className="flex items-center space-x-3">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <P className="text-sm font-medium text-muted-foreground">
                  Prochain renouvellement
                </P>
                <P className="text-2xl font-bold text-primary">
                  {user?.renewalDate
                    ? new Date(user.renewalDate).toLocaleDateString("fr-FR")
                    : "N/A"}
                </P>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section plans avec intégration Stripe */}
        <div>
          <H3 className="text-xl font-semibold text-foreground mb-6">
            Choisissez votre plan
          </H3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={cn(
                  "transition-all duration-200",
                  plan.color,
                  plan.popular ? "ring-2 ring-primary scale-105" : ""
                )}
              >
                <CardContent>
                  {plan.popular && (
                    <div className="bg-primary text-white text-center py-2 px-4 text-sm font-semibold rounded-t-lg -m-6 mb-4">
                      ⭐ RECOMMANDÉ
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <H4 className="text-lg font-semibold text-card-foreground">
                      {plan.name}
                    </H4>
                    {plan.icon && (
                      <plan.icon className="w-6 h-6 text-primary" />
                    )}
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-card-foreground">
                      {plan.priceCents === 0
                        ? "Gratuit"
                        : `${plan.priceCents / 100}€`}
                    </span>
                    {plan.priceCents > 0 && (
                      <span className="text-muted-foreground">/mois</span>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePlanChange(plan.name)}
                    disabled={plan.name === currentPlan || upgrading}
                    className={cn(
                      "w-full",
                      plan.name === currentPlan &&
                        "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                    variant={plan.buttonVariant}
                  >
                    {plan.name === currentPlan
                      ? "Actif"
                      : upgrading
                        ? "Traitement..."
                        : "Souscrire"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Gestion Stripe */}
        <Card className="">
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-card-foreground">
                Votre abonnement Stripe
              </h3>
              {user?.stripeSubscriptionId && (
                <LinkButton
                  to={`https://dashboard.stripe.com/subscriptions/${user.stripeSubscriptionId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gérer dans Stripe
                </LinkButton>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-lg">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">Statut</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.stripeSubscriptionStatus || "Non actif"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section crédits */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-primary mb-2">
                  Comment fonctionnent les crédits ?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chaque module consomme un certain nombre de crédits selon sa
                  complexité. Vos crédits se renouvellent automatiquement chaque
                  mois.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background rounded-lg p-3 border border-primary/20">
                    <div className="font-medium text-primary mb-1">
                      Modules IA
                    </div>
                    <div className="text-sm text-muted-foreground">
                      15-50 crédits par utilisation
                    </div>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-primary/20">
                    <div className="font-medium text-primary mb-1">
                      Réseaux sociaux
                    </div>
                    <div className="text-sm text-muted-foreground">
                      8-25 crédits par publication
                    </div>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-primary/20">
                    <div className="font-medium text-primary mb-1">
                      Transcription
                    </div>
                    <div className="text-sm text-muted-foreground">
                      20-60 crédits par fichier
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-muted p-3 rounded-lg">
                  <Headphones className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-card-foreground">
                    Besoin d'aide ?
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Notre équipe support est là pour vous accompagner
                  </p>
                </div>
              </div>
              <Button variant={"outline"}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Contacter le support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </WithHeader>
  );
}
