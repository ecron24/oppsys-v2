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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@oppsys/ui/components/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@oppsys/ui/components/tabs";
import { Checkbox } from "@oppsys/ui/components/checkbox";
import type { MODULES_IDS } from "@oppsys/api";
import type { Module } from "../module-types";
import { useAuth } from "@/components/auth/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useNavigate } from "react-router";
import { useMemo, useRef, useState } from "react";
import { Input, Textarea, toast } from "@oppsys/ui";
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BarChart3,
  Brain,
  Briefcase,
  CheckCircle,
  Crown,
  FileText,
  Heart,
  Info,
  MessageSquare,
  Plus,
  Settings,
  Smartphone,
  Target,
  TrendingUp,
  Upload,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Chat, type ChatRef } from "../shared/chat";
import type { Message } from "../module-types";
import { routes } from "@/routes";
import { LinkButton } from "@/components/link-button";
import { modulesService } from "../service/modules-service";
import { generateUuid } from "@/lib/generate-uuid";
import type { FileStorage } from "@/components/storage/storage-type";
import { validateTalentAnalyzerFile } from "@/components/storage/file-storage-validator";
import { storageService } from "@/components/storage/storage-service";
import { camelToSnake } from "@oppsys/shared";

type Config = Extract<
  Module["config"],
  { configType: typeof MODULES_IDS.TALENT_ANALYZER }
>;

const welcomeMessage = `👋 Bonjour ! Je suis votre assistant RH IA. Quel est votre besoin RH aujourd'hui ?

Ex: Analyser des CV pour un poste, optimiser mon processus de recrutement, évaluer les compétences de mon équipe...

*Aucun crédit ne sera consommé tant que nous n'aurons pas finalisé votre configuration.*`;

export default function TalentAnalyzer({ module }: TalentAnalyzerProps) {
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();
  const navigate = useNavigate();
  const chatRef = useRef<ChatRef>(null);

  const config = useMemo(
    () => (module.config || {}) as Config,
    [module.config]
  );
  const analysisTypesFromAPI = config.analysisTypes;
  const industriesFromAPI = config.industries;
  const scoringLevelsFromAPI = config.scoringLevels;
  const hrOptionsFromAPI = config.hrOptions;
  const premiumFeaturesFromAPI = config.premiumFeatures;
  const availableCriteria = config.availableCriteria;

  const [hrObjective, setHrObjective] = useState("");
  const [analysisType, setAnalysisType] = useState("cv_screening");
  const [selectedIndustry, setSelectedIndustry] = useState("tech");
  const [jobPosition, setJobPosition] = useState("");
  const [scoringLevel, setScoringLevel] = useState("basic");
  // DONNÉES D'ENTRÉE
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [fileUploadProgress, setFileUploadProgress] = useState<number>(0);

  const [files, setFiles] = useState<FileStorage[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState([""]);
  const [companyValues, setCompanyValues] = useState("");
  const [teamContext, setTeamContext] = useState("");

  // CRITÈRES D'ÉVALUATION
  const [priorityCriteria, setPriorityCriteria] = useState<string[]>([]);
  const [experienceLevel, setExperienceLevel] = useState("mid");
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [workMode, setWorkMode] = useState("hybrid");

  // OPTIONS RH AVANCÉES
  const [enableDiversityAnalysis, setEnableDiversityAnalysis] = useState(false);
  const [enableBiasDetection, setEnableBiasDetection] = useState(false);
  const [enableSalaryBenchmark, setEnableSalaryBenchmark] = useState(false);
  const [selectedHROptions, setSelectedHROptions] = useState<string[]>([]);

  // OPTIONS PRÉDICTIVES (PREMIUM)
  const [enablePredictiveAnalysis, setEnablePredictiveAnalysis] =
    useState(false);
  const [generateOnboardingPlan, setGenerateOnboardingPlan] = useState(false);
  const [analyzeTeamFit, setAnalyzeTeamFit] = useState(false);

  // ÉTATS DE GÉNÉRATION
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAnalysisStep, setCurrentAnalysisStep] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [chatState, setChatState] = useState<
    "missing" | "ready_for_confirmation" | "confirmed"
  >("missing");
  const [missingFieldFromChat, setMissingFieldFromChat] = useState<
    string | null
  >(null);
  const [conversationHistory, setConversationHistory] = useState<Message[]>([
    { message: welcomeMessage, timestamp: new Date(), type: "bot", data: null },
  ]);
  const sessionId = useMemo(() => generateUuid(), []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CALCUL DU COÛT
  const currentCost = useMemo(() => {
    let baseCost = config.baseCost || 35;

    const analysisConfig = analysisTypesFromAPI[analysisType];
    if (analysisConfig) {
      baseCost *= analysisConfig.cost;
    }

    // Coût selon l'industrie
    const industryConfig = industriesFromAPI[selectedIndustry];
    if (industryConfig) {
      baseCost *= industryConfig.multiplier;
    }

    // Coût selon le niveau de scoring
    const scoringConfig = scoringLevelsFromAPI[scoringLevel];
    if (scoringConfig) {
      baseCost *= scoringConfig.cost;
    }

    // Coût par CV (après les 5 premiers)
    if (files.length > 5) {
      baseCost += (files.length - 5) * 5;
    }

    // Options RH spécialisées
    selectedHROptions.forEach((optionId) => {
      const option = hrOptionsFromAPI[optionId];
      if (option) {
        baseCost += option.cost;
      }
    });

    // Options prédictives premium
    if (enablePredictiveAnalysis && permissions.data?.isPremium) baseCost += 25;
    if (generateOnboardingPlan && permissions.data?.isPremium) baseCost += 15;
    if (analyzeTeamFit) baseCost += 12;

    return Math.max(Math.ceil(baseCost), 20);
  }, [
    analysisType,
    selectedIndustry,
    scoringLevel,
    selectedHROptions,
    enablePredictiveAnalysis,
    generateOnboardingPlan,
    analyzeTeamFit,
    permissions.data?.isPremium,
    analysisTypesFromAPI,
    industriesFromAPI,
    scoringLevelsFromAPI,
    hrOptionsFromAPI,
    config.baseCost,
    files,
  ]);
  const currentBalance = balance || 0;
  const validSkills = requiredSkills.filter((skill) => skill.trim());

  const handleFileUpload = async (
    files: File[],
    opts: { source?: "chat" | "config" }
  ) => {
    setUploadingFile(true);
    setFileUploadProgress(0);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validation
      const validateResult = validateTalentAnalyzerFile(file);
      if (!validateResult.success) continue;

      // Créer URL d'upload
      const response = await storageService.generateUrlAndUploadFile(
        "talent-analyzer",
        file
      );

      if (response.success) {
        const fileUploaded: FileStorage = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          path: response.data.filePath,
          uploadedAt: new Date().toISOString(),
        };

        setFiles((prev) => [...prev, fileUploaded]);

        toast.success(`Document ajouté: ${file.name}`);
        setFileUploadProgress(((i + 1) / files.length) * 100);
        continue;
      }

      const error = "error" in response ? response.error : "unknown error";
      toast.error(`Erreur pour ${file.name}: ${error}`);
    }
    setUploadingFile(false);
    setFileUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // To avoid files empty as we just set above
    setTimeout(() => {
      if (opts.source === "chat" && chatRef.current) {
        chatRef.current.sendInputMessage(
          `J'ai mis ${files.length} CV pour analyse.`
        );
      }
    }, 700);
  };

  const removeCV = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // GESTION DES COMPÉTENCES
  const addSkill = () => {
    if (requiredSkills.length < 20) {
      setRequiredSkills([...requiredSkills, ""]);
    }
  };

  const removeSkill = (index: number) => {
    if (requiredSkills.length > 1) {
      setRequiredSkills(requiredSkills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...requiredSkills];
    newSkills[index] = value;
    setRequiredSkills(newSkills);
  };

  const toggleCriteria = (criteriaId: string) => {
    setPriorityCriteria((prev) =>
      prev.includes(criteriaId)
        ? prev.filter((id) => id !== criteriaId)
        : [...prev, criteriaId]
    );
  };

  const toggleHROption = (optionId: string) => {
    setSelectedHROptions((prev) =>
      prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId]
    );
  };

  const chatWithModule = async (params: {
    message: string;
    content?: Record<string, string>;
  }) => {
    const apiContext = {
      config: {
        objective: hrObjective.trim(),
        analysis: {
          type: analysisType,
          industry: selectedIndustry,
          position: jobPosition.trim(),
          scoringLevel,
        },
        jobRequirements: {
          description: jobDescription.trim(),
          requiredSkills: validSkills,
          experienceLevel,
          salaryRange,
          workMode,
        },
        files,
        context: {
          companyValues: companyValues.trim(),
          teamContext: teamContext.trim(),
          priorityCriteria,
        },
        hrOptions: {
          selectedOptions: selectedHROptions,
          enableDiversityAnalysis,
          enableBiasDetection,
          enableSalaryBenchmark,
        },
        predictiveOptions: enablePredictiveAnalysis
          ? {
              enabled: true,
              generateOnboardingPlan,
              analyzeTeamFit,
            }
          : null,
        userPlan: authUser?.plans?.name || "free",
      },
    };
    const response = await modulesService.chatWithModule(module.slug, {
      sessionId,
      message: params.message,
      context: {
        ...apiContext,
        content: { chatState, ...(params.content || {}) },
      },
    });
    return response;
  };

  // VALIDATION
  const validateForm = () => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return false;
    }
    if (!hasEnoughCredits(currentCost)) {
      toast.error("Crédits insuffisants.");
      return false;
    }
    if (!hrObjective.trim()) {
      toast.error("Objectif RH requis.");
      return false;
    }
    if (!jobDescription.trim()) {
      toast.error("Description du poste requise.");
      return false;
    }
    if (!jobPosition.trim()) {
      toast.error("Poste/fonction requis.");
      return false;
    }
    if (files.length === 0) {
      toast.error("Téléchargez au moins un CV à analyser.");
      return false;
    }

    // Vérifications Premium
    if (
      analysisTypesFromAPI[analysisType]?.premium &&
      !permissions.data?.isPremium
    ) {
      toast.error("Ce type d'analyse est réservé aux abonnés Premium.");
      return false;
    }

    if (
      scoringLevelsFromAPI[scoringLevel]?.premium &&
      !permissions.data?.isPremium
    ) {
      toast.error("Ce niveau de scoring est réservé aux abonnés Premium.");
      return false;
    }

    if (enablePredictiveAnalysis && !permissions.data?.isPremium) {
      toast.error("L'analyse prédictive est réservée aux abonnés Premium.");
      return false;
    }

    if (
      selectedHROptions.some(
        (optionId) => hrOptionsFromAPI[optionId]?.premium
      ) &&
      !permissions.data?.isPremium
    ) {
      toast.error("Certaines options sont réservées aux abonnés Premium.");
      return false;
    }

    // Limite de CV
    const maxCVs = analysisTypesFromAPI[analysisType]?.maxCvs || 50;
    if (files.length > maxCVs && !permissions.data?.isPremium) {
      toast.error(
        `Limite de ${maxCVs} CV dépassée. Passez à Premium pour plus.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    if (!validateForm()) return;

    setLoading(true);
    setCurrentAnalysisStep("Initialisation de l'analyse RH...");
    setProgress(10);

    setCurrentAnalysisStep("Génération du rapport RH...");
    setProgress(50);

    const generationMessage =
      "Analyser maintenant les donnêes avec toutes les informations collectées";

    const response = await chatWithModule({
      message: generationMessage,
      content: { chatState: "confirmed" },
    });
    if (response.success) {
      setProgress(100);
      setCurrentAnalysisStep("Analyse RH terminée !");
      toast.success("Analyse RH réussie !", {
        description: `${files.length} CV(s) analysé(s) avec succès.`,
      });
      setLoading(false);
      setProgress(0);
      setCurrentAnalysisStep("");
      return;
    }
    setLoading(false);
    setProgress(0);
    setCurrentAnalysisStep("");
    console.error("Erreur analyse RH:", response);
    toast.error(`Échec: ${response.error}`);
  };

  const getAnalysisIcon = (iconName: string) => {
    const icons: Record<string, LucideIcon> = {
      "file-text": FileText,
      target: Target,
      "message-square": MessageSquare,
      "trending-up": TrendingUp,
      award: Award,
      users: Users,
      smartphone: Smartphone,
      briefcase: Briefcase,
      heart: Heart,
      settings: Settings,
    };
    return icons[iconName] || Users;
  };

  const UploadCv = ({ source }: { source?: "chat" | "config" }) => {
    return (
      <div className="space-y-4">
        <Label className="text-sm font-medium">CVs à analyser :</Label>
        <div className="border-2 border-dashed border-indigo-300 rounded-lg p-6 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-indigo-500" />
          <p className="text-sm text-muted-foreground mb-2">
            Glissez-déposez vos CV ou cliquez pour sélectionner
          </p>
          <input
            ref={fileInputRef}
            type="file"
            // multiple
            accept=".pdf,.txt"
            onChange={(event) => {
              if (event.target.files) {
                const files = Array.from(event.target.files);
                if (files.length !== 1) {
                  toast.warning("Veuillez mettre un seul fichier à la fois.");
                  return;
                }
                handleFileUpload(files, { source });
              }
            }}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Sélectionner CV
          </Button>
        </div>

        {uploadingFile && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Upload en cours...</span>
              <span>{Math.round(fileUploadProgress)}%</span>
            </div>
            <Progress value={fileUploadProgress} className="h-2" />
          </div>
        )}
        {files.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">CV téléchargés :</Label>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-indigo-50 border border-indigo-200 rounded dark:bg-indigo-950 dark:border-indigo-800"
              >
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {file.name}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-xs dark:border-gray-600 dark:text-gray-300"
                  >
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </Badge>
                </div>
                <Button
                  onClick={() => removeCV(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* ✅ ENCART DE PRÉSENTATION STANDARDISÉ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/modules")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Modules</span>
              </Button>

              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-indigo-500" />
                <CardTitle>Talent Analyzer</CardTitle>
                {permissions.data?.isPremium && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    {authUser?.plans?.name.toUpperCase()}
                  </Badge>
                )}
                {enablePredictiveAnalysis && (
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700"
                  >
                    <Brain className="h-3 w-3 mr-1" />
                    Prédictif
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Solde: {formatBalance()}</Badge>
              <Badge variant="outline">
                Coût de base: {module.creditCost || 35} crédits
              </Badge>
            </div>
          </div>

          <CardDescription>
            Analysez les talents avec notre IA RH conversationnelle : screening,
            matching, évaluation prédictive.
          </CardDescription>

          <div className="flex items-center space-x-2 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-600">API connectée</span>
            </div>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              Dernière mise à jour: maintenant
            </span>
          </div>
        </CardHeader>
      </Card>

      <Card>
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
              <TabsTrigger value="chat">Assistant RH</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="predictive">Prédictif</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              {permissions.data?.isFree && (
                <TabsTrigger value="premium">Premium</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="chat" className="space-y-4">
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
                      response.data.data.module_type == "talent-analyzer" &&
                      outputMessage.length > 0
                    ) {
                      setChatState(response.data.data.output.state);
                      setMissingFieldFromChat(
                        response.data.data.output.missing_field
                      );
                      setHrObjective(
                        response.data.data.output.result_partial?.objective ||
                          hrObjective
                      );
                      setJobDescription(
                        response.data.data.output.result_partial
                          ?.jobDescription || jobDescription
                      );
                      setJobPosition(
                        response.data.data.output.result_partial?.jobPosition ||
                          jobPosition
                      );
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
              {missingFieldFromChat?.includes("file") && (
                <UploadCv source="chat" />
              )}
              {chatState === "ready_for_confirmation" && (
                <Button
                  className="w-full"
                  size="lg"
                  disabled={loading || !hasEnoughCredits(currentCost)}
                  onClick={handleSubmit}
                >
                  {loading
                    ? "Génération en cours..."
                    : `Confirmer et analyser (Coût: ${currentCost} crédits)`}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="configuration" className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-medium">Type d'analyse :</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(analysisTypesFromAPI).map(([key, option]) => {
                    const isDisabled =
                      option.premium && !permissions.data?.isPremium;
                    const IconComponent = getAnalysisIcon(option.icon);
                    const isSelected =
                      camelToSnake(analysisType) === camelToSnake(key);

                    return (
                      <div
                        key={key}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isDisabled
                            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900"
                            : isSelected
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950 dark:ring-indigo-400/20"
                              : "border-border hover:border-indigo-500/50 dark:border-gray-700 dark:hover:border-indigo-400/50"
                        }`}
                        onClick={() => {
                          if (!isDisabled) {
                            setAnalysisType(key);
                          } else {
                            toast.error(
                              "Cette option nécessite un abonnement Premium"
                            );
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                            <div>
                              <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                {option.label}
                              </span>
                              {option.premium && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900 dark:to-amber-800 dark:text-amber-300"
                                >
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium
                                </Badge>
                              )}
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {option.description}
                              </p>
                              {option.duration && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  ⏱️ {option.duration}
                                </p>
                              )}
                              {(option.maxCvs || option.maxProfiles) && (
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  Max: {option.maxCvs || option.maxProfiles}{" "}
                                  {option.maxCvs ? "CV" : "profils"}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            x{option.cost}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Secteur d'industrie :
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(industriesFromAPI).map(([key, option]) => {
                    const isSelected =
                      camelToSnake(selectedIndustry) === camelToSnake(key);

                    return (
                      <div
                        key={key}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950 dark:ring-indigo-400/20"
                            : "border-border hover:border-indigo-500/50 dark:border-gray-700 dark:hover:border-indigo-400/50"
                        }`}
                        onClick={() => setSelectedIndustry(key)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {option.label}
                            </span>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                              {option.skillsFocus.join(", ")}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            x{option.multiplier}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Niveau de scoring :
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {Object.entries(scoringLevelsFromAPI).map(([key, option]) => {
                    const isDisabled =
                      option.premium && !permissions.data?.isPremium;
                    const isSelected =
                      camelToSnake(scoringLevel) === camelToSnake(key);

                    return (
                      <div
                        key={key}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          isDisabled
                            ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed dark:border-gray-700 dark:bg-gray-900"
                            : isSelected
                              ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950 dark:ring-indigo-400/20"
                              : "border-border hover:border-indigo-500/50 dark:border-gray-700 dark:hover:border-indigo-400/50"
                        }`}
                        onClick={() => {
                          if (!isDisabled) {
                            setScoringLevel(key);
                          } else {
                            toast.error(
                              "Cette option nécessite un abonnement Premium"
                            );
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                              {option.label}
                            </span>
                            {option.premium && (
                              <Badge
                                variant="secondary"
                                className="ml-2 bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 dark:from-amber-900 dark:to-amber-800 dark:text-amber-300 text-xs"
                              >
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                              {option.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {option.features.map((feature) => (
                                <Badge
                                  key={feature}
                                  variant="outline"
                                  className="text-xs dark:border-gray-600 dark:text-gray-300"
                                >
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            x{option.cost}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <UploadCv />

              <div className="space-y-4">
                <Label className="text-sm font-medium">Poste :</Label>
                <Input
                  value={jobPosition}
                  onChange={(e) => setJobPosition(e.target.value)}
                  placeholder="Ex: Ingénieur Logiciel Senior, Responsable Marketing, etc."
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Objectif :</Label>
                <Textarea
                  value={hrObjective}
                  onChange={(e) => setHrObjective(e.target.value)}
                  placeholder="Décrivez votre objectif RH pour cette analyse (ex: améliorer le processus de recrutement, identifier les meilleurs talents, etc.)"
                  className="min-h-[120px]"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">
                  Description du poste / Critères :
                </Label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Décrivez le poste, les compétences requises, les responsabilités, l'environnement de travail..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label>Niveau d'expérience recherché</Label>
                  <Select
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior (0-2 ans)</SelectItem>
                      <SelectItem value="mid">Confirmé (3-5 ans)</SelectItem>
                      <SelectItem value="senior">Senior (6-10 ans)</SelectItem>
                      <SelectItem value="expert">Expert (10+ ans)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Mode de travail</Label>
                  <Select value={workMode} onValueChange={setWorkMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">100% Remote</SelectItem>
                      <SelectItem value="hybrid">Hybride</SelectItem>
                      <SelectItem value="onsite">Présentiel</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Compétences requises</Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {validSkills.length}/20
                    </span>
                    <Button
                      onClick={addSkill}
                      disabled={requiredSkills.length >= 20}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {requiredSkills.map((skill, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1">
                        <Input
                          value={skill}
                          onChange={(e) => updateSkill(index, e.target.value)}
                          placeholder={`Compétence ${index + 1}`}
                        />
                      </div>
                      {requiredSkills.length > 1 && (
                        <Button
                          onClick={() => removeSkill(index)}
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label>Fourchette salariale (optionnel)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Minimum (K€)</Label>
                    <Input
                      type="number"
                      value={salaryRange.min}
                      onChange={(e) =>
                        setSalaryRange((prev) => ({
                          ...prev,
                          min: e.target.value,
                        }))
                      }
                      placeholder="40"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Maximum (K€)</Label>
                    <Input
                      type="number"
                      value={salaryRange.max}
                      onChange={(e) =>
                        setSalaryRange((prev) => ({
                          ...prev,
                          max: e.target.value,
                        }))
                      }
                      placeholder="60"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Critères prioritaires d'évaluation</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {availableCriteria.map((criteria) => (
                    <div
                      key={criteria.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all text-center ${
                        priorityCriteria.includes(criteria.id)
                          ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                          : "border-border hover:border-indigo-500/50"
                      }`}
                      onClick={() => toggleCriteria(criteria.id)}
                    >
                      <div className="text-sm font-medium">
                        {criteria.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <Label htmlFor="companyValues">
                  Valeurs d'entreprise (optionnel)
                </Label>
                <Textarea
                  id="companyValues"
                  value={companyValues}
                  onChange={(e) => setCompanyValues(e.target.value)}
                  placeholder="Décrivez les valeurs et la culture de votre entreprise..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-4">
                <Label htmlFor="teamContext">Contexte équipe (optionnel)</Label>
                <Textarea
                  id="teamContext"
                  value={teamContext}
                  onChange={(e) => setTeamContext(e.target.value)}
                  placeholder="Décrivez l'équipe, les collaborateurs, l'environnement de travail..."
                  className="min-h-[80px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="predictive" className="space-y-4">
              {permissions.data?.isPremium ? (
                <>
                  <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h3 className="font-medium text-amber-800 flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>🚀 Analytics RH Prédictives</span>
                    </h3>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="enablePredictiveAnalysis"
                          checked={enablePredictiveAnalysis}
                          onCheckedChange={(checked) =>
                            setEnablePredictiveAnalysis(checked == true)
                          }
                        />
                        <Label
                          htmlFor="enablePredictiveAnalysis"
                          className="text-sm"
                        >
                          Activer l'analyse prédictive (+25 crédits)
                        </Label>
                      </div>

                      {enablePredictiveAnalysis && (
                        <div className="space-y-3 pl-6 border-l-2 border-amber-300">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="generateOnboardingPlan"
                              checked={generateOnboardingPlan}
                              onCheckedChange={(cheched) =>
                                setGenerateOnboardingPlan(cheched === true)
                              }
                            />
                            <Label
                              htmlFor="generateOnboardingPlan"
                              className="text-sm"
                            >
                              Générer plan d'onboarding (+15 crédits)
                            </Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="analyzeTeamFit"
                              checked={analyzeTeamFit}
                              onCheckedChange={(cheched) =>
                                setAnalyzeTeamFit(cheched === true)
                              }
                            />
                            <Label htmlFor="analyzeTeamFit" className="text-sm">
                              Analyser fit avec l'équipe (+12 crédits)
                            </Label>
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                          Prédictions incluses :
                        </h4>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Probabilité de réussite</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Score de rétention</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Potentiel d'évolution</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Risques identifiés</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-2 border-indigo-200 opacity-70">
                  <div className="relative">
                    <Brain className="h-16 w-16 mx-auto mb-4 text-indigo-500" />
                    <Crown className="h-6 w-6 absolute top-0 right-0 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-2">
                    RH Prédictive Premium
                  </h3>
                  <p className="text-indigo-700 mb-6 max-w-md mx-auto">
                    Accédez aux prédictions de performance, analyse de rétention
                    et planification de succession.
                  </p>
                  <LinkButton
                    to={routes.billing.index()}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Passer à Premium
                  </LinkButton>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-medium">Options RH spécialisées</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Object.entries(hrOptionsFromAPI).map(
                    ([optionId, option]) => (
                      <div
                        key={optionId}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          selectedHROptions.includes(optionId)
                            ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20"
                            : "border-border hover:border-indigo-500/50"
                        } ${option.premium && !permissions.data?.isPremium ? "opacity-60 cursor-not-allowed" : ""}`}
                        onClick={() => {
                          if (!option.premium || permissions.data?.isPremium) {
                            toggleHROption(optionId);
                          } else {
                            toast.error(
                              "Cette option nécessite un abonnement Premium"
                            );
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <Checkbox
                            checked={selectedHROptions.includes(optionId)}
                          />
                          <span className="font-medium text-sm">
                            {option.label}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            +{option.cost}
                          </Badge>
                          {option.premium && (
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                            >
                              <Crown className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Options d'analyse avancées</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableDiversityAnalysis"
                      checked={enableDiversityAnalysis}
                      onCheckedChange={(cheched) =>
                        setEnableDiversityAnalysis(cheched === true)
                      }
                    />
                    <Label
                      htmlFor="enableDiversityAnalysis"
                      className="text-sm"
                    >
                      Analyse de diversité (+8 crédits)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="enableBiasDetection"
                      checked={enableBiasDetection}
                      onCheckedChange={(cheched) =>
                        setEnableBiasDetection(cheched === true)
                      }
                    />
                    <Label htmlFor="enableBiasDetection" className="text-sm">
                      Détection de biais (+10 crédits)
                    </Label>
                  </div>

                  {permissions.data?.isPremium ? (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="enableSalaryBenchmark"
                        checked={enableSalaryBenchmark}
                        onCheckedChange={(cheched) =>
                          setEnableSalaryBenchmark(cheched === true)
                        }
                      />
                      <Label
                        htmlFor="enableSalaryBenchmark"
                        className="text-sm"
                      >
                        Benchmark salarial (+12 crédits)
                      </Label>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 opacity-60">
                      <Checkbox disabled />
                      <Label className="text-sm text-muted-foreground">
                        Benchmark salarial (Premium)
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {permissions.data?.isPremium ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <h3 className="font-medium text-amber-800 mb-3">
                    📊 Analytics RH Premium
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-amber-700">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Dashboard temps réel</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Métriques prédictives</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Comparaisons sectorielles</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3" />
                      <span>Alertes automatiques</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-2 border-indigo-200 opacity-70">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 text-indigo-500" />
                  <h3 className="text-lg font-bold text-indigo-900 mb-2">
                    Analytics RH Premium
                  </h3>
                  <p className="text-indigo-700 text-sm mb-4">
                    Accédez aux analytics avancés et tableaux de bord RH.
                  </p>
                  <LinkButton
                    to={routes.billing.index()}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Passer à Premium
                  </LinkButton>
                </div>
              )}
            </TabsContent>

            {permissions.data?.isFree && (
              <TabsContent value="premium" className="space-y-4">
                <div className="text-center p-8 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border-2 border-indigo-200">
                  <div className="relative">
                    <Users className="h-16 w-16 mx-auto mb-4 text-indigo-500" />
                    <Crown className="h-6 w-6 absolute top-0 right-0 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-indigo-900 mb-2">
                    Talent Analyzer Premium
                  </h3>
                  <p className="text-indigo-700 mb-6 max-w-md mx-auto">
                    Accédez aux analytics prédictives, optimisation d'équipes et
                    détection de biais.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 text-left max-w-lg mx-auto">
                    {premiumFeaturesFromAPI
                      .slice(0, 6)
                      .map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 text-xs text-indigo-700"
                        >
                          <CheckCircle className="h-3 w-3 text-indigo-600" />
                          <span>{feature}</span>
                        </div>
                      ))}
                  </div>
                  <LinkButton
                    to={routes.billing.index()}
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Découvrir Premium
                  </LinkButton>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Type:</strong>{" "}
                  {analysisTypesFromAPI[analysisType]?.label}
                </div>
                <div>
                  <strong>CV:</strong> {files.length}
                </div>
                <div>
                  <strong>Secteur:</strong>{" "}
                  {industriesFromAPI[selectedIndustry]?.label}
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
                <span>{currentAnalysisStep}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          )}

          {!hasEnoughCredits(currentCost) && currentCost > 0 && (
            <div className="flex items-start space-x-2 p-4 bg-destructive/10 border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Crédits insuffisants
                </p>
                <p className="text-xs text-muted-foreground">
                  Il vous faut {currentCost} crédits. Vous en avez{" "}
                  {currentBalance}.
                </p>
                <LinkButton
                  to={routes.billing.index()}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Recharger
                </LinkButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

type TalentAnalyzerProps = { module: Module };
