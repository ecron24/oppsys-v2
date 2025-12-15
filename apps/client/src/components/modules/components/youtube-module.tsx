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
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useNavigate } from "react-router";
import {
  Youtube,
  Upload,
  FileVideo,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Info,
  Play,
  Smartphone,
  Copy,
  ExternalLink,
  Crown,
  Settings,
  Calendar,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import type { Module } from "../module-types";
import type { LucideIcon } from "lucide-react";
import { modulesService } from "../service/modules-service";
import { MODULES_IDS } from "@oppsys/api/client";

type Config = Extract<
  Module["config"],
  { configType: typeof MODULES_IDS.YOUTUBE_UPLOADER }
>;

type YouTubeModuleProps = {
  module: Module;
};

type VideoType = {
  label: string;
  description: string;
  cost: number;
  maxSize: number;
  formats: string[];
  iconKey: string;
};

type PrivacyOption = {
  value: string;
  label: string;
  description: string;
};

type Category = {
  value: string;
  label: string;
};

type UploadedFile = File | null;

type ValidationResult = {
  valid: boolean;
  error?: string;
};

const ICONS: Record<string, LucideIcon> = {
  play: Play,
  smartphone: Smartphone,
  youtube: Youtube,
};

export default function YouTubeModule({ module }: YouTubeModuleProps) {
  // HOOKS
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();
  const navigate = useNavigate();

  // CONFIGURATION VIA L'API
  const config = useMemo(
    () => (module.config || {}) as Config,
    [module.config]
  );
  const videoTypesFromAPI = useMemo(() => config?.videoTypes || {}, [config]);
  const privacyOptionsFromAPI = useMemo(
    () => config?.privacyOptions || [],
    [config]
  );
  const categoriesFromAPI = useMemo(() => config?.categories || [], [config]);
  const premiumFeaturesFromAPI = useMemo(
    () => config?.premiumFeatures || [],
    [config]
  );

  // ÉTATS LOCAUX
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [videoType, setVideoType] = useState<string>("video");
  const [privacy, setPrivacy] = useState<string>("public");
  const [category, setCategory] = useState<string>("22");
  const [uploadedVideo, setUploadedVideo] = useState<UploadedFile>(null);
  const [uploadedThumbnail, setUploadedThumbnail] =
    useState<UploadedFile>(null);
  const [generateThumbnail, setGenerateThumbnail] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    videoUrl?: string;
    message?: string;
  } | null>(null);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // RÉFÉRENCES
  const isSubmitting = useRef<boolean>(false);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // CALCULS DÉRIVÉS
  const currentCost = useMemo<number>(() => {
    const currentVideoType = videoTypesFromAPI[videoType] as VideoType;
    if (!currentVideoType) return 0;

    const baseCost = currentVideoType.cost;
    const thumbnailCost = generateThumbnail ? 15 : 0;
    const privacyMultiplier = privacy === "public" ? 1 : 0.9;
    const videoSizeMultiplier =
      uploadedVideo && uploadedVideo.size > 500 * 1024 * 1024 ? 1.2 : 1;

    return Math.ceil(
      (baseCost + thumbnailCost) * privacyMultiplier * videoSizeMultiplier
    );
  }, [videoType, generateThumbnail, privacy, uploadedVideo, videoTypesFromAPI]);

  // VARIABLES DÉRIVÉES
  const currentBalance = balance || 0;
  const currentVideoType = (videoTypesFromAPI[videoType] as VideoType) || {};
  const currentPrivacy = privacyOptionsFromAPI.find(
    (p: PrivacyOption) => p.value === privacy
  );
  const currentCategory = categoriesFromAPI.find(
    (c: Category) => c.value === category
  );

  // FONCTIONS DE GESTION
  const handleNavigateToBilling = () => navigate("/billing");

  const validateVideoFile = (file: File): ValidationResult => {
    if (!file) return { valid: false, error: "Aucun fichier sélectionné" };
    const { maxSize, formats } = currentVideoType as VideoType;
    if (!formats.includes(file.type)) {
      return {
        valid: false,
        error: `Format non supporté. Autorisés : ${formats.map((f) => f.split("/")[1].toUpperCase()).join(", ")}`,
      };
    }
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return {
        valid: false,
        error: `Fichier trop volumineux. Taille max : ${maxSizeMB}MB`,
      };
    }
    return { valid: true };
  };

  const validateThumbnailFile = (file: File): ValidationResult => {
    if (!file) return { valid: false, error: "Aucun fichier sélectionné" };
    const allowedTypes = ["image/jpeg", "image/png"];
    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Format invalide. Autorisés : JPG, PNG" };
    }
    if (file.size > maxSize) {
      return {
        valid: false,
        error: "Miniature trop volumineuse. Taille max : 2MB",
      };
    }
    return { valid: true };
  };

  const handleVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateVideoFile(file);
    if (!validation.valid) {
      toast.error("Fichier vidéo invalide", { description: validation.error });
      return;
    }
    setUploadedVideo(file);
    toast.success("Vidéo ajoutée avec succès");
  };

  const handleThumbnailUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateThumbnailFile(file);
    if (!validation.valid) {
      toast.error("Fichier miniature invalide", {
        description: validation.error,
      });
      return;
    }
    setUploadedThumbnail(file);
    toast.success("Miniature ajoutée avec succès");
  };

  const removeVideo = () => {
    setUploadedVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const removeThumbnail = () => {
    setUploadedThumbnail(null);
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
  };

  const validateForm = (): boolean => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return false;
    }
    if (!hasEnoughCredits(currentCost)) {
      toast.error("Crédits insuffisants.");
      return false;
    }
    if (!title.trim() || title.trim().length < 3) {
      toast.error("Titre requis (3 caractères min).");
      return false;
    }
    if (title.length > 100) {
      toast.error("Titre trop long (100 caractères max).");
      return false;
    }
    if (description.length > 5000) {
      toast.error("Description trop longue (5000 caractères max).");
      return false;
    }
    if (!uploadedVideo) {
      toast.error("Vidéo requise.");
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
    setUsageId(null);

    setCurrentStep("Lancement du processus...");
    setProgress(50);

    const moduleId = module?.slug || "youtube-uploader";
    const apiPayload = {
      context: {
        title: title.trim(),
        description: description.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        videoType,
        privacy,
        category,
        videoInfo: {
          fileName: uploadedVideo!.name,
          fileSize: uploadedVideo!.size,
          fileType: uploadedVideo!.type,
        },
        thumbnailConfig: {
          generate: generateThumbnail,
          hasCustom: !!uploadedThumbnail,
          customFileName: uploadedThumbnail?.name,
        },
      },
    };

    try {
      setCurrentStep("Communication avec le service YouTube...");
      const response = await modulesService.executeModule(moduleId, apiPayload);

      if (response.success) {
        setUsageId(response.data?.usageId || "succes");
        setProgress(100);
        setCurrentStep("Processus terminé !");
        toast.success("Upload YouTube lancé !", {
          description:
            "Votre vidéo sera bientôt traitée et disponible sur 'Mon Contenu'.",
        });
      } else {
        throw new Error(
          response.error || "Une erreur est survenue lors de l'upload."
        );
      }
    } catch (error) {
      console.error("Erreur d'exécution du module YouTube:", error);
      setError((error as Error).message);
      toast.error(`Échec: ${(error as Error).message}`);
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentStep("");
      isSubmitting.current = false;
    }
  };

  const copyVideoUrl = async () => {
    if (result?.videoUrl) {
      try {
        await navigator.clipboard.writeText(result.videoUrl);
        toast.success("URL copiée");
      } catch {
        toast.error("Erreur de copie");
      }
    }
  };

  const openYouTubeVideo = () => {
    if (result?.videoUrl) {
      window.open(result.videoUrl, "_blank");
      toast.success("Ouverture de la vidéo...");
    }
  };

  const getIconForVideoType = (key: string): LucideIcon => {
    return ICONS[key] || FileVideo;
  };

  return (
    <Card className="w-full  mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Youtube className="h-6 w-6 text-red-500" />
            <CardTitle>{module?.name || "YouTube Upload"}</CardTitle>
            {permissions.data?.isPremium && (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700"
              >
                <Crown className="h-3 w-3 mr-1" />
                {permissions.data?.currentPlan?.toUpperCase() || ""}
              </Badge>
            )}
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
            "Téléchargez et publiez vos vidéos sur YouTube de manière optimisée."}
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

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="optimization">Optimisation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="space-y-3">
              <Label>Type de Vidéo</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {Object.entries(videoTypesFromAPI).map(([key, type]) => {
                  const IconComponent = getIconForVideoType(
                    (type as VideoType).iconKey
                  );
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        videoType === key
                          ? "border-red-500 bg-red-50 dark:bg-red-950 ring-2 ring-red-500/20"
                          : "border-border hover:border-red-500/50 dark:hover:border-red-600/50"
                      }`}
                      onClick={() => setVideoType(key)}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <IconComponent className="h-5 w-5 text-red-500 dark:text-red-400" />
                        <span className="font-medium text-sm dark:text-slate-100">
                          {(type as VideoType).label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground dark:text-slate-400 mb-2">
                        {(type as VideoType).description}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs dark:border-slate-600 dark:text-slate-300"
                      >
                        {(type as VideoType).cost} crédits
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de votre vidéo"
                  disabled={loading}
                  maxLength={100}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{title.length}/100</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description de votre vidéo..."
                  className="min-h-[120px]"
                  disabled={loading}
                  maxLength={5000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{description.length}/5000</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tags, séparés, par, virgules"
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Fichier Vidéo *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <FileVideo className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <Input
                    type="file"
                    ref={videoInputRef}
                    onChange={handleVideoUpload}
                    accept={(currentVideoType as VideoType).formats?.join(",")}
                    disabled={loading}
                    className="hidden"
                    id="video-upload"
                  />
                  <Label
                    htmlFor="video-upload"
                    className="cursor-pointer inline-flex items-center space-x-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Choisir une Vidéo</span>
                  </Label>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  <p>
                    Taille max:{" "}
                    {(currentVideoType as VideoType).maxSize
                      ? Math.round(
                          (currentVideoType as VideoType).maxSize / 1048576
                        )
                      : 0}{" "}
                    MB
                  </p>
                </div>
              </div>
            </div>
            {uploadedVideo && (
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileVideo className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium text-sm">
                        {uploadedVideo.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedVideo.size / 1048576).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeVideo}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <Label>Miniature</Label>
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="generate-thumbnail"
                  checked={generateThumbnail}
                  onCheckedChange={(checked) =>
                    setGenerateThumbnail(checked === true)
                  }
                  disabled={loading}
                />
                <Label
                  htmlFor="generate-thumbnail"
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Générer une miniature IA (+15 crédits)</span>
                </Label>
              </div>
              {!generateThumbnail && (
                <div className="space-y-3">
                  <Input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailUpload}
                    accept="image/jpeg,image/png"
                    disabled={loading}
                  />
                  {uploadedThumbnail && (
                    <div className="flex items-center space-x-3 bg-muted/50 rounded-lg p-3">
                      <img
                        src={URL.createObjectURL(uploadedThumbnail)}
                        alt="Aperçu"
                        className="h-16 w-28 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {uploadedThumbnail.name}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removeThumbnail}
                        disabled={loading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Confidentialité</Label>
                <Select
                  value={privacy}
                  onValueChange={setPrivacy}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {privacyOptionsFromAPI.map((option: PrivacyOption) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>{option.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {option.description}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={category}
                  onValueChange={setCategory}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriesFromAPI.map((cat: Category) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="optimization">
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">💡 Conseils d'optimisation :</p>
                <ul className="text-xs space-y-1 ml-4">
                  <li>Titre accrocheur et mots-clés pertinents.</li>
                  <li>Description détaillée avec timestamps et liens.</li>
                  <li>Tags stratégiques pour la découvrabilité.</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="text-center p-8 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-200">
              <BarChart3 className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <h3 className="text-xl font-bold text-red-900 mb-2">
                Analytics YouTube Premium
              </h3>
              <p className="text-red-700 mb-6 max-w-md mx-auto">
                Analysez les performances avec des insights détaillés.
              </p>
              <Button
                onClick={handleNavigateToBilling}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Découvrir Analytics Premium
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="schedule">
            <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-purple-500" />
              <h3 className="text-xl font-bold text-purple-900 mb-2">
                Planification YouTube Premium
              </h3>
              <p className="text-purple-700 mb-6 max-w-md mx-auto">
                Programmez vos uploads aux moments optimaux.
              </p>
              <Button
                onClick={handleNavigateToBilling}
                variant="outline"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Settings className="h-4 w-4 mr-2" />
                Activer Planification Pro
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Type:</strong> {(currentVideoType as VideoType)?.label}
              </div>
              <div>
                <strong>Confidentialité:</strong> {currentPrivacy?.label}
              </div>
              <div>
                <strong>Catégorie:</strong> {currentCategory?.label}
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
                <span>{currentStep || "Upload en cours..."}</span>
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
            !title.trim() ||
            !uploadedVideo ||
            !hasEnoughCredits(currentCost)
          }
          className="w-full"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <LoadingSpinner size="sm" />
              <span>Upload en cours...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4" />
              <span>Télécharger sur YouTube ({currentCost} crédits)</span>
            </div>
          )}
        </Button>

        {usageId && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Label>Tâche d'upload lancée avec succès !</Label>
            </div>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <p>
                  Votre vidéo est en cours de traitement. Elle apparaîtra sur
                  votre page "Mon Contenu" dans quelques instants, dès que le
                  traitement sera terminé.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  ID de suivi : {usageId}
                </p>
              </AlertDescription>
            </Alert>
            <div className="flex space-x-2">
              <Button variant="outline" asChild>
                <a href="/mon-contenu">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Aller à "Mon Contenu"
                </a>
              </Button>
              <Button variant="secondary" onClick={() => setUsageId(null)}>
                Fermer
              </Button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Label>Upload terminé</Label>
              </div>
              <div className="flex space-x-2">
                {result.videoUrl && (
                  <>
                    <Button variant="outline" size="sm" onClick={copyVideoUrl}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copier URL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openYouTubeVideo}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Voir Vidéo
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 border">
              <p className="text-sm">{result.message}</p>
              {result.videoUrl && (
                <div className="mt-3 p-2 bg-muted rounded">
                  <p className="text-xs text-muted-foreground mb-1">URL:</p>
                  <p className="text-sm font-mono break-all">
                    {result.videoUrl}
                  </p>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setResult(null)} size="sm">
              Fermer
            </Button>
          </div>
        )}

        {!hasEnoughCredits(currentCost) && currentCost > 0 && (
          <div className="flex items-start space-x-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">
                Crédits insuffisants
              </p>
              <p className="text-xs text-muted-foreground">
                Il vous faut {currentCost} crédits, vous en avez{" "}
                {currentBalance}.
              </p>
              <Button
                onClick={handleNavigateToBilling}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Recharger
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <div className="flex items-start space-x-3">
            <Crown className="h-5 w-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-orange-900 mb-1">
                Débloquez le potentiel YouTube avec Premium
              </h4>
              <p className="text-xs text-orange-700 mb-3">
                Passez à Premium pour accéder aux fonctionnalités avancées.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                {premiumFeaturesFromAPI.slice(0, 6).map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 text-xs text-orange-700"
                  >
                    <CheckCircle className="h-3 w-3 text-orange-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleNavigateToBilling}
                size="sm"
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Crown className="h-3 w-3 mr-1" />
                Découvrir Premium
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
