import {
  useState,
  useRef,
  useMemo,
  useCallback,
  type ChangeEvent,
} from "react";
import { toast } from "@oppsys/ui/lib/sonner";
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
import { useNavigate } from "react-router";
import {
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  PenTool,
  FileText,
  Mail,
  Globe,
  Zap,
  Crown,
  Settings,
  Calendar,
  BarChart3,
  Info,
  Plus,
  Camera,
  Copy,
  Download,
  type LucideIcon,
  Brain,
  MessageSquare,
  XCircle,
  ExternalLink,
  Search,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import type { Module } from "../module-types";
import { modulesService } from "../service/modules-service";
import { documentService } from "../../documents/document-service";
import { LoadingSpinner } from "../../loading";
import type { RagDocument } from "../../documents/document-types";
import { MODULES_IDS } from "@oppsys/api/client";
import { validateDocumentFile } from "@/components/storage/file-storage-validator";
import { Chat, type ChatRef } from "../shared/chat";
import type { Message } from "../module-types";
import { generateUuid } from "@/lib/generate-uuid";

type AiWriterModuleProps = {
  module: Module;
};

type GeneratedResult = {
  content: string;
  fromChat?: boolean;
  sessionId?: string;
};

type Config = Extract<
  Module["config"],
  { configType: typeof MODULES_IDS.AI_WRITER }
>;

const welcomeMessage = `👋 Bienvenue dans l'AI Writer !

Je suis votre assistant conversationnel et je vais vous aider à créer le contenu parfait.

Pour commencer, dites-moi simplement :
**Quel type de contenu souhaitez-vous créer ?**

Exemple : "Un email de bienvenue pour mes nouveaux clients" ou "Un article sur l'IA en marketing"

Je vous poserai ensuite quelques questions pour affiner votre contenu. Aucun crédit ne sera consommé pendant notre conversation.
`;

export default function AIWriterModule({ module }: AiWriterModuleProps) {
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();
  const navigate = useNavigate();
  const chatRef = useRef<ChatRef>(null);

  const config = useMemo(
    () => (module.config || {}) as Config,
    [module.config]
  );
  const contentTypesFromAPI = useMemo(
    () => config?.contentTypes || {},
    [config]
  );
  const tonesFromAPI = useMemo(() => config?.tones || [], [config]);
  const lengthsFromAPI = useMemo(() => config?.lengths || [], [config]);
  const imageOptionsFromAPI = useMemo(
    () => config?.imageOptions || [],
    [config]
  );
  const premiumFeaturesFromAPI = useMemo(
    () => config.premiumFeatures || [],
    [config]
  );

  const [desciption, setDescription] = useState("");
  const [contentType, setContentType] = useState("article");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [imageOption, setImageOption] = useState("none");

  // Options avancées
  const [targetAudience, setTargetAudience] = useState("");
  const [keywords, setKeywords] = useState("");
  const [seoOptimize, setSeoOptimize] = useState(false);
  const [includeCallToAction, setIncludeCallToAction] = useState(false);

  // États de traitement et résultats
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [uploadingRag, setUploadingRag] = useState(false);
  const [ragUploadProgress, setRagUploadProgress] = useState(0);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [subject, setSubject] = useState("");
  const [chatState, setChatState] = useState<
    "missing" | "ready_for_confirmation" | "confirmed"
  >("missing");

  // SEO Tab States
  const [seoKeywordResearch, setSeoKeywordResearch] = useState("");
  const [seoLanguage, setSeoLanguage] = useState("fr");
  const [seoVolume, setSeoVolume] = useState("medium");
  const [keywordLoading, setKeywordLoading] = useState(false);

  // Media Tab States
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageStyle, setImageStyle] = useState("realistic");
  const [imageCount, setImageCount] = useState(1);
  const [generatingImage, setGeneratingImage] = useState(false);

  // Schedule Tab States
  const [schedulePost, setSchedulePost] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [publishPlatform, setPublishPlatform] = useState("blog");

  // Chat States
  const sessionId = useMemo(() => generateUuid(), []);
  const [activeTab, setActiveTab] = useState("chat");
  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { message: welcomeMessage, timestamp: new Date(), type: "bot", data: null },
  ]);

  //  ref
  const isSubmitting = useRef(false);
  const ragFileInputRef = useRef<HTMLInputElement>(null);

  const currentCost = useMemo(() => {
    const baseType = contentTypesFromAPI[contentType];
    if (!baseType) return 0;

    const baseCost = baseType.cost;
    const lengthMultiplier =
      lengthsFromAPI.find((l) => l.value === length)?.multiplier || 1;
    const imageCost =
      imageOptionsFromAPI.find((o) => o.value === imageOption)?.cost || 0;
    const seoMultiplier = seoOptimize ? 1.1 : 1;

    return Math.ceil(baseCost * lengthMultiplier * seoMultiplier + imageCost);
  }, [
    contentType,
    length,
    imageOption,
    seoOptimize,
    contentTypesFromAPI,
    lengthsFromAPI,
    imageOptionsFromAPI,
  ]);

  // ✅ VARIABLES DÉRIVÉES
  const currentBalance = balance;
  const currentContentType = contentTypesFromAPI[contentType];
  const currentTone = tonesFromAPI.find((t) => t.value === tone);
  const currentLength = lengthsFromAPI.find((l) => l.value === length);

  // ✅ FONCTIONS DE GESTION
  const handleNavigateToBilling = () => navigate("/billing");

  const validateForm = () => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return false;
    }
    if (!hasEnoughCredits(currentCost)) {
      toast.error("Crédits insuffisants.");
      return false;
    }
    if (!subject.trim()) {
      toast.error("Sujet requis.");
      return false;
    }
    // if (!prompt.trim() || prompt.trim().length < 10) {
    //   toast.error("Description trop courte (10 caractères min).");
    //   return false;
    // }
    if (!contentType) {
      toast.error("Veuillez sélectionner un type de contenu.");
      return false;
    }
    return true;
  };

  const chatWithModule = async (params: {
    message: string;
    content?: Record<string, string>;
  }) => {
    const content: Record<string, string> = {
      desciption: desciption.trim(),
      contentType,
      tone,
      length,
      imageOption,
      chatState,
      ...(params.content || {}),
    };
    if (subject.length > 0) {
      content.subject = subject;
    }
    const cleanContext = {
      content,
      options: {
        targetAudience: targetAudience.trim(),
        keywords: keywords.trim(),
        seoOptimize,
        includeCallToAction,
      },
      seo: {
        keywordResearch: seoKeywordResearch.trim(),
        seoLanguage,
        seoVolume,
      },
      media: {
        imagePrompt: imagePrompt.trim(),
        imageStyle,
        imageCount,
      },
      schedule: {
        schedulePost,
        scheduledDate,
        scheduledTime,
        publishPlatform,
      },
      metadata: {
        sessionId,
        timestamp: new Date().toISOString(),
        moduleType: "ai-writer",
        currentCost,
      },
    };
    const response = await modulesService.chatWithModule(module.slug, {
      sessionId,
      message: params.message,
      context: cleanContext,
    });
    return response;
  };

  const handleSubmit = async () => {
    if (isSubmitting.current || loading) return;
    if (!validateForm()) return;
    if (
      loading ||
      // !prompt.trim() ||
      !contentType ||
      !hasEnoughCredits(currentCost) ||
      !sessionId
    )
      return;

    setError(null);

    isSubmitting.current = true;
    setLoading(true);

    setCurrentStep("Génération du contenu avec l'IA...");
    setProgress(40);

    const generationMessage =
      "Générer maintenant le contenu complet avec toutes les informations collectées";

    const response = await chatWithModule({
      message: generationMessage,
      content: { chatState: "confirmed" },
    });

    if (response.success) {
      setProgress(50);
      setCurrentStep("Génération en cours en arrière-plan...");
      chatRef.current?.addMessage({
        data: null,
        message: response.data.data.outputMessage || "",
        type: "bot",
      });
      toast.success("Génération lancée !", {
        description:
          'Le contenu sera disponible dans "Mon Contenu" dans quelques minutes.',
        duration: 5000,
      });

      setLoading(false);
      setProgress(0);
      setCurrentStep("");
      isSubmitting.current = false;
      return {
        success: true,
      } as const;
    }
    console.error("Erreur du chat du module:", response);
    chatRef.current?.addMessage({
      data: null,
      message: `❌ **Erreur de génération**
  
            Une erreur est survenue lors de la génération du contenu.
  
            **Solutions possibles :**
            • Réessayez la génération
            • Vérifiez vos crédits
            • Contactez le support si le problème persiste`,
      type: "bot",
    });

    return {
      success: false,
    } as const;
  };

  const getIconForContentType = (key: string) => {
    const ICONS: Record<string, LucideIcon> = {
      article: FileText,
      blogPost: PenTool,
      email: Mail,
      productDescription: Zap,
      pressRelease: Globe,
      newsletter: Mail,
    };
    return ICONS[key] || Sparkles;
  };

  const handleKeywordResearch = async () => {
    if (!seoKeywordResearch.trim()) {
      toast.error("Please enter a main keyword");
      return;
    }

    if (!permissions.data?.isPremium) {
      toast.error("Premium feature required");
      return;
    }
    toast.warning("Pas encore implémenté");
    return;

    setKeywordLoading(true);
    const response = await modulesService.executeModule(module.slug, {
      input: {
        action: "seo-research",
        keyword: seoKeywordResearch.trim(),
        language: seoLanguage,
        volume: seoVolume,
      },
    });

    setKeywordLoading(false);
    // if (response.success && response.data?.output.data?.keywords) {
    //   const keywords = response.data.output.data.keywords as string[];
    //   setGeneratedKeywords(keywords);
    //   toast.success(`${keywords.length} keywords found!`);
    //   return;
    // }
    console.error("Keyword research error:", response);
    toast.error("Error during keyword research");
  };

  const handleGenerateImage = useCallback(async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please describe the image to generate");
      return;
    }

    if (!permissions.data?.isPremium) {
      toast.error("Premium feature required");
      return;
    }
    toast.warning("Pas encore implémenté");
    return;

    setGeneratingImage(true);
    const response = await modulesService.executeModule(module.slug, {
      input: {
        action: "generate-image",
        prompt: imagePrompt.trim(),
        style: imageStyle,
        count: imageCount,
      },
    });

    setGeneratingImage(false);
    if (response.success) {
      setImageOption("generate");
      toast.success("Images generated successfully!");
      return;
    }
    console.error("Image generation error:", response);
    toast.error("Error during image generation");
  }, [
    imagePrompt,
    imageStyle,
    imageCount,
    permissions.data?.isPremium,
    module.slug,
  ]);

  // // Initialize session on mount
  // useEffect(() => {
  //   if (authUser?.id && !sessionId && !sessionInitialized) {
  //     async function effect() {
  //       const response = await chatService.createOrGetSession({
  //         moduleSlug: module.slug,
  //       });
  //       if (response.success && response.data?.id) {
  //         setSessionId(response.data.id);
  //         sessionCreationTime.current = Date.now();
  //         return;
  //       }
  //       console.error("❌ Session initialization error:", response);
  //       setSessionInitialized(false);
  //     }
  //     effect();
  //   }
  // }, [authUser?.id, sessionId, sessionInitialized, module.slug]);

  const handleCopy = async () => {
    if (!result?.content) return;
    try {
      await navigator.clipboard.writeText(result.content);
      toast.success("Content copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
      toast.error("Failed to copy content");
    }
  };

  const handleDownload = () => {
    if (!result?.content) return;
    const element = document.createElement("a");
    const file = new Blob([result.content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `content-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleRagUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    if (!files.length) return;

    if (!permissions.data?.isPremium) {
      toast.error("Fonctionnalité Premium requise", {
        description:
          "L'ajout de documents de référence nécessite un abonnement Premium.",
      });
      return;
    }

    setUploadingRag(true);
    setRagUploadProgress(0);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validation
      const validateResult = validateDocumentFile(file);
      if (!validateResult.success) continue;

      const response = await documentService.generateUrlAndUploadFile(file);
      if (response.success) {
        // Ajouter à la liste
        const ragDoc = {
          id: (Date.now() + i).toString(),
          name: file.name,
          size: file.size,
          type: file.type,
          path: response.data.filePath,
          uploadedAt: new Date().toISOString(),
        };

        setRagDocuments((prev) => [...prev, ragDoc]);
        setRagUploadProgress(((i + 1) / files.length) * 100);

        toast.success(`Document ajouté: ${file.name}`);
        return;
      }
      toast.error(`Erreur pour ${file.name}: ${response.error}`);
    }

    setUploadingRag(false);
    setRagUploadProgress(0);
    if (ragFileInputRef.current) {
      ragFileInputRef.current.value = "";
    }
  };

  const removeRagDocument = (docId: string) => {
    setRagDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    toast.success("Document retiré");
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <CardTitle>{module?.name || "AI Writer"}</CardTitle>
              {permissions.data?.isPremium && (
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  PREMIUM
                </Badge>
              )}
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700"
              >
                <Brain className="h-3 w-3 mr-1" />
                IA
              </Badge>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-100 to-green-200 text-green-700"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Chat
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Solde: {formatBalance()}</Badge>
            <Badge variant="outline">Coût estimé: {currentCost} crédits</Badge>
          </div>
        </div>

        <CardDescription>{module?.description}</CardDescription>

        <div className="flex items-center space-x-2 text-sm">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full bg-green-500"`}></div>
            <span className={`${"text-green-600"}`}>{"Connecté"}</span>
          </div>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Session: {sessionId?.slice(-8)}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            Plan: {authUser?.plans?.name || "free"}
          </span>
          {module.endpoint && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-green-600">✅ Configuré</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-2"
              >
                Fermer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue="content"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList
            className={`grid w-full ${permissions.data?.isFree ? "grid-cols-6" : "grid-cols-5"}`}
          >
            <TabsTrigger value="chat">
              <Brain className="h-4 w-4 mr-2" />
              Assistant IA
            </TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
            {permissions.data?.isFree && (
              <TabsTrigger value="premium">Premium</TabsTrigger>
            )}
          </TabsList>

          {/* ONGLET CHAT */}
          <TabsContent value="chat" className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  Assistant Conversationnel Intelligent
                </span>
              </div>
              <p className="text-blue-800">
                Je suis une IA qui pose des{" "}
                <strong>questions intelligentes</strong> pour créer le contenu
                parfait pour vous. Dites-moi simplement votre besoin et je vous
                guide ! 💡
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div
                  className={`flex items-center space-x-1 ${desciption.trim() ? "text-green-700" : "text-gray-500"}`}
                >
                  {desciption.trim() ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  <span>Description</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${keywords.trim() ? "text-green-700" : "text-gray-500"}`}
                >
                  {keywords.trim() ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  <span>Mots-clés</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${targetAudience.trim() ? "text-green-700" : "text-gray-500"}`}
                >
                  {targetAudience.trim() ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  <span>Audience</span>
                </div>
                <div
                  className={`flex items-center space-x-1 ${contentType ? "text-green-700" : "text-gray-500"}`}
                >
                  {contentType ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  <span>Type</span>
                </div>
              </div>
              <div className="text-xs text-blue-600 bg-blue-100 px-3 py-1.5 rounded">
                💡 Les crédits ne seront utilisés qu'après validation finale de
                votre configuration
              </div>
            </div>

            <Chat
              ref={chatRef}
              welcomeMessage={welcomeMessage}
              conversationHistory={conversationHistory}
              setConversationHistory={setConversationHistory}
              onSubmit={async ({ message }) => {
                const content: Record<string, string> = {};
                if (subject.length > 0) {
                  content.subject = subject;
                }
                const response = await chatWithModule({
                  message,
                  content,
                });
                if (response.success) {
                  const outputMessage = response.data.data.outputMessage || "";
                  if (
                    response.data.data.module_type == "ai-writer" &&
                    outputMessage.length > 0
                  ) {
                    if (response.data.data.output) {
                      setSubject(
                        response.data.data.output.result_partial?.subject?.toString() ||
                          subject
                      );
                      setKeywords(
                        response.data.data.output.result_partial?.keywords?.toString() ||
                          keywords
                      );
                      setTargetAudience(
                        response.data.data.output.result_partial?.audience?.toString() ||
                          targetAudience
                      );
                      setSeoLanguage(
                        response.data.data.output.result_partial?.language?.toString() ||
                          seoLanguage
                      );
                      // TODO: tell to the model what are length existed, to avoid length not existing
                      setLength(
                        response.data.data.output.result_partial?.length?.toString() ||
                          length
                      );
                      setTone(
                        response.data.data.output.result_partial?.tone?.toString() ||
                          tone
                      );
                      setChatState(response.data.data.output.state);
                    }

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

            {chatState === "ready_for_confirmation" && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-green-800 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    🎉 Configuration complète ! Contenu prêt à générer
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{" "}
                      {currentContentType?.label}
                    </div>
                    <div>
                      <span className="font-medium">Ton:</span>{" "}
                      {currentTone?.label}
                    </div>
                    <div>
                      <span className="font-medium">Longueur:</span>{" "}
                      {currentLength?.label}
                    </div>
                    <div>
                      <span className="font-medium">Coût:</span> {currentCost}{" "}
                      crédits
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ONGLET CONTENT - SIMPLIFIÉ (Garde juste l'essentiel) */}
          <TabsContent value="content" className="space-y-6">
            <div className="space-y-3">
              <Label>Type de contenu</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(contentTypesFromAPI).map(([key, config]) => {
                  const IconComponent = getIconForContentType(key);
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        contentType === key
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => setContentType(key)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-primary" />
                          <span className="font-medium text-sm">
                            {config.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {config.description}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {config.cost} crédits
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  currentContentType?.placeholder || "Le sujet du contenu"
                }
                disabled={!contentType || loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prompt">Description du contenu *</Label>
              <Textarea
                id="prompt"
                value={desciption}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  currentContentType?.placeholder ||
                  "Sélectionnez un type de contenu"
                }
                className="min-h-[120px]"
                disabled={!contentType || loading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ton du texte</Label>
                <Select value={tone} onValueChange={setTone} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tonesFromAPI.map((toneOption) => (
                      <SelectItem
                        key={toneOption.value}
                        value={toneOption.value}
                      >
                        {toneOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Longueur du contenu</Label>
                <Select
                  value={length}
                  onValueChange={setLength}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengthsFromAPI.map((lengthOption) => (
                      <SelectItem
                        key={lengthOption.value}
                        value={lengthOption.value}
                      >
                        <div>{lengthOption.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {lengthOption.description}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Audience cible</Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Professionnels du marketing..."
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Mots-clés</Label>
                  <Input
                    id="keywords"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="SEO, marketing digital..."
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={seoOptimize}
                    onCheckedChange={(checked) =>
                      setSeoOptimize(checked == true)
                    }
                    disabled={loading}
                  />
                  <span className="text-sm">Optimisation SEO (+10%)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={includeCallToAction}
                    onCheckedChange={(checked) =>
                      setIncludeCallToAction(checked == true)
                    }
                    disabled={loading}
                  />
                  <span className="text-sm">Inclure un appel à l'action</span>
                </label>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Type:</strong> {currentContentType?.label || "N/A"}
                  </div>
                  <div>
                    <strong>Ton:</strong> {currentTone?.label}
                  </div>
                  <div>
                    <strong>Longueur:</strong> {currentLength?.label}
                  </div>
                  <div>
                    <strong>Coût:</strong> {currentCost} crédits
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            {loading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{currentStep || "Génération..."}</span>
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                !desciption.trim() ||
                !contentType ||
                !hasEnoughCredits(currentCost)
              }
              className="w-full"
              size="lg"
            >
              {loading ? (
                <LoadingSpinner />
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Générer le contenu ({currentCost} crédits)</span>
                </div>
              )}
            </Button>

            {result && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <Label>Contenu généré avec succès</Label>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">
                      {result.content}
                    </pre>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setResult(null)}
                  size="sm"
                >
                  Fermer
                </Button>
              </div>
            )}

            {result && result.fromChat && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-800">
                      Contenu sauvegardé avec succès !
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/content")}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Voir dans Mon Contenu
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            {permissions.data?.isPremium ? (
              <>
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Fonctionnalités médias avancées</Label>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Premium Activé
                    </Badge>
                  </div>

                  {/* ✅ GÉNÉRATION D'IMAGE IA */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5 text-amber-500" />
                      <Label className="font-medium">
                        Génération d'images par IA
                      </Label>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="imagePrompt">
                          Description de l'image
                        </Label>
                        <Textarea
                          id="imagePrompt"
                          value={imagePrompt}
                          onChange={(e) => setImagePrompt(e.target.value)}
                          placeholder="Ex: Une illustration moderne d'un ordinateur portable avec des graphiques abstraits..."
                          className="min-h-[80px]"
                          disabled={generatingImage}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Style d'image</Label>
                          <Select
                            value={imageStyle}
                            onValueChange={setImageStyle}
                            disabled={generatingImage}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="realistic">
                                Réaliste
                              </SelectItem>
                              <SelectItem value="artistic">
                                Artistique
                              </SelectItem>
                              <SelectItem value="minimalist">
                                Minimaliste
                              </SelectItem>
                              <SelectItem value="abstract">Abstrait</SelectItem>
                              <SelectItem value="cartoon">Cartoon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Nombre d'images</Label>
                          <Select
                            value={imageCount.toString()}
                            onValueChange={(val) =>
                              setImageCount(parseInt(val))
                            }
                            disabled={generatingImage}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 image</SelectItem>
                              <SelectItem value="2">2 images</SelectItem>
                              <SelectItem value="3">3 images</SelectItem>
                              <SelectItem value="4">4 images</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={handleGenerateImage}
                        disabled={!imagePrompt.trim() || generatingImage}
                        className="w-full bg-gradient-to-r from-amber-500 to-amber-600"
                      >
                        {generatingImage ? (
                          <div className="flex items-center space-x-2">
                            <LoadingSpinner />
                            <span>Génération en cours...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Camera className="h-4 w-4" />
                            <span>Générer l'image (10 crédits)</span>
                          </div>
                        )}
                      </Button>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        💡 L'image sera générée par notre IA et ajoutée
                        automatiquement à votre contenu.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                {/* ✅ DOCUMENTS RAG */}
                <div className="space-y-4 p-4 border rounded-lg bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-amber-600" />
                      <Label className="font-medium">
                        Documents de référence (Premium)
                      </Label>
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 text-xs"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        RAG
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => ragFileInputRef.current?.click()}
                      disabled={loading || uploadingRag}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter documents
                    </Button>
                  </div>

                  <input
                    type="file"
                    ref={ragFileInputRef}
                    onChange={handleRagUpload}
                    accept=".pdf,.txt,.doc,.docx"
                    multiple
                    className="hidden"
                  />

                  <p className="text-xs text-amber-700">
                    Ajoutez des documents (PDF, TXT, DOC, DOCX) pour enrichir la
                    génération avec vos propres contenus.
                  </p>

                  {uploadingRag && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Upload en cours...</span>
                        <span>{Math.round(ragUploadProgress)}%</span>
                      </div>
                      <Progress value={ragUploadProgress} className="h-2" />
                    </div>
                  )}

                  {ragDocuments.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Documents ajoutés ({ragDocuments.length})
                      </Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {ragDocuments.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-2 bg-white rounded border"
                          >
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-amber-600" />
                              <div>
                                <p className="text-sm font-medium truncate max-w-[200px]">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024).toFixed(0)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRagDocument(doc.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
                <div className="relative">
                  <Camera className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                  <Crown className="h-6 w-6 absolute -top-1 -right-1 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  Médias Premium AI
                </h3>
                <p className="text-orange-700 mb-6 max-w-md mx-auto">
                  Débloquez les fonctionnalités médias avancées pour des
                  contenus plus impactants.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Découvrir Premium
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ONGLET SEO FONCTIONNEL */}
          <TabsContent value="seo" className="space-y-4">
            {permissions.data?.isPremium ? (
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center space-x-2">
                      <Search className="h-4 w-4 text-green-600" />
                      <span>Recherche de mots-clés IA</span>
                    </Label>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Premium Activé
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="seoKeywordResearch">
                        Mot-clé principal
                      </Label>
                      <Input
                        id="seoKeywordResearch"
                        value={seoKeywordResearch}
                        onChange={(e) => setSeoKeywordResearch(e.target.value)}
                        placeholder="Ex: marketing digital"
                        disabled={keywordLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Langue</Label>
                        <Select
                          value={seoLanguage}
                          onValueChange={setSeoLanguage}
                          disabled={keywordLoading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fr">🇫🇷 Français</SelectItem>
                            <SelectItem value="en">🇺🇸 English</SelectItem>
                            <SelectItem value="es">🇪🇸 Español</SelectItem>
                            <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Volume de recherche</Label>
                        <Select
                          value={seoVolume}
                          onValueChange={setSeoVolume}
                          disabled={keywordLoading}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Faible (0-1K)</SelectItem>
                            <SelectItem value="medium">
                              Moyen (1K-10K)
                            </SelectItem>
                            <SelectItem value="high">Élevé (10K+)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={handleKeywordResearch}
                      disabled={!seoKeywordResearch.trim() || keywordLoading}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600"
                    >
                      {keywordLoading ? (
                        <div className="flex items-center space-x-2">
                          <LoadingSpinner />
                          <span>Recherche en cours...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4" />
                          <span>Rechercher des suggestions</span>
                        </div>
                      )}
                    </Button>
                  </div>

                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      💡 Les mots-clés seront analysés par notre IA et les
                      meilleurs seront suggérés automatiquement.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200">
                <div className="relative">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-green-500" />
                  <Sparkles className="h-6 w-6 absolute -top-1 -right-1 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  SEO Premium
                </h3>
                <p className="text-green-700 mb-6 max-w-md mx-auto">
                  Optimisez votre contenu pour les moteurs de recherche avec
                  l'IA avancée.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Activer SEO Premium
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ONGLET SCHEDULE FONCTIONNEL */}
          <TabsContent value="schedule" className="space-y-4">
            {permissions.data?.isPremium ? (
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="schedulePost"
                        checked={schedulePost}
                        onCheckedChange={(checked) =>
                          setSchedulePost(checked == true)
                        }
                      />
                      <Label htmlFor="schedulePost">
                        Planifier la publication
                      </Label>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Premium Activé
                    </Badge>
                  </div>

                  {schedulePost && (
                    <div className="space-y-4 pt-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="scheduledDate">
                            Date de publication
                          </Label>
                          <Input
                            id="scheduledDate"
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduledTime">
                            Heure de publication
                          </Label>
                          <Input
                            id="scheduledTime"
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Plateforme de publication</Label>
                        <Select
                          value={publishPlatform}
                          onValueChange={setPublishPlatform}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="blog">
                              Blog / Site Web
                            </SelectItem>
                            <SelectItem value="wordpress">WordPress</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="linkedin">
                              LinkedIn Articles
                            </SelectItem>
                            <SelectItem value="notion">Notion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {scheduledDate && scheduledTime && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                              Publication prévue le{" "}
                              {new Date(
                                `${scheduledDate}T${scheduledTime}`
                              ).toLocaleString()}{" "}
                              sur {publishPlatform}
                            </span>
                          </div>
                        </div>
                      )}

                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          💡 Le contenu sera généré puis automatiquement publié
                          à la date et l'heure choisies.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/calendar")}
                    className="flex items-center gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Voir le calendrier
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <div className="relative">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <Settings className="h-6 w-6 absolute -top-1 -right-1 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  Planification de Contenu
                </h3>
                <p className="text-blue-700 mb-6 max-w-md mx-auto">
                  Organisez et planifiez votre stratégie de contenu avec l'IA.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Découvrir la Planification
                </Button>
              </div>
            )}
          </TabsContent>

          {permissions.data?.isFree && (
            <TabsContent value="premium" className="space-y-4">
              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                <div className="relative">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                  <Crown className="h-6 w-6 absolute top-0 right-0 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">
                  Passez à AI Writer Premium
                </h3>
                <p className="text-purple-700 mb-6 max-w-md mx-auto">
                  Débloquez toutes les fonctionnalités avancées de génération de
                  contenu.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Découvrir Premium
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {!hasEnoughCredits(currentCost) && currentCost > 0 && (
          <div className="flex items-start space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                Crédits insuffisants
              </p>
              <p className="text-xs text-muted-foreground">
                Vous avez besoin de {currentCost} crédits, mais n'en avez que{" "}
                {currentBalance}.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleNavigateToBilling}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Recharger le compte
              </Button>
            </div>
          </div>
        )}

        {permissions.data?.isFree && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-purple-900 mb-1">
                  Débloquez tout le potentiel d'AI Writer
                </h4>
                <p className="text-xs text-purple-700 mb-3">
                  Passez à Premium pour accéder à toutes les fonctionnalités
                  avancées.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {premiumFeaturesFromAPI.slice(0, 6).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-xs text-purple-700"
                    >
                      <CheckCircle className="h-3 w-3 text-purple-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleNavigateToBilling}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Découvrir Premium
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
