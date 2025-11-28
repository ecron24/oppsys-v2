import { useState, useRef, useMemo } from "react";
import {
  toast,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Label,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
  Badge,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
} from "@oppsys/ui";
import { LoadingSpinner } from "../../loading";
import { useAuth } from "../../auth/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useNavigate } from "react-router";
import {
  FileText,
  Building,
  Users,
  Scale,
  Briefcase,
  FileCheck,
  Eye,
  Palette,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Crown,
  Wand2,
  Brain,
  Shield,
  FileSignature,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import type { Module } from "../module-types";
import type { LucideIcon } from "lucide-react";
import type { ChangeEvent } from "react";
import type {
  RagDocument,
  RagUploadBody,
} from "@/components/documents/document-types";
import { modulesService } from "../service/modules-service";
import { documentService } from "@/components/documents/document-service";
import { MODULES_IDS } from "@oppsys/api/client";
import { validateDocumentFile } from "@/components/documents/document-validator";

type Config = Extract<
  Module["config"],
  { configType: typeof MODULES_IDS.DOCUMENT_GENERATOR }
>;

type DocumentGeneratorModuleProps = {
  module: Module;
};

const ICONS: Record<string, LucideIcon> = {
  contract: FileCheck,
  proposal: Briefcase,
  policy: Building,
  report: Users,
  legal: Scale,
  manual: FileText,
};

export default function DocumentGeneratorModule({
  module,
}: DocumentGeneratorModuleProps) {
  // HOOKS
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();
  const navigate = useNavigate();

  // CONFIGURATION
  const config = useMemo(
    () => (module.config || {}) as Config,
    [module.config]
  );
  const documentTypesFromAPI = useMemo(() => config?.types || {}, [config]);
  const outputFormatsFromAPI = useMemo(
    () => config?.outputFormats || [],
    [config]
  );
  const documentStylesFromAPI = useMemo(
    () => config?.documentStyles || {},
    [config]
  );
  const supportedLanguagesFromAPI = useMemo(
    () => config?.supportedLanguages || [],
    [config]
  );
  const premiumFeaturesFromAPI = useMemo(
    () =>
      (module.config &&
        "premiumFeatures" in module.config &&
        module?.config?.premiumFeatures) ||
      [],
    [module?.config]
  );

  // ÉTATS
  const [documentType, setDocumentType] = useState<string>("proposal");
  const [template, setTemplate] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("fr");
  const [outputFormat, setOutputFormat] = useState<string>("docx");
  const [documentStyle, setDocumentStyle] = useState<string>("corporate");
  const [companyName, setCompanyName] = useState<string>("");
  const [companyAddress, setCompanyAddress] = useState<string>("");
  const [projectReference, setProjectReference] = useState<string>("");
  const [includeHeader, setIncludeHeader] = useState<boolean>(true);
  const [includeFooter, setIncludeFooter] = useState<boolean>(true);
  const [includeSignature, setIncludeSignature] = useState<boolean>(false);
  const [includeDateStamp, setIncludeDateStamp] = useState<boolean>(true);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [includeTOC, setIncludeTOC] = useState<boolean>(false);
  const [customClauses, setCustomClauses] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [usageId, setUsageId] = useState<string | null>(null);
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [uploadingRag, setUploadingRag] = useState<boolean>(false);
  const [ragUploadProgress, setRagUploadProgress] = useState<number>(0);

  const isSubmitting = useRef<boolean>(false);
  const ragFileInputRef = useRef<HTMLInputElement>(null);

  // CALCULS DÉRIVÉS
  const currentCost = useMemo<number>(() => {
    const baseType = documentTypesFromAPI[documentType];
    return baseType?.cost || module?.creditCost || 0;
  }, [documentType, documentTypesFromAPI, module]);

  // VARIABLES DÉRIVÉES
  const currentBalance = balance || 0;
  const currentDocumentType = documentTypesFromAPI[documentType];
  const currentStyle = documentStylesFromAPI[documentStyle];
  const currentFormat = outputFormatsFromAPI.find(
    (f) => f.value === outputFormat
  );

  // FONCTIONS DE GESTION
  const handleNavigateToBilling = () => navigate("/billing");

  const handleDocumentTypeChange = (newType: string) => {
    setDocumentType(newType);
    setTemplate("");
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
    if (!title.trim() || title.trim().length < 5) {
      toast.error("Titre trop court");
      return false;
    }
    if (!description.trim() || description.trim().length < 20) {
      toast.error("Description trop courte");
      return false;
    }
    if (!content.trim() || content.trim().length < 50) {
      toast.error("Contenu requis.");
      return false;
    }
    if (
      "legalAdvice" in currentDocumentType &&
      currentDocumentType?.legalAdvice &&
      !companyName.trim()
    ) {
      toast.error("Informations entreprise requises");
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
    setCurrentStep("Lancement du processus...");
    setProgress(50);

    const moduleSlug = module?.slug || "document-generator";

    const apiPayload = {
      input: {
        documentType,
        template,
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        language,
        outputFormat,
        documentStyle,
        companyInfo: {
          name: companyName.trim(),
          address: companyAddress.trim(),
          email: "",
        },
        clientInfo: { name: "", address: "" },
        projectInfo: {
          reference: projectReference.trim(),
          additionalNotes: additionalNotes.trim(),
        },
        formatting: {
          includeHeader,
          includeFooter,
          includeSignature,
          includeDateStamp,
          includePageNumbers,
          includeTOC,
        },
        customClauses: customClauses.trim(),
        ragDocuments: ragDocuments.map((doc) => ({
          name: doc.name,
          path: doc.path,
          type: doc.type,
        })),
      },
      save_output: true,
      timeout: 120000,
    };

    try {
      setCurrentStep("Communication avec le générateur...");
      const response = await modulesService.executeModule(
        moduleSlug,
        apiPayload
      );

      if (response.success) {
        setProgress(100);
        setCurrentStep("Processus terminé !");
        toast.success("Génération du document lancée !", {
          description:
            "Votre document sera bientôt prêt sur la page 'Mon Contenu'.",
        });
        setUsageId(response.data?.usageId);
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

  const handleRagUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
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

      try {
        // Créer URL d'upload
        const response = await documentService.generateRagUploadUrl({
          fileName: file.name,
          fileType: file.type as RagUploadBody["fileType"],
          fileSize: file.size,
        });

        if ("error" in response) {
          throw new Error(response.error);
        }

        const { uploadUrl, filePath } = response.data;

        // Upload du fichier
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error("Erreur d'upload");
        }

        // Ajouter à la liste
        const ragDoc: RagDocument = {
          id: `${Date.now()}-${i}`,
          name: file.name,
          size: file.size,
          type: file.type,
          path: filePath,
          uploadedAt: new Date().toISOString(),
        };

        setRagDocuments((prev) => [...prev, ragDoc]);
        setRagUploadProgress(((i + 1) / files.length) * 100);

        toast.success(`Document ajouté: ${file.name}`);
      } catch (error) {
        toast.error(`Erreur pour ${file.name}: ${(error as Error).message}`);
      }
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
            <FileText className="h-6 w-6 text-blue-500" />
            <CardTitle>{module?.name || "Générateur de Documents"}</CardTitle>
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
            "Créez des documents professionnels de qualité."}
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
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
            {permissions.data?.isFree && (
              <TabsTrigger value="premium">Premium</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-3">
              <Label>Type de document</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(documentTypesFromAPI).map(([key, docType]) => {
                  const IconComponent = ICONS[key] || FileText;
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        documentType === key
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:border-blue-400 dark:bg-blue-900/20 dark:ring-blue-400/30"
                          : "border-border hover:border-blue-500/50"
                      }`}
                      onClick={() => handleDocumentTypeChange(key)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-blue-600" />
                          <span className="font-medium text-sm">
                            {docType.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {docType.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {docType.cost} crédits
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {docType.complexity}
                          </span>
                        </div>
                        {docType.legalAdvice && (
                          <div className="flex items-center space-x-1">
                            <Scale className="h-3 w-3 text-orange-500" />
                            <span className="text-xs text-orange-600">
                              Révision juridique conseillée
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {"templates" in currentDocumentType &&
              currentDocumentType?.templates &&
              currentDocumentType.templates.length > 0 && (
                <div className="space-y-2">
                  <Label>Template (Fonctionnalité de base)</Label>
                  <Select
                    value={template}
                    onValueChange={setTemplate}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un template" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentDocumentType.templates.map((tmpl) => (
                        <SelectItem key={tmpl} value={tmpl}>
                          {tmpl}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre du document *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Proposition de services marketing digital"
                  disabled={loading}
                  maxLength={150}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{title.length}/150 caractères</span>
                  <span>Minimum 5 caractères</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Langue</Label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedLanguagesFromAPI.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        <div className="flex items-center space-x-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description du contexte *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez le contexte, l'objectif du document..."
                className="min-h-[80px]"
                disabled={loading}
                maxLength={800}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Contenu principal détaillé *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Développez le contenu détaillé du document..."
                className="min-h-[150px]"
                disabled={loading}
                maxLength={5000}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Format de sortie</Label>
                <Select
                  value={outputFormat}
                  onValueChange={setOutputFormat}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormatsFromAPI.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center justify-between w-full">
                          <span>
                            {format.icon} {format.label}
                          </span>
                          {format.premium && (
                            <Badge variant="outline" className="text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Style de document</Label>
                <Select
                  value={documentStyle}
                  onValueChange={setDocumentStyle}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(documentStylesFromAPI).map(
                      ([key, style]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${style.color.replace("text-", "bg-")}`}
                            ></div>
                            <span>{style.label}</span>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {"legalAdvice" in currentDocumentType &&
              currentDocumentType?.legalAdvice && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Informations entreprise (Requis)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                      <Input
                        id="companyName"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Votre Entreprise SARL"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="companyAddress">Adresse entreprise</Label>
                      <Input
                        id="companyAddress"
                        value={companyAddress}
                        onChange={(e) => setCompanyAddress(e.target.value)}
                        placeholder="123 Rue de l'Entreprise, 75001 Paris"
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectReference">Référence projet</Label>
                      <Input
                        id="projectReference"
                        value={projectReference}
                        onChange={(e) => setProjectReference(e.target.value)}
                        placeholder="REF-2024-001"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              )}

            <div className="space-y-4">
              <h4 className="font-medium">Options de formatage</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHeader"
                    checked={includeHeader}
                    onCheckedChange={(checked) =>
                      setIncludeHeader(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="includeHeader" className="text-sm">
                    En-tête personnalisé
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeFooter"
                    checked={includeFooter}
                    onCheckedChange={(checked) =>
                      setIncludeFooter(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="includeFooter" className="text-sm">
                    Pied de page
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeSignature"
                    checked={includeSignature}
                    onCheckedChange={(checked) =>
                      setIncludeSignature(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="includeSignature" className="text-sm">
                    Zone de signature
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeDateStamp"
                    checked={includeDateStamp}
                    onCheckedChange={(checked) =>
                      setIncludeDateStamp(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="includeDateStamp" className="text-sm">
                    Horodatage
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includePageNumbers"
                    checked={includePageNumbers}
                    onCheckedChange={(checked) =>
                      setIncludePageNumbers(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="includePageNumbers" className="text-sm">
                    Numéros de page
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeTOC"
                    checked={includeTOC}
                    onCheckedChange={(checked) =>
                      setIncludeTOC(checked === true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="includeTOC" className="text-sm">
                    Table des matières
                  </Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customClauses">
                  Clauses personnalisées (optionnel)
                </Label>
                <Textarea
                  id="customClauses"
                  value={customClauses}
                  onChange={(e) => setCustomClauses(e.target.value)}
                  placeholder="Ajoutez des clauses spécifiques..."
                  className="min-h-[80px]"
                  disabled={loading}
                  maxLength={2000}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="additionalNotes">
                  Notes supplémentaires (optionnel)
                </Label>
                <Textarea
                  id="additionalNotes"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Instructions spéciales..."
                  className="min-h-[80px]"
                  disabled={loading}
                  maxLength={1000}
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <strong>Type :</strong> {currentDocumentType?.label}
                  </div>
                  <div>
                    <strong>Format :</strong> {currentFormat?.label}
                  </div>
                  <div>
                    <strong>Style :</strong> {currentStyle?.label}
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
                  <span>{currentStep || "Génération en cours..."}</span>
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
                !description.trim() ||
                !content.trim() ||
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
                  <span>Générer le document ({currentCost} crédits)</span>
                </div>
              )}
            </Button>

            {usageId && (
              <div className="space-y-4 border-t pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Label>Tâche de génération lancée avec succès !</Label>
                </div>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p>
                      Votre document est en cours de création. Il apparaîtra sur
                      votre page "Mon Contenu" dans quelques instants, dès que
                      le lien sera généré par nos systèmes.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      ID de suivi : {usageId}
                    </p>
                  </AlertDescription>
                </Alert>
                <div className="flex space-x-2">
                  <Button variant="outline" asChild>
                    <a href="/mon-contenu">
                      <Eye className="h-4 w-4 mr-2" />
                      Aller à "Mon Contenu"
                    </a>
                  </Button>
                  <Button variant="secondary" onClick={() => setUsageId(null)}>
                    Fermer
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            {permissions.data?.isPremium ? (
              <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Bibliothèque de templates premium</Label>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Activé
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-800">
                    <FileSignature className="h-4 w-4 mr-2" />
                    Templates Légaux
                  </Button>
                  <Button className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 text-orange-800">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Templates Business
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200">
                <FileSignature className="h-16 w-16 mx-auto mb-4 text-orange-500" />
                <h3 className="text-xl font-bold text-orange-900 mb-2">
                  Bibliothèque Templates Premium
                </h3>
                <p className="text-orange-700 mb-6 max-w-md mx-auto">
                  Accédez à notre collection exclusive de templates
                  professionnels validés par des experts.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Découvrir Templates Premium
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            {permissions.data?.isPremium ? (
              <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Options de design avancées</Label>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Premium Activé
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-800">
                    <Palette className="h-4 w-4 mr-2" />
                    Thèmes Premium
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 text-purple-800">
                    <Wand2 className="h-4 w-4 mr-2" />
                    Design Personnalisé
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200">
                <Palette className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                <h3 className="text-xl font-bold text-purple-900 mb-2">
                  Design & Style Premium
                </h3>
                <p className="text-purple-700 mb-6 max-w-md mx-auto">
                  Personnalisez l'apparence de vos documents avec des options de
                  design professionnel.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Activer Style Premium
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            {permissions.data?.isPremium ? (
              <>
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Fonctionnalités avancées</Label>
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
                      <Brain className="h-4 w-4 mr-2" />
                      IA Avancée
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-800">
                      <Shield className="h-4 w-4 mr-2" />
                      Validation Juridique
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
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <Settings className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  Fonctionnalités Avancées
                </h3>
                <p className="text-blue-700 mb-6 max-w-md mx-auto">
                  Outils professionnels de niveau entreprise pour vos documents
                  critiques.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Découvrir les Fonctionnalités
                </Button>
              </div>
            )}
          </TabsContent>

          {permissions.data?.isFree && (
            <TabsContent value="premium" className="space-y-4">
              <div className="text-center p-8 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg border-2 border-cyan-200">
                <div className="relative">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-cyan-500" />
                  <Crown className="h-6 w-6 absolute top-0 right-0 text-cyan-600" />
                </div>
                <h3 className="text-xl font-bold text-cyan-900 mb-2">
                  Passez à Document Generator Premium
                </h3>
                <p className="text-cyan-700 mb-6 max-w-md mx-auto">
                  Débloquez tous les templates, styles et fonctionnalités
                  avancées.
                </p>
                <Button
                  onClick={handleNavigateToBilling}
                  className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white"
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
                Vous avez besoin de {currentCost} crédits, mais vous n'en avez
                que {currentBalance}.
              </p>
              <Button
                onClick={handleNavigateToBilling}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Recharger le compte
              </Button>
            </div>
          </div>
        )}

        {permissions.data?.isFree && (
          <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
            <div className="flex items-start space-x-3">
              <Crown className="h-5 w-5 text-cyan-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-cyan-900 mb-1">
                  Débloquez tout le potentiel du Générateur de Documents
                </h4>
                <p className="text-xs text-cyan-700 mb-3">
                  Passez à Premium pour accéder à l'ensemble des fonctionnalités
                  professionnelles.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {premiumFeaturesFromAPI.slice(0, 6).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 text-xs text-cyan-700"
                    >
                      <CheckCircle className="h-3 w-3 text-cyan-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleNavigateToBilling}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
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
