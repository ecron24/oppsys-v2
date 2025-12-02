import { useState, useRef, useMemo, type ChangeEvent } from "react";
import { toast } from "@oppsys/ui/lib/sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@oppsys/ui/components/card";
import { Button } from "@oppsys/ui/components/button";
import { Label } from "@oppsys/ui/components/label";
import { Input } from "@oppsys/ui/components/input";
import { Textarea } from "@oppsys/ui/components/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@oppsys/ui/components/select";
import { Checkbox } from "@oppsys/ui/components/checkbox";
import { Badge } from "@oppsys/ui/components/badge";
import { Progress } from "@oppsys/ui/components/progress";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@oppsys/ui/components/tabs";
import { Alert, AlertDescription } from "@oppsys/ui/components/alert";
import { LoadingSpinner } from "../../loading";
import { useAuth } from "../../auth/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { modulesService } from "../service/modules-service";
import {
  Mic,
  FileAudio,
  Video,
  Download,
  Play,
  Pause,
  Copy,
  CheckCircle,
  AlertCircle,
  Clock,
  Info,
  Upload,
  X,
  Users,
  Zap,
} from "lucide-react";
import type { Module } from "../module-types";
import type { LucideIcon } from "lucide-react";
import { MODULES_IDS } from "@oppsys/api/client";

type Config = Extract<
  Module["config"],
  { configType: typeof MODULES_IDS.TRANSCRIPTION }
>;

type TranscriptionModuleProps = {
  module: Module;
};

type TranscriptionType = "audio" | "video" | "meeting" | "interview" | "live";

type TranscriptionOptions = {
  speakerDiarization: boolean;
  removeFillers: boolean;
  addPunctuation: boolean;
  addTimestamps: boolean;
  generateSummary: boolean;
  customInstructions: string;
  publishToContent: boolean;
};

type ValidationResult = {
  valid: boolean;
  error?: string;
};

type FileType = {
  maxSize: number;
  formats: string[];
  cost: number;
  maxDuration: number;
  label: string;
  description: string;
};

type QualityLevel = {
  multiplier: number;
  label: string;
  accuracy: string;
};

type Language = {
  code: string;
  label: string;
  flag: string;
};

type OutputFormat = {
  value: string;
  label: string;
  icon: string;
};

const ICONS: Record<string, LucideIcon> = {
  audio: FileAudio,
  video: Video,
  meeting: Users,
  interview: Mic,
  live: Zap,
};

export default function TranscriptionModule({
  module,
}: TranscriptionModuleProps) {
  // HOOKS
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();

  // CONFIGURATION VIA L'API
  const config = useMemo(
    () => (module.config || {}) as Config,
    [module.config]
  );
  const typesFromAPI = useMemo(() => config?.types || {}, [config]);
  const languagesFromAPI = useMemo(() => config?.languages || [], [config]);
  const outputFormatsFromAPI = useMemo(
    () => config?.outputFormats || [],
    [config]
  );
  const qualityLevelsFromAPI = useMemo(
    () => (config?.qualityLevels || {}) as Record<string, QualityLevel>,
    [config]
  );

  // ÉTATS
  const [transcriptionType, setTranscriptionType] =
    useState<TranscriptionType>("audio");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<string>("auto");
  const [quality, setQuality] = useState<string>("standard");
  const [outputFormat, setOutputFormat] = useState<string>("text");
  const [fileName, setFileName] = useState<string>("");
  const [options, setOptions] = useState<TranscriptionOptions>({
    speakerDiarization: false,
    removeFillers: true,
    addPunctuation: true,
    addTimestamps: false,
    generateSummary: false,
    customInstructions: "",
    publishToContent: true,
  });
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usageId, setUsageId] = useState<string | null>(null);

  // RÉFÉRENCES
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = useRef<boolean>(false);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  // CALCULS DÉRIVÉS
  const currentCost = useMemo<number>(() => {
    const baseType = typesFromAPI[transcriptionType] as FileType;
    if (!baseType) return 0;
    const baseCost = baseType.cost;
    const qualityMultiplier =
      (qualityLevelsFromAPI[quality] as QualityLevel)?.multiplier || 1;
    const featuresMultiplier =
      (options.speakerDiarization ? 1.3 : 1) *
      (options.generateSummary ? 1.2 : 1) *
      (options.addTimestamps ? 1.1 : 1);
    return Math.ceil(baseCost * qualityMultiplier * featuresMultiplier);
  }, [transcriptionType, quality, options, typesFromAPI, qualityLevelsFromAPI]);

  // VARIABLES DÉRIVÉES
  const currentBalance = balance || 0;
  const currentType = (typesFromAPI[transcriptionType] as FileType) || {};
  const currentQuality = (qualityLevelsFromAPI[quality] as QualityLevel) || {};

  // FONCTIONS DE GESTION
  const handleTranscriptionTypeChange = (newType: TranscriptionType) => {
    setTranscriptionType(newType);
    if (newType === "live") {
      setUploadedFile(null);
      setFileName("");
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
        setAudioPreview(null);
      }
    }
  };

  const validateFile = (file: File): ValidationResult => {
    if (!file) return { valid: false, error: "Aucun fichier sélectionné" };
    const { maxSize, formats } = currentType;
    if (!formats.includes(file.type)) {
      return { valid: false, error: "Format non supporté" };
    }
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille maximale: ${maxSizeMB} MB`,
      };
    }
    return { valid: true };
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error("Fichier invalide", { description: validation.error });
      return;
    }
    setUploadedFile(file);
    setFileName(file.name);
    if (file.type.startsWith("audio/")) {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
      const audioUrl = URL.createObjectURL(file);
      setAudioPreview(audioUrl);
    }
    toast.success("Fichier ajouté avec succès");
  };

  const removeFile = () => {
    if (audioPreview) URL.revokeObjectURL(audioPreview);
    setUploadedFile(null);
    setFileName("");
    setAudioPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingInterval.current) clearInterval(recordingInterval.current);
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      setLiveTranscript("");
      recordingInterval.current = setInterval(
        () => setRecordingTime((prev) => prev + 1),
        1000
      );
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const validateForm = (): boolean => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return false;
    }
    if (transcriptionType !== "live" && !uploadedFile) {
      toast.error("Fichier requis.");
      return false;
    }
    if (transcriptionType === "live" && !liveTranscript.trim()) {
      toast.error("Aucun enregistrement.");
      return false;
    }
    if (!hasEnoughCredits(currentCost)) {
      toast.error("Crédits insuffisants.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting.current || loading) return;
    setError(null);
    if (!validateForm()) return;

    isSubmitting.current = true;
    setLoading(true);
    setResult(null);
    setCurrentStep("Lancement du processus...");
    setProgress(50);

    const moduleId = module?.slug || "podcast-transcriber";
    const apiPayload = {
      input: {
        transcriptionType,
        language,
        quality,
        outputFormat,
        fileName:
          uploadedFile?.name ||
          (transcriptionType === "live"
            ? "transcription_en_direct.txt"
            : "fichier_inconnu"),
        fileSize: uploadedFile?.size,
        fileType: uploadedFile?.type,
        options: {
          speakerDiarization: options.speakerDiarization,
          removeFillers: options.removeFillers,
          addPunctuation: options.addPunctuation,
          addTimestamps: options.addTimestamps,
          generateSummary: options.generateSummary,
          customInstructions: options.customInstructions.trim(),
          publishToContent: options.publishToContent,
        },
        liveTranscript:
          transcriptionType === "live" ? liveTranscript : undefined,
      },
    };

    try {
      setCurrentStep("Communication avec le service de transcription...");
      const response = await modulesService.executeModule(moduleId, apiPayload);
      if (response.success) {
        setProgress(100);
        setCurrentStep("Processus terminé !");
        toast.success("Transcription lancée !", {
          description:
            "Votre transcription sera bientôt prête sur la page 'Mon Contenu'.",
        });
        setUsageId(response.data?.usageId || null);
      } else {
        throw new Error(response.error || "Une erreur est survenue.");
      }
    } catch (error) {
      console.error("Erreur d'exécution du module:", error);
      setError((error as Error).message);
      toast.error(`Échec: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentStep("");
      isSubmitting.current = false;
    }
  };

  const copyResult = async () => {
    if (result) {
      try {
        await navigator.clipboard.writeText(result);
        toast.success("Résultat copié");
      } catch {
        toast.error("Erreur lors de la copie");
      }
    }
  };

  const downloadResult = () => {
    if (result) {
      const blob = new Blob([result], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transcription-${new Date().getTime()}.${outputFormat === "text" ? "txt" : outputFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Résultat téléchargé");
    }
  };

  const getIconForType = (key: string): LucideIcon => {
    return ICONS[key] || FileAudio;
  };

  const updateOption = <K extends keyof TranscriptionOptions>(
    key: K,
    value: TranscriptionOptions[K]
  ) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  console.log("languagesFromAPI", languagesFromAPI);

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className="h-6 w-6 text-blue-500" />
            <CardTitle>{module?.name || "Transcription"}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">Solde: {formatBalance()}</Badge>
            {currentCost > 0 && (
              <Badge
                variant={
                  hasEnoughCredits(currentCost) ? "default" : "destructive"
                }
              >
                Coût: {currentCost} crédits
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>
          {module?.description ||
            "Transcrivez vos fichiers audio et vidéo avec une précision élevée."}
        </CardDescription>
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

        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
            <TabsTrigger value="live">En Direct</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-3">
              <Label>Type de transcription</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(typesFromAPI).map(([key, type]) => {
                  const IconComponent = getIconForType(key);
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        transcriptionType === key
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                          : "border-border hover:border-blue-500/50"
                      }`}
                      onClick={() =>
                        handleTranscriptionTypeChange(key as TranscriptionType)
                      }
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">
                            {(type as FileType).label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {(type as FileType).description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {(type as FileType).cost} crédits
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Max: {(type as FileType).maxDuration} min
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {transcriptionType !== "live" && (
              <div className="space-y-3">
                <Label>Fichier à transcrire *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="audio/*,video/*"
                    disabled={loading}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choisir un fichier</span>
                  </Label>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <p>
                      Taille max: {Math.round(currentType.maxSize / 1048576)}{" "}
                      MB. Durée max: {currentType.maxDuration} minutes.
                    </p>
                  </div>
                </div>
                {uploadedFile && (
                  <div className="bg-muted/50 rounded-lg p-4 border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileAudio className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedFile.size / 1048576).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {audioPreview && (
                      <div className="mt-3 pt-3 border-t">
                        <audio controls className="w-full">
                          <source src={audioPreview} />
                        </audio>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Langue du fichier</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(languagesFromAPI) &&
                      languagesFromAPI.map((lang: Language) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span>{lang.flag}</span> {lang.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Qualité de transcription</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(qualityLevelsFromAPI).map(
                      ([key, level]) => (
                        <SelectItem key={key} value={key}>
                          <div>{(level as QualityLevel).label}</div>
                          <div className="text-xs text-muted-foreground">
                            {(level as QualityLevel).accuracy}
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Format de sortie</Label>
                <Select value={outputFormat} onValueChange={setOutputFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormatsFromAPI.map((format: OutputFormat) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.icon} {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="speakerDiarization"
                  checked={options.speakerDiarization}
                  onCheckedChange={(checked) =>
                    updateOption("speakerDiarization", checked === true)
                  }
                />
                <Label htmlFor="speakerDiarization" className="text-sm">
                  Identifier les intervenants (+30%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="removeFillers"
                  checked={options.removeFillers}
                  onCheckedChange={(checked) =>
                    updateOption("removeFillers", checked === true)
                  }
                />
                <Label htmlFor="removeFillers" className="text-sm">
                  Retirer les mots de remplissage
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addPunctuation"
                  checked={options.addPunctuation}
                  onCheckedChange={(checked) =>
                    updateOption("addPunctuation", checked === true)
                  }
                />
                <Label htmlFor="addPunctuation" className="text-sm">
                  Ajouter la ponctuation
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addTimestamps"
                  checked={options.addTimestamps}
                  onCheckedChange={(checked) =>
                    updateOption("addTimestamps", checked === true)
                  }
                />
                <Label htmlFor="addTimestamps" className="text-sm">
                  Ajouter l'horodatage (+10%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateSummary"
                  checked={options.generateSummary}
                  onCheckedChange={(checked) =>
                    updateOption("generateSummary", checked === true)
                  }
                />
                <Label htmlFor="generateSummary" className="text-sm">
                  Générer un résumé (+20%)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="publishToContent"
                  checked={options.publishToContent}
                  onCheckedChange={(checked) =>
                    updateOption("publishToContent", checked === true)
                  }
                />
                <Label htmlFor="publishToContent" className="text-sm">
                  Publier dans "Mon Contenu"
                </Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customInstructions">
                Instructions personnalisées (optionnel)
              </Label>
              <Textarea
                id="customInstructions"
                value={options.customInstructions}
                onChange={(e) =>
                  updateOption("customInstructions", e.target.value)
                }
                placeholder="Ex: Toujours écrire Société en majuscules..."
                className="min-h-[80px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            {transcriptionType === "live" ? (
              <div className="space-y-4">
                <div className="text-center space-y-4">
                  <Button
                    onClick={toggleRecording}
                    size="lg"
                    variant={isRecording ? "destructive" : "default"}
                    className="h-16 w-16 rounded-full"
                  >
                    {isRecording ? (
                      <Pause className="h-8 w-8" />
                    ) : (
                      <Play className="h-8 w-8" />
                    )}
                  </Button>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRecording
                        ? "Enregistrement..."
                        : "Cliquez pour démarrer"}
                    </p>
                    {isRecording && (
                      <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4 text-red-500" />
                        <span className="text-lg font-mono text-red-500">
                          {formatTime(recordingTime)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {liveTranscript && (
                  <div className="space-y-2">
                    <Label>Transcription en direct</Label>
                    <div className="bg-muted/50 rounded-lg p-4 border min-h-[120px] max-h-60 overflow-y-auto">
                      <p className="text-sm whitespace-pre-wrap">
                        {liveTranscript}
                        {isRecording && (
                          <span className="animate-pulse">|</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mic className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez le type "En direct" pour commencer.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleTranscriptionTypeChange("live")}
                  className="mt-4"
                >
                  Activer le mode en direct
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Type :</strong> {currentType.label}
              </div>
              <div>
                <strong>Qualité :</strong> {currentQuality.label}
              </div>
              <div>
                <strong>Format :</strong>{" "}
                {
                  outputFormatsFromAPI.find(
                    (f: OutputFormat) => f.value === outputFormat
                  )?.label
                }
              </div>
              <div>
                <strong>Coût :</strong> {currentCost} crédits
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>{currentStep || "Transcription en cours..."}</span>
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
            (transcriptionType !== "live" && !uploadedFile) ||
            (transcriptionType === "live" && !liveTranscript.trim()) ||
            !hasEnoughCredits(currentCost)
          }
          className="w-full"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" text="" />
              <span>Transcription en cours...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Démarrer la transcription ({currentCost} crédits)</span>
            </div>
          )}
        </Button>

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Label>Transcription terminée</Label>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={copyResult}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" size="sm" onClick={downloadResult}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {result}
              </pre>
            </div>
            {usageId && (
              <p className="text-xs text-muted-foreground">
                ID d'usage: {usageId}
              </p>
            )}
            <Button variant="outline" onClick={() => setResult(null)} size="sm">
              Fermer
            </Button>
          </div>
        )}

        {!hasEnoughCredits(currentCost) && currentCost > 0 && (
          <div className="flex items-start space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Crédits insuffisants
              </p>
              <p className="text-xs text-muted-foreground">
                Vous avez besoin de {currentCost} crédits, mais n'en avez que{" "}
                {currentBalance}.
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Acheter des crédits
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
