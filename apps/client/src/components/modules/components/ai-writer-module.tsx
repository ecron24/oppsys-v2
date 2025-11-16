import { useState, useRef, useMemo, type ChangeEvent } from "react";
import {
  toast,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
  Badge,
  Progress,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Checkbox,
} from "@oppsys/ui";
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
  TrendingUp,
  BarChart3,
  Info,
  Plus,
  Camera,
  Palette,
  Hash,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import type { Module } from "../module-types";
import { modulesService } from "../service/modules-service";
import { documentService } from "../../documents/document-service";
import { LoadingSpinner } from "../../loading";
import type { RagDocument } from "../../documents/document-types";

type AiWriterModuleProps = {
  module: Module;
};

export default function AIWriterModule({ module }: AiWriterModuleProps) {
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();
  const navigate = useNavigate();

  const contentTypesFromAPI = useMemo(
    () =>
      module?.config && "contentTypes" in module.config
        ? module?.config?.contentTypes
        : {},
    [module?.config]
  );
  const tonesFromAPI = useMemo(
    () =>
      module?.config && "tones" in module.config ? module?.config?.tones : [],
    [module?.config]
  );
  const lengthsFromAPI = useMemo(
    () =>
      module?.config && "lengths" in module.config
        ? module?.config?.lengths
        : [],
    [module?.config]
  );
  const imageOptionsFromAPI = useMemo(
    () =>
      module?.config && "contentTypes" in module.config
        ? module?.config?.imageOptions
        : [],
    [module?.config]
  );
  const premiumFeaturesFromAPI = useMemo(
    () =>
      module?.config && "premiumFeatures" in module.config
        ? module.config.premiumFeatures || []
        : [],
    [module?.config]
  );

  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("article");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const imageOption = "none";
  const uploadedImage = null;

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
    if (!prompt.trim() || prompt.trim().length < 10) {
      toast.error("Description trop courte (10 caractères min).");
      return false;
    }
    if (!contentType) {
      toast.error("Veuillez sélectionner un type de contenu.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (isSubmitting.current || loading) return;
    if (
      loading ||
      !prompt.trim() ||
      !contentType ||
      !hasEnoughCredits(currentCost)
    )
      return;
    setError(null);
    if (!validateForm()) return;

    isSubmitting.current = true;
    setLoading(true);
    setCurrentStep("Lancement du processus...");
    setProgress(50);

    const moduleId = module?.slug || "ai-writer";

    const apiPayload = {
      input: {
        prompt: prompt.trim(),
        contentType,
        tone,
        length,
        options: {
          targetAudience: targetAudience.trim(),
          keywords: keywords.trim(),
          seoOptimize,
          includeCallToAction,
          ragDocuments: ragDocuments.map((doc) => ({
            name: doc.name,
            path: doc.path,
            type: doc.type,
          })),
        },
        imageConfig: {
          option: imageOption,
          hasUpload: !!uploadedImage,
        },
      },
    };

    const response = await modulesService.executeModule(moduleId, apiPayload);
    setLoading(false);
    setProgress(0);
    setCurrentStep("");
    isSubmitting.current = false;

    if (response.success) {
      setProgress(100);
      setCurrentStep("Processus terminé !");
      toast.success("Génération du contenu lancée !", {
        description:
          "Votre contenu sera bientôt prêt sur la page 'Mon Contenu'.",
      });
      return;
    }
    console.error("Erreur d'exécution du module:", error);
    setError(response.error);
    toast.error(`Échec: Une erreur est survenue.`);
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
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Format non supporté: ${file.name}`, {
          description: "Formats acceptés: PDF, TXT, DOC, DOCX",
        });
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        // 10MB max
        toast.error(`Fichier trop volumineux: ${file.name}`, {
          description: "Taille maximale: 10MB",
        });
        continue;
      }
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
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle>{module?.name || "AI Writer"}</CardTitle>
            {permissions.data?.isPremium && (
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700"
              >
                <Crown className="h-3 w-3 mr-1" />
                {permissions.data?.currentPlan.toUpperCase()}
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
            "Générez du contenu de qualité professionnelle avec l'intelligence artificielle"}
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
          <TabsList
            className={`grid w-full ${permissions.data?.isFree ? "grid-cols-5" : "grid-cols-4"}`}
          >
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
            {permissions.data?.isFree && (
              <TabsTrigger value="premium">Premium</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-3">
              <Label>Type de contenu</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(contentTypesFromAPI).map(([key, config]) => {
                  const IconComponent = getIconForContentType(key);
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${contentType === key ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:border-primary/50"}`}
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
              <Label htmlFor="prompt">Description du contenu *</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
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
                  <Label htmlFor="targetAudience">
                    Audience cible (optionnel)
                  </Label>
                  <Input
                    id="targetAudience"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Professionnels du marketing..."
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Mots-clés (optionnel)</Label>
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
                !prompt.trim() ||
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-800">
                      <Camera className="h-4 w-4 mr-2" />
                      Générer Image IA
                    </Button>
                    <Button className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-800">
                      <Palette className="h-4 w-4 mr-2" />
                      Bibliothèque Stock
                    </Button>
                  </div>
                </div>

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

          <TabsContent value="seo" className="space-y-4">
            {permissions.data?.isPremium ? (
              <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Outils SEO avancés</Label>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Activé
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800">
                    <Hash className="h-4 w-4 mr-2" />
                    Recherche Mots-clés IA
                  </Button>
                  <Button className="bg-gradient-to-r from-green-50 to-green-100 border-green-200 text-green-800">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Score SEO Temps Réel
                  </Button>
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

          <TabsContent value="schedule" className="space-y-4">
            {permissions.data?.isPremium ? (
              <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Planification de contenu</Label>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Activé
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendrier Éditorial
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800">
                    <Clock className="h-4 w-4 mr-2" />
                    Publication Auto
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
              <Button variant="outline" size="sm" className="mt-2">
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
