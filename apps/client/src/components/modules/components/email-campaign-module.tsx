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
import type { Message } from "../module-types";
import z from "zod";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
import { generateUuid } from "@/lib/generate-uuid";

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

const formSchema = z.object({
  campaignName: z.string().min(1).max(200),
  campaignType: z.string().default("newsletter").optional(),
  campaignObjective: z.string().min(0).optional(),
  audienceType: z.string().default("allSubscribers").optional(),
  audienceSize: z.number().min(1).max(100000).default(1000).optional(),
  contentStyle: z.string().default("professional").optional(),
  callToAction: z.string().optional(),
  keyMessages: z.array(z.string()).min(1).max(5).default([""]).optional(),
  sendImmediately: z.boolean().default(false).optional(),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  selectedIntegration: z.string().optional().nullable(),
  enableTracking: z.boolean().default(true).optional(),
  trackOpens: z.boolean().default(true).optional(),
  trackClicks: z.boolean().default(true).optional(),
  enableConversionTracking: z.boolean().default(false).optional(),
});
type FormType = z.infer<typeof formSchema>;

export default function EmailCampaignModule({
  module,
}: EmailCampaignModuleProps) {
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const currentBalance = balance;
  const permissions = usePremiumFeatures();
  const chatRef = useRef<ChatRef>(null);
  const sessionId = useMemo(() => generateUuid(), []);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentGenerationStep, setCurrentGenerationStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { message: welcomeMessage, timestamp: new Date(), type: "bot", data: null },
  ]);

  const form = useAppForm({
    defaultValues: {
      campaignName: "",
      campaignType: "newsletter",
      campaignObjective: "",
      audienceType: "allSubscribers",
      audienceSize: 1000,
      contentStyle: "professional",
      callToAction: "",
      keyMessages: [""],
      sendImmediately: false,
      scheduledDate: "",
      scheduledTime: "",
      selectedIntegration: "",
      enableTracking: true,
      trackOpens: true,
      trackClicks: true,
      enableConversionTracking: false,
    } as FormType,
    validators: {
      onSubmit: formSchema,
    },
    onSubmitInvalid(props) {
      console.log(props.formApi.getAllErrors());

      toast.error("Veuillez corriger les champs du formulaire.");
    },
    onSubmit: async () => {
      console.log("buildFullContext()", buildFullContext());

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

      setLoading(false);
      isSubmitting.current = false;
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
        setProgress(0);
        setCurrentGenerationStep("");

        return {
          success: true,
        } as const;
      }
      setProgress(0);
      setCurrentGenerationStep("");
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
    },
  });
  // ✅ ÉTATS PRINCIPAUX - CHAT
  const [activeTab, setActiveTab] = useState("chat");
  const [chatState, setChatState] = useState<
    "missing" | "ready_for_confirmation" | "confirmed"
  >("missing");

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
    const {
      campaignType: _campaignType,
      audienceType: _audienceType,
      audienceSize: _audienceSize,
      enableConversionTracking: _enableConversionTracking,
      selectedIntegration: _selectedIntegration,
    } = form.store.state.values;

    let baseCost = config.baseCost;

    // Coût selon le type de campagne
    const campaignConfig = campaignTypesFromAPI[_campaignType || ""];
    if (campaignConfig) {
      baseCost *= campaignConfig.cost;
    }

    // Coût selon l'audience
    const audienceConfig = audienceTypesFromAPI[_audienceType || ""];
    if (audienceConfig) {
      baseCost *= audienceConfig.cost;
    }

    // Coût selon la taille de l'audience (par tranche de 1000)
    baseCost += Math.ceil((_audienceSize || 0) / 1000) * 2;

    // Options premium
    if (_enableConversionTracking) baseCost += 5;

    // Intégration setup
    if (_selectedIntegration) {
      const integrationConfig = integrationOptionsFromAPI[_selectedIntegration];
      if (integrationConfig) {
        baseCost += integrationConfig.setupCost;
      }
    }

    return Math.max(Math.ceil(baseCost), 15);
  };

  const buildFullContext = () => {
    const {
      campaignObjective,
      campaignType,
      audienceSize,
      audienceType,
      callToAction,
      campaignName,
      contentStyle,
      enableConversionTracking,
      enableTracking,
      scheduledDate,
      scheduledTime,
      selectedIntegration,
      sendImmediately,
      trackClicks,
      trackOpens,
    } = form.store.state.values;
    const validKeyMessages = (form.store.state.values.keyMessages || []).filter(
      (msg: string) => msg.trim()
    );

    return {
      campaign: {
        name: campaignName?.trim(),
        objective: campaignObjective?.trim(),
        type: campaignType,
        style: contentStyle,
        callToAction: callToAction?.trim(),
        keyMessages: validKeyMessages,
      },
      audience: {
        type: audienceType,
        size: audienceSize,
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
      context: {
        ...buildFullContext(),
        content: { chatState, ...(params.content || {}) },
      },
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

    // Vérifications Premium
    if (
      campaignTypesFromAPI[form.store.state.values.campaignType || ""]
        ?.premium &&
      !permissions.data?.isPremium
    ) {
      toast.error("Ce type de campagne est réservé aux abonnés Premium.");
      return false;
    }

    if (
      (form.store.state.values.audienceSize || 0) > 10000 &&
      !permissions.data?.isPremium
    ) {
      toast.error(
        "Les audiences de plus de 10 000 contacts nécessitent un abonnement Premium."
      );
      return false;
    }

    return true;
  };

  const addKeyMessage = () => {
    const km = form.store.state.values.keyMessages || [];
    if ((km.length || 0) < 5) {
      form.setFieldValue("keyMessages", (prev) => [...(prev || []), ""]);
    }
  };

  const removeKeyMessage = (index: number) => {
    const km = form.store.state.values.keyMessages || [];
    if ((km.length || 0) > 1) {
      form.setFieldValue("keyMessages", (prev) =>
        (prev || []).filter((_, i) => i !== index)
      );
    }
  };

  return (
    <div className="w-full  mx-auto space-y-4">
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
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
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

            <form
              id="document-form"
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <TabsContent value="chat" className="space-y-4">
                {/* Indicateur amélioré */}
                <div className="bg-gray-50 border rounded-lg p-3 text-xs space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="font-medium">État :</span>
                    <span>{"Connecté"}</span>
                  </div>
                  <div className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded">
                    💡 Les crédits ne seront utilisés qu'après validation de
                    votre configuration
                  </div>
                  <form.Subscribe
                    selector={(s) => ({
                      campaignObjective: s.values.campaignObjective,
                      audienceSize: s.values.audienceSize,
                      keyMessages: s.values.keyMessages,
                    })}
                  >
                    {({ campaignObjective, audienceSize, keyMessages }) => (
                      <div className="grid grid-cols-4 gap-2 text-gray-600">
                        <div>
                          Objectif:{" "}
                          {(campaignObjective || "").trim() ? "✅" : "❌"}
                        </div>
                        <div>
                          Audience:{" "}
                          {((audienceSize as number) || 1000) !== 1000
                            ? "✅"
                            : "❌"}
                        </div>
                        <div>
                          Messages:{" "}
                          {((keyMessages || []) as string[]).filter((m) =>
                            m?.trim()
                          ).length > 0
                            ? "✅"
                            : "❌"}
                        </div>
                        <div>
                          Plan: {authUser?.plans?.name || "non connecté"}{" "}
                          {permissions.data?.isPremium ? "👑" : "🆓"}
                        </div>
                      </div>
                    )}
                  </form.Subscribe>
                  <div className="text-gray-500">
                    Balance: {currentBalance} • Session:{" "}
                    {sessionId?.slice(-8)}{" "}
                  </div>
                </div>

                <Chat
                  ref={chatRef}
                  welcomeMessage={welcomeMessage}
                  conversationHistory={conversationHistory}
                  setConversationHistory={setConversationHistory}
                  onSubmit={async ({ message }) => {
                    const response = await chatWithModule({
                      message,
                    });
                    if (response.success) {
                      const outputMessage =
                        response.data.data.outputMessage || "";
                      if (
                        response.data.data.module_type == "email-campaign" &&
                        outputMessage.length > 0
                      ) {
                        const { result_partial } = response.data.data.output;
                        form.setFieldValue(
                          "audienceSize",
                          result_partial?.audience?.size ||
                            form.store.state.values.audienceSize
                        );
                        form.setFieldValue(
                          "audienceType",
                          result_partial?.audience?.type ||
                            form.store.state.values.audienceType
                        );
                        form.setFieldValue(
                          "campaignName",
                          result_partial?.campaign?.name ||
                            form.store.state.values.campaignName
                        );
                        form.setFieldValue(
                          "campaignObjective",
                          result_partial?.campaign?.objective ||
                            form.store.state.values.campaignObjective
                        );
                        form.setFieldValue(
                          "campaignType",
                          result_partial?.campaign?.type ||
                            form.store.state.values.campaignType
                        );
                        form.setFieldValue(
                          "contentStyle",
                          result_partial?.campaign?.style ||
                            form.store.state.values.contentStyle
                        );
                        form.setFieldValue(
                          "callToAction",
                          result_partial?.campaign?.call_to_action ||
                            form.store.state.values.callToAction
                        );
                        form.setFieldValue(
                          "keyMessages",
                          result_partial?.campaign?.key_messages ||
                            form.store.state.values.keyMessages
                        );
                        setChatState(response.data.data.output.state);

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
                {chatState === "ready_for_confirmation" && (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 text-green-800 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Configuration terminée !
                      </h3>
                      <p className="text-sm text-green-700 mb-3">
                        Votre campagne est prête à être générée avec les
                        paramètres définis par l'IA.
                      </p>
                      <form.Subscribe
                        selector={(s) => ({
                          campaignObjective: s.values.campaignObjective,
                          audienceSize: s.values.audienceSize,
                          campaignType: s.values.campaignType,
                        })}
                      >
                        {({
                          campaignObjective,
                          audienceSize,
                          campaignType,
                        }) => (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Objectif:</span>{" "}
                              {campaignObjective || "Défini par IA"}
                            </div>
                            <div>
                              <span className="font-medium">Audience:</span>{" "}
                              {(audienceSize as number)?.toLocaleString()}{" "}
                              contacts
                            </div>
                            <div>
                              <span className="font-medium">Type:</span>{" "}
                              {
                                campaignTypesFromAPI[
                                  (campaignType as string) || ""
                                ]?.label
                              }
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
                        )}
                      </form.Subscribe>
                    </div>
                    <form.AppForm>
                      <form.SubmitButton
                        className="w-full"
                        size="lg"
                        disabled={loading || !hasEnoughCredits(currentCost())}
                        isLoading={loading}
                      >
                        {!loading && (
                          <div className="flex items-center space-x-2">
                            <Send className="h-4 w-4" />
                            <span>
                              🚀 Créer la campagne ({currentCost()} crédits)
                            </span>
                          </div>
                        )}
                        {loading && <LoadingSpinner />}
                      </form.SubmitButton>
                    </form.AppForm>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="content" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <form.AppField
                    name="campaignName"
                    children={(field) => (
                      <>
                        <field.InputField
                          label="Nom de la campagne"
                          placeholder="Ma super campagne 2024"
                          required
                        />
                      </>
                    )}
                  />

                  <form.AppField name="campaignType">
                    {(field) => (
                      <field.SelectField
                        label="Type de campagne"
                        placeholder="Sélectionnez un type"
                        options={Object.entries(campaignTypesFromAPI).map(
                          ([key, lang]) => ({
                            label: (
                              <div className="flex items-center space-x-2">
                                <span>{lang.label}</span>
                                {lang.premium && (
                                  <Badge
                                    variant="secondary"
                                    className="bg-amber-100 text-amber-700 text-xs"
                                  >
                                    <Crown className="h-3 w-3 mr-1" />
                                    Premium
                                  </Badge>
                                )}
                              </div>
                            ),
                            value: key,
                            // disabled:
                            //   type.premium && !permissions.data?.isPremium,
                          })
                        )}
                      />
                    )}
                  </form.AppField>
                </div>

                <form.AppField name="campaignObjective">
                  {(field) => (
                    <div className="space-y-4">
                      <field.TextareaField
                        id="campaignObjective"
                        label="Objectif de la campagne"
                        placeholder="Décrivez l'objectif principal de votre campagne..."
                        textareaClassName="min-h-[100px]"
                      />
                    </div>
                  )}
                </form.AppField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <form.AppField name="audienceType">
                      {(field) => (
                        <field.SelectField
                          label="Type d'audience"
                          options={Object.entries(audienceTypesFromAPI).map(
                            ([key, audience]) => ({
                              label: (
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
                              ),
                              value: key,
                              disabled:
                                audience.premium &&
                                !permissions.data?.isPremium,
                            })
                          )}
                        />
                      )}
                    </form.AppField>
                  </div>

                  <div className="space-y-4">
                    <form.AppField name="audienceSize">
                      {(field) => (
                        <div>
                          <field.InputField
                            label="Taille de l'audience"
                            type="number"
                            min={1}
                            max={permissions.data?.isPremium ? 100000 : 10000}
                            className="w-32"
                          />
                        </div>
                      )}
                    </form.AppField>
                    <span className="text-sm text-muted-foreground">
                      contacts (max:{" "}
                      {permissions.data?.isPremium ? "100K" : "10K"})
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Messages clés à transmettre</Label>
                    <form.Subscribe
                      selector={(s) => ({ keyMessages: s.values.keyMessages })}
                    >
                      {(values) => {
                        const kms = (values.keyMessages || []) as string[];
                        const validCount = kms.filter((m) => m?.trim()).length;
                        return (
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground">
                              {validCount}/5
                            </span>
                            <Button
                              onClick={addKeyMessage}
                              disabled={(kms.length || 0) >= 5}
                              variant="outline"
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Ajouter
                            </Button>
                          </div>
                        );
                      }}
                    </form.Subscribe>
                  </div>

                  <div className="space-y-3">
                    <form.Subscribe
                      selector={(s) => ({ keyMessages: s.values.keyMessages })}
                    >
                      {({ keyMessages }) =>
                        (keyMessages || []).map((_, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <div className="flex-1">
                              <form.AppField name={`keyMessages[${index}]`}>
                                {(field) => (
                                  <field.InputField
                                    label={`Message ${index + 1}`}
                                    placeholder={`Message ${index + 1}: Ex: Nouveau produit révolutionnaire`}
                                  />
                                )}
                              </form.AppField>
                            </div>
                            {(keyMessages || []).length > 1 && (
                              <Button
                                onClick={() => removeKeyMessage(index)}
                                variant="destructive-outline"
                                size="sm"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))
                      }
                    </form.Subscribe>
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
                      <form.Subscribe
                        selector={(s) => ({
                          sendImmediately: s.values.sendImmediately,
                        })}
                      >
                        {({ sendImmediately }) => (
                          <>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="sendImmediately"
                                checked={sendImmediately}
                                onCheckedChange={(checked) =>
                                  form.setFieldValue(
                                    "sendImmediately",
                                    checked == true
                                  )
                                }
                              />
                              <Label htmlFor="sendImmediately">
                                Envoyer immédiatement
                              </Label>
                            </div>

                            {!sendImmediately && (
                              <div className="space-y-4 pl-6">
                                <div>
                                  <form.AppField name="scheduledDate">
                                    {(field) => (
                                      <field.InputField
                                        label="Date d'envoi"
                                        type="date"
                                        min={
                                          new Date().toISOString().split("T")[0]
                                        }
                                      />
                                    )}
                                  </form.AppField>
                                </div>
                                <div>
                                  <form.AppField name="scheduledTime">
                                    {(field) => (
                                      <field.InputField
                                        label="Heure d'envoi"
                                        type="time"
                                      />
                                    )}
                                  </form.AppField>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </form.Subscribe>
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
                    <form.AppField name="selectedIntegration">
                      {(field) => (
                        <field.SelectField
                          label="Plateforme d'envoi"
                          options={Object.entries(
                            integrationOptionsFromAPI
                          ).map(([key, integration]) => ({
                            label: (
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
                            ),
                            value: key,
                            disabled:
                              integration.premium &&
                              !permissions.data?.isPremium,
                          }))}
                        />
                      )}
                    </form.AppField>

                    <form.Subscribe
                      selector={(s) => ({
                        selectedIntegration: s.values.selectedIntegration,
                      })}
                    >
                      {({ selectedIntegration }) =>
                        selectedIntegration ? (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-800">
                                {
                                  integrationOptionsFromAPI[
                                    selectedIntegration ?? ""
                                  ]?.label
                                }{" "}
                                sélectionné
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              Coût d'installation :{" "}
                              {
                                integrationOptionsFromAPI[
                                  selectedIntegration ?? ""
                                ]?.setupCost
                              }{" "}
                              crédits
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              Coût mensuel :{" "}
                              {
                                integrationOptionsFromAPI[
                                  selectedIntegration ?? ""
                                ]?.monthlyCost
                              }{" "}
                              crédits/mois
                            </p>
                          </div>
                        ) : null
                      }
                    </form.Subscribe>
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
                    <form.Subscribe
                      selector={(s) => ({
                        enableTracking: s.values.enableTracking,
                        trackOpens: s.values.trackOpens,
                        trackClicks: s.values.trackClicks,
                        enableConversionTracking:
                          s.values.enableConversionTracking,
                      })}
                    >
                      {({
                        enableTracking,
                        trackOpens,
                        trackClicks,
                        enableConversionTracking,
                      }) => (
                        <>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="enableTracking"
                                checked={enableTracking}
                                onCheckedChange={(checked) =>
                                  form.setFieldValue(
                                    "enableTracking",
                                    checked == true
                                  )
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
                                      form.setFieldValue(
                                        "trackOpens",
                                        checked == true
                                      )
                                    }
                                  />
                                  <Label htmlFor="trackOpens">
                                    Taux d'ouverture
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="trackClicks"
                                    checked={trackClicks}
                                    onCheckedChange={(checked) =>
                                      form.setFieldValue(
                                        "trackClicks",
                                        checked == true
                                      )
                                    }
                                  />
                                  <Label htmlFor="trackClicks">
                                    Taux de clic
                                  </Label>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="enableConversionTracking"
                                    checked={enableConversionTracking}
                                    onCheckedChange={(checked) =>
                                      form.setFieldValue(
                                        "enableConversionTracking",
                                        checked == true
                                      )
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
                        </>
                      )}
                    </form.Subscribe>
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
                          <form.Subscribe
                            selector={(s) => ({
                              audienceSize: s.values.audienceSize,
                            })}
                          >
                            {({ audienceSize }) => (
                              <>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Très engagés</span>
                                  <Badge
                                    variant="default"
                                    className="bg-green-600"
                                  >
                                    {Math.round(
                                      (audienceSize || 0) * 0.15
                                    ).toLocaleString()}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">
                                    Moyennement engagés
                                  </span>
                                  <Badge variant="secondary">
                                    {Math.round(
                                      (audienceSize || 0) * 0.35
                                    ).toLocaleString()}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm">Peu engagés</span>
                                  <Badge variant="outline">
                                    {Math.round(
                                      (audienceSize || 0) * 0.5
                                    ).toLocaleString()}
                                  </Badge>
                                </div>
                              </>
                            )}
                          </form.Subscribe>
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
                    <form.Subscribe
                      selector={(s) => ({
                        audienceType: s.values.audienceType,
                      })}
                    >
                      {({ audienceType }) =>
                        audienceType === "allSubscribers" ? (
                          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Filter className="h-4 w-4 text-yellow-600" />
                              <span className="font-medium text-yellow-800">
                                Segmenter l'audience
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              La segmentation peut augmenter les taux de clic de
                              +25%.
                            </p>
                          </div>
                        ) : null
                      }
                    </form.Subscribe>
                  </div>
                </div>
              </TabsContent>
            </form>
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
