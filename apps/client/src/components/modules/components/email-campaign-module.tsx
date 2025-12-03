import { toast } from "@oppsys/ui/lib/sonner";
import type { Module } from "../module-types";
import { useAuth } from "../../auth/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { modulesService } from "../service/modules-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@oppsys/ui/components/card";
import { Button } from "@oppsys/ui/components/button";
import { Label } from "@oppsys/ui/components/label";
import { Textarea } from "@oppsys/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@oppsys/ui/components/select";
import { Input } from "@oppsys/ui/components/input";
import { Badge } from "@oppsys/ui/components/badge";
import { Progress } from "@oppsys/ui/components/progress";
import { Alert, AlertDescription } from "@oppsys/ui/components/alert";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@oppsys/ui/components/tabs";
import { Checkbox } from "@oppsys/ui/components/checkbox";
import {
  Mail,
  Send,
  Crown,
  CheckCircle,
  AlertCircle,
  Brain,
  MessageSquare,
  Plus,
  X,
  Calendar,
  Settings,
  BarChart3,
  Users,
  Smartphone,
  Monitor,
  TrendingUp,
  Filter,
} from "lucide-react";
import { LoadingSpinner } from "../../loading";
import type { MODULES_IDS } from "@oppsys/api";
import { useMemo, useRef, useState } from "react";
import { Chat, type ChatRef } from "../shared/chat";

type EmailCampaignModuleProps = {
  module: Module;
};

type Config = Extract<
  Module["config"],
  { configType: typeof MODULES_IDS.EMAIL_CAMPAIGN }
>;

const welcomeMessage = `👋 Bonjour ! Je vais vous aider à créer votre campagne email.

Pour commencer : **que voulez-vous accomplir avec cette campagne ?**

Par exemple : "générer des leads", "promouvoir un produit", "inviter à un événement"...

*Aucun crédit ne sera consommé tant que nous n'aurons pas finalisé votre configuration.*`;

export default function EmailCampaignModule({
  module,
}: EmailCampaignModuleProps) {
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const currentBalance = balance;
  const permissions = usePremiumFeatures();
  const chatRef = useRef<ChatRef>(null);
  // TODO: generate from uuidv7
  const sessionId = useMemo(() => Math.random().toString(), []);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGenerationStep, setCurrentGenerationStep] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ✅ ÉTATS PRINCIPAUX - CHAT
  const [currentStep, setCurrentStep] = useState(0);

  // ✅ CONFIGURATION CAMPAGNE
  const [campaignObjective, setCampaignObjective] = useState("");
  const [campaignType, setCampaignType] = useState("newsletter");
  const [audienceType, setAudienceType] = useState("allSubscribers");
  const [contentStyle, setContentStyle] = useState("professional");
  const [campaignName, setCampaignName] = useState("");

  // ✅ CONTENU
  const [emailSubject, setEmailSubject] = useState("");
  const [emailContent, setEmailContent] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [keyMessages, setKeyMessages] = useState([""]);

  // ✅ PLANNING ET ENVOI
  const [sendImmediately, setSendImmediately] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  // ✅ TRACKING ET ANALYTICS
  const [enableTracking, setEnableTracking] = useState(true);
  const [trackOpens, setTrackOpens] = useState(true);
  const [trackClicks, setTrackClicks] = useState(true);
  const [enableConversionTracking, setEnableConversionTracking] =
    useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  // ✅ INTÉGRATIONS
  const [selectedIntegration, setSelectedIntegration] = useState("");
  const [audienceSize, setAudienceSize] = useState(1000);

  // ✅ RÉFÉRENCES
  const isSubmitting = useRef(false);

  const config = useMemo(
    () => (module.config || {}) as Config,
    [module.config]
  );
  const campaignTypesFromAPI = useMemo(
    () => config?.campaignTypes || {},
    [config]
  );
  const audienceTypesFromAPI = useMemo(
    () => config?.audienceTypes || [],
    [config]
  );
  const integrationOptionsFromAPI = useMemo(
    () => config.integrationOptions || [],
    [config]
  );
  const currentCost = () => {
    let baseCost = config.baseCost;

    // Coût selon le type de campagne
    const campaignConfig = campaignTypesFromAPI[campaignType];
    if (campaignConfig) {
      baseCost *= campaignConfig.cost;
    }

    // Coût selon l'audience
    const audienceConfig = audienceTypesFromAPI[audienceType];
    if (audienceConfig) {
      baseCost *= audienceConfig.cost;
    }

    // Coût selon la taille de l'audience (par tranche de 1000)
    baseCost += Math.ceil(audienceSize / 1000) * 2;

    // Options premium
    if (enableConversionTracking) baseCost += 5;

    // Intégration setup
    if (selectedIntegration) {
      const integrationConfig = integrationOptionsFromAPI[selectedIntegration];
      if (integrationConfig) {
        baseCost += integrationConfig.setupCost;
      }
    }

    return Math.max(Math.ceil(baseCost), 15);
  };
  const validKeyMessages = keyMessages.filter((msg) => msg.trim());

  const buildFullContext = () => {
    console.log("DEBUG AUTH USER dans buildFullContext:", {
      authUser: authUser,
      plan: authUser?.plans?.name,
      permissions: permissions,
      isPremium: permissions.data?.isPremium,
    });

    return {
      campaign: {
        name: campaignName.trim(),
        objective: campaignObjective.trim(),
        type: campaignType,
        style: contentStyle,
      },
      audience: {
        type: audienceType,
        size: audienceSize,
      },
      content: {
        subject: emailSubject.trim(),
        body: emailContent.trim(),
        callToAction: callToAction.trim(),
        keyMessages: validKeyMessages,
      },
      automation: {
        sendImmediately,
        scheduledDate,
        scheduledTime,
        selectedIntegration,
      },
      tracking: {
        enableTracking,
        trackOpens,
        trackClicks,
        enableConversionTracking,
      },
      user: {
        plan: authUser?.plans?.monthlyCredits || "free",
        isPremium: permissions.data?.isPremium || false,
        balance: currentBalance || 0,
      },
      conversation: {
        currentStep: currentStep,
        isComplete: currentStep === 999,
        hasPreConfig: Boolean(
          campaignObjective.trim() ||
            emailSubject.trim() ||
            validKeyMessages.length > 0
        ),
      },
      metadata: {
        sessionId,
        timestamp: new Date().toISOString(),
        moduleType: "email-campaign",
        currentCost: currentCost(),
      },
    };
  };

  const chatWithModule = async (params: {
    message: string;
    content?: Record<string, string>;
  }) => {
    const response = await modulesService.chatWithModule(module.slug, {
      sessionId,
      message: params.message,
      context: { ...buildFullContext(), content: params.content ?? {} },
    });
    return response;
  };

  const validateForm = () => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return false;
    }
    if (!hasEnoughCredits(currentCost())) {
      toast.error("Crédits insuffisants.");
      return false;
    }

    // Pour le chat, on est plus flexible sur la validation
    if (!campaignObjective.trim() && currentStep < 999) {
      toast.error("Veuillez terminer la conversation avec l'assistant IA.");
      return false;
    }

    // Vérifications Premium
    if (
      campaignTypesFromAPI[campaignType]?.premium &&
      !permissions.data?.isPremium
    ) {
      toast.error("Ce type de campagne est réservé aux abonnés Premium.");
      return false;
    }

    if (audienceSize > 10000 && !permissions.data?.isPremium) {
      toast.error(
        "Les audiences de plus de 10 000 contacts nécessitent un abonnement Premium."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting.current || loading) return;
    if (!validateForm()) return;
    if (loading || !hasEnoughCredits(currentCost()) || !sessionId) return;

    setError(null);

    isSubmitting.current = true;
    setLoading(true);

    setCurrentGenerationStep("Génération du contenu avec l'IA...");
    setProgress(40);

    const generationMessage =
      "Générer maintenant le contenu complet avec toutes les informations collectées";

    const response = await chatWithModule({
      message: generationMessage,
      content: { chatState: "confirmed" },
    });

    if (response.success) {
      setProgress(50);
      setCurrentGenerationStep("Génération en cours en arrière-plan...");
      chatRef.current?.addMessage({
        type: "bot",
        message: response.data.data.outputMessage || "",
        data: null,
      });
      toast.success("Génération lancée !", {
        description:
          'Le contenu sera disponible dans "Mon Contenu" dans quelques minutes.',
        duration: 5000,
      });

      setLoading(false);
      setProgress(0);
      setCurrentGenerationStep("");
      isSubmitting.current = false;
      return {
        success: true,
      } as const;
    }
    console.error("Erreur du chat du module:", response);
    chatRef.current?.addMessage({
      type: "bot",
      message: `❌ **Erreur de génération**
  
            Une erreur est survenue lors de la génération du contenu.
  
            **Solutions possibles :**
            • Réessayez la génération
            • Vérifiez vos crédits
            • Contactez le support si le problème persiste`,
      data: null,
    });
    return {
      success: false,
    } as const;
  };

  const addKeyMessage = () => {
    if (keyMessages.length < 5) {
      setKeyMessages((prev) => [...prev, ""]);
    }
  };

  const removeKeyMessage = (index: number) => {
    if (keyMessages.length > 1) {
      setKeyMessages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const updateKeyMessage = (index: number, value: string) => {
    setKeyMessages((prev) => {
      const newMessages = [...prev];
      newMessages[index] = value;
      return newMessages;
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-blue-500" />
                <CardTitle>Campagne Email</CardTitle>
                {permissions.data?.isPremium && (
                  <Badge variant="secondary">
                    <Crown className="h-3 w-3 mr-1" />
                    PREMIUM
                  </Badge>
                )}
                {permissions.data?.isPremium && (
                  <Badge variant="secondary">
                    <Brain className="h-3 w-3 mr-1" />
                    IA
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-green-100 to-green-200 text-green-700"
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  WK
                </Badge>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Solde: {formatBalance()}</Badge>
              <Badge variant="outline">
                Coût estimé: {currentCost()} crédits
              </Badge>
            </div>
          </div>
          <CardDescription>
            Créez des campagnes email performantes avec notre assistant IA
            conversationnel.
          </CardDescription>
          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full "bg-green-500`}></div>
              <span className={`text-green-600`}>{"Connecté"}</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Session: {sessionId?.slice(-8)}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Plan: {authUser?.plans?.name || "free"}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={`grid w-full ${permissions.data?.isFree ? "grid-cols-5" : "grid-cols-4"}`}
            >
              <TabsTrigger value="chat">Assistant IA</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="automation">Automation</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              {permissions.data?.isFree && (
                <TabsTrigger value="premium">Premium</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
              {/* Indicateur amélioré */}
              <div className="bg-gray-50 border rounded-lg p-3 text-xs space-y-1">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full"bg-green-500"`}></div>
                  <span className="font-medium">État :</span>
                  <span>{"Connecté"}</span>
                </div>
                <div className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">
                  💡 Les crédits ne seront utilisés qu'après validation de votre
                  configuration
                </div>
                <div className="grid grid-cols-4 gap-2 text-gray-600">
                  <div>Objectif: {campaignObjective.trim() ? "✅" : "❌"}</div>
                  <div>Audience: {audienceSize !== 1000 ? "✅" : "❌"}</div>
                  <div>
                    Messages: {validKeyMessages.length > 0 ? "✅" : "❌"}
                  </div>
                  <div>
                    Plan: {authUser?.plans?.name || "non connecté"}{" "}
                    {permissions.data?.isPremium ? "👑" : "🆓"}
                  </div>
                </div>
                <div className="text-gray-500">
                  Balance: {currentBalance} • Session: {sessionId?.slice(-8)} •
                  Étape: {currentStep}
                </div>
              </div>

              <Chat
                ref={chatRef}
                welcomeMessage={welcomeMessage}
                onSubmit={async ({ message }) => {
                  const response = await chatWithModule({
                    message,
                  });
                  if (response.success) {
                    const outputMessage =
                      response.data.data.outputMessage || "";
                    if (
                      // response.data.data.module_type == "ai-writer" &&
                      outputMessage.length > 0
                    ) {
                      // TODO: update state after finishing workflow
                      void setCurrentStep;
                      void setContentStyle;
                      void setEmailSubject;
                      void setEmailContent;
                      void setCallToAction;
                      return {
                        success: true,
                        data: {
                          aiResponse: outputMessage,
                        },
                      };
                    }
                  }

                  console.error("❌ Chat error:", response);
                  return {
                    success: false,
                    error:
                      "error" in response
                        ? new Error(response.error)
                        : new Error("unknown error"),
                    kind: "CHAT_ERROR",
                  };
                }}
              />

              {/* Bouton création campagne */}
              {currentStep === 999 && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                    <h3 className="font-semibold mb-2 text-green-800 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Configuration terminée !
                    </h3>
                    <p className="text-sm text-green-700 mb-3">
                      Votre campagne est prête à être générée avec les
                      paramètres définis par l'IA.
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Objectif:</span>{" "}
                        {campaignObjective || "Défini par IA"}
                      </div>
                      <div>
                        <span className="font-medium">Audience:</span>{" "}
                        {audienceSize.toLocaleString()} contacts
                      </div>
                      <div>
                        <span className="font-medium">Type:</span>{" "}
                        {campaignTypesFromAPI[campaignType]?.label}
                      </div>
                      <div>
                        <span className="font-medium">Coût total:</span>
                        <Badge
                          variant="default"
                          className="bg-green-600 text-white ml-2"
                        >
                          {currentCost()} crédits
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSubmit()}
                    disabled={loading || !hasEnoughCredits(currentCost())}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner />
                        <span>Création en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Send className="h-4 w-4" />
                        <span>
                          🚀 Créer la campagne ({currentCost()} crédits)
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="campaignName">Nom de la campagne</Label>
                  <Input
                    id="campaignName"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="Ma super campagne 2024"
                  />
                </div>

                <div className="space-y-4">
                  <Label htmlFor="campaignType">Type de campagne</Label>
                  <Select value={campaignType} onValueChange={setCampaignType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(campaignTypesFromAPI).map(
                        ([key, type]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            disabled={
                              type.premium && !permissions.data?.isPremium
                            }
                          >
                            <div className="flex items-center space-x-2">
                              <span>{type.label}</span>
                              {type.premium && (
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-700 text-xs"
                                >
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="campaignObjective">
                  Objectif de la campagne
                </Label>
                <Textarea
                  id="campaignObjective"
                  value={campaignObjective}
                  onChange={(e) => setCampaignObjective(e.target.value)}
                  placeholder="Décrivez l'objectif principal de votre campagne..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="audienceType">Type d'audience</Label>
                  <Select value={audienceType} onValueChange={setAudienceType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez l'audience" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(audienceTypesFromAPI).map(
                        ([key, audience]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            disabled={
                              audience.premium && !permissions.data?.isPremium
                            }
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{audience.label}</span>
                              {audience.premium && (
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-700 text-xs ml-2"
                                >
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="audienceSize">Taille de l'audience</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="audienceSize"
                      type="number"
                      value={audienceSize}
                      onChange={(e) =>
                        setAudienceSize(parseInt(e.target.value) || 1000)
                      }
                      min="1"
                      max={permissions.data?.isPremium ? 100000 : 10000}
                      className="w-32"
                    />
                    <span className="text-sm text-muted-foreground">
                      contacts (max:{" "}
                      {permissions.data?.isPremium ? "100K" : "10K"})
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Messages clés à transmettre</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {validKeyMessages.length}/5
                    </span>
                    <Button
                      onClick={addKeyMessage}
                      disabled={keyMessages.length >= 5}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {keyMessages.map((message, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          value={message}
                          onChange={(e) =>
                            updateKeyMessage(index, e.target.value)
                          }
                          placeholder={`Message ${index + 1}: Ex: Nouveau produit révolutionnaire`}
                        />
                      </div>
                      {keyMessages.length > 1 && (
                        <Button
                          onClick={() => removeKeyMessage(index)}
                          variant="destructive-outline"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="automation" className="space-y-6">
              {/* Planning et envoi */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">Planning et envoi</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sendImmediately"
                        checked={sendImmediately}
                        onCheckedChange={(checked) =>
                          setSendImmediately(checked == true)
                        }
                      />
                      <Label htmlFor="sendImmediately">
                        Envoyer immédiatement
                      </Label>
                    </div>

                    {!sendImmediately && (
                      <div className="space-y-4 pl-6">
                        <div>
                          <Label htmlFor="scheduledDate">Date d'envoi</Label>
                          <Input
                            id="scheduledDate"
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor="scheduledTime">Heure d'envoi</Label>
                          <Input
                            id="scheduledTime"
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">
                        💡 Conseils d'envoi
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Mardi-Jeudi : meilleurs jours</li>
                        <li>• 10h-11h ou 14h-15h : horaires optimaux</li>
                        <li>• Évitez lundi matin et vendredi après-midi</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              {/* Intégrations */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">Intégrations</h3>
                </div>

                <div className="space-y-4">
                  <Label>Plateforme d'envoi</Label>
                  <Select
                    value={selectedIntegration}
                    onValueChange={setSelectedIntegration}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une plateforme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(integrationOptionsFromAPI).map(
                        ([key, integration]) => (
                          <SelectItem
                            key={key}
                            value={key}
                            disabled={
                              integration.premium &&
                              !permissions.data?.isPremium
                            }
                          >
                            <div className="flex items-center justify-between w-full">
                              <span>{integration.label}</span>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">
                                  {integration.setupCost} crédits
                                </Badge>
                                {integration.premium && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-700 text-xs"
                                  >
                                    <Crown className="h-3 w-3 mr-1" />
                                    Premium
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>

                  {selectedIntegration && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">
                          {
                            integrationOptionsFromAPI[selectedIntegration]
                              ?.label
                          }{" "}
                          sélectionné
                        </span>
                      </div>
                      <p className="text-sm text-green-700">
                        Coût d'installation :{" "}
                        {
                          integrationOptionsFromAPI[selectedIntegration]
                            ?.setupCost
                        }{" "}
                        crédits
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Coût mensuel :{" "}
                        {
                          integrationOptionsFromAPI[selectedIntegration]
                            ?.monthlyCost
                        }{" "}
                        crédits/mois
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {/* Tracking et métriques */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  <h3 className="text-lg font-semibold">
                    Tracking et métriques
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableTracking"
                        checked={enableTracking}
                        onCheckedChange={(checked) =>
                          setEnableTracking(checked == true)
                        }
                      />
                      <Label htmlFor="enableTracking">
                        Activer le tracking
                      </Label>
                    </div>

                    {enableTracking && (
                      <div className="space-y-4 pl-6">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="trackOpens"
                            checked={trackOpens}
                            onCheckedChange={(checked) =>
                              setTrackOpens(checked == true)
                            }
                          />
                          <Label htmlFor="trackOpens">Taux d'ouverture</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="trackClicks"
                            checked={trackClicks}
                            onCheckedChange={(checked) =>
                              setTrackClicks(checked == true)
                            }
                          />
                          <Label htmlFor="trackClicks">Taux de clic</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="enableConversionTracking"
                            checked={enableConversionTracking}
                            onCheckedChange={(checked) =>
                              setEnableConversionTracking(checked == true)
                            }
                            disabled={!permissions.data?.isPremium}
                          />
                          <Label htmlFor="enableConversionTracking">
                            Tracking conversions
                          </Label>
                          {!permissions.data?.isPremium && (
                            <Badge
                              variant="secondary"
                              className="bg-amber-100 text-amber-700 text-xs"
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {enableTracking && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">
                          📈 Métriques suivies
                        </h4>
                        <ul className="text-sm text-blue-700 space-y-1">
                          {trackOpens && <li>• Taux d'ouverture</li>}
                          {trackClicks && <li>• Taux de clic</li>}
                          {enableConversionTracking && (
                            <li>• Conversions et ROI</li>
                          )}
                          <li>• Désinscriptions</li>
                          <li>• Partages sociaux</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Segmentation audience */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-green-500" />
                  <h3 className="text-lg font-semibold">
                    Segmentation audience
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">
                        Répartition par appareil
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Mobile</span>
                          </div>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Monitor className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Desktop</span>
                          </div>
                          <span className="text-sm font-medium">35%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-3">Engagement prévu</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Très engagés</span>
                          <Badge variant="default" className="bg-green-600">
                            {Math.round(audienceSize * 0.15).toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Moyennement engagés</span>
                          <Badge variant="secondary">
                            {Math.round(audienceSize * 0.35).toLocaleString()}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Peu engagés</span>
                          <Badge variant="outline">
                            {Math.round(audienceSize * 0.5).toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optimisations recommandées */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold">
                    Optimisations recommandées
                  </h3>
                </div>

                <div className="space-y-4">
                  {audienceType === "allSubscribers" && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Filter className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">
                          Segmenter l'audience
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        La segmentation peut augmenter les taux de clic de +25%.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{currentGenerationStep}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
