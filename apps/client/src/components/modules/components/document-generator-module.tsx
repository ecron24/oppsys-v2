import { useState, useRef, useMemo } from "react";
import z from "zod";
import { useAppForm } from "@oppsys/ui/components/tanstack-form/form-setup";
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
import {
  FileText,
  Building,
  Users,
  Scale,
  Briefcase,
  FileCheck,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  Crown,
  Brain,
  Sparkles,
  Plus,
  X,
} from "lucide-react";
import type { Module } from "../module-types";
import type { LucideIcon } from "lucide-react";
import type { ChangeEvent } from "react";
import type { RagDocument } from "@/components/documents/document-types";
import { modulesService } from "../service/modules-service";
import { documentService } from "@/components/documents/document-service";
import { MODULES_IDS } from "@oppsys/api/client";
import { validateDocumentFile } from "@/components/storage/file-storage-validator";
import { LinkButton } from "@/components/link-button";
import { routes } from "@/routes";

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

export type Payload =
  | {
      template: "business";
      workflowType: "business_proposal";
      clientName: string;
      proposalType: string;
      projectName: string;
      objectives: string;
      budget: string;
      deadline: string;
      language: string;
      maxSections: number;
    }
  | {
      template: "business";
      workflowType: "technical_manual";
      documentType: string;
      product: string;
      version: string;
      audience: string;
      techStack: string;
      language: string;
      maxSections: number;
    }
  | {
      template: "legal";
      workflowType: "legal_document";
      documentType: string;
      partieA: string;
      partieB: string;
      objet: string;
      jurisdiction: string;
      language: string;
      maxSections: number;
    }
  | {
      template: "legal";
      workflowType: "report_technical";
      reportType: string;
      businessDomain: string;
      timeframe: string;
      metrics: string;
      audience: string;
      clientName: string;
      language: string;
      maxSections: number;
    };

const formSchema = z.object({
  title: z.string().min(5, "Titre trop court").max(150, "Titre trop long"),
  description: z.string().min(20, "Description trop courte"),
  language: z.string().default("fr").optional(),
  outputFormat: z.string().default("docx").optional(),
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  projectReference: z.string().optional(),
  includeHeader: z.boolean().default(true).optional(),
  includeFooter: z.boolean().default(true).optional(),
  includeSignature: z.boolean().default(false).optional(),
  includeDateStamp: z.boolean().default(true).optional(),
  includePageNumbers: z.boolean().default(true).optional(),
  includeTOC: z.boolean().default(false).optional(),
  customClauses: z.string().optional(),
});
type FormType = z.infer<typeof formSchema>;

export default function DocumentGeneratorModule({
  module,
}: DocumentGeneratorModuleProps) {
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();

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
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [uploadingRag, setUploadingRag] = useState<boolean>(false);
  const [ragUploadProgress, setRagUploadProgress] = useState<number>(0);

  const form = useAppForm({
    defaultValues: {
      title: "",
      description: "",
      content: "",
      language: "fr",
      outputFormat: "docx",
      documentStyle: "corporate",
      template: "",
      companyName: "",
      companyAddress: "",
      projectReference: "",
      includeHeader: true,
      includeFooter: true,
      includeSignature: false,
      includeDateStamp: true,
      includePageNumbers: true,
      includeTOC: false,
      customClauses: "",
    } as FormType,
    validators: {
      onSubmit: formSchema,
    },
    onSubmitInvalid() {
      toast.error("Veuillez remplir tous les champs obligatoires.");
    },
    onSubmit: async ({ value }) => {
      // Reuse previous validation & submission logic
      if (!authUser) {
        toast.error("Vous devez être connecté.");
        return;
      }
      if (!hasEnoughCredits(currentCost)) {
        toast.error("Crédits insuffisants.");
        return;
      }
      // If legalAdvice required, ensure companyName
      const currentDocumentType = documentTypesFromAPI[documentType];
      if (currentDocumentType?.legalAdvice && !value.companyName?.trim()) {
        toast.error("Informations entreprise requises");
        return;
      }

      setError(null);
      setLoading(true);
      setCurrentStep("Lancement du processus...");
      setProgress(50);

      const moduleSlug = module.slug;

      const apiPayload = {
        context: {
          documentType,
          title: value.title.trim(),
          description: value.description.trim(),
          language: value.language,
          outputFormat: value.outputFormat,
          companyInfo: {
            name: value.companyName?.trim() || "",
            address: value.companyAddress?.trim() || "",
          },
          projectInfo: {
            reference: value.projectReference?.trim() || "",
          },
          formatting: {
            includeHeader: !!value.includeHeader,
            includeFooter: !!value.includeFooter,
            includeSignature: !!value.includeSignature,
            includeDateStamp: !!value.includeDateStamp,
            includePageNumbers: !!value.includePageNumbers,
            includeTOC: !!value.includeTOC,
          },
          customClauses: value.customClauses?.trim() || "",
          ragDocuments: ragDocuments.map((doc) => ({
            name: doc.name,
            path: doc.path,
            type: doc.type,
          })),
          // ragDocuments: [{name: "file example", path: "file path in supabase", type: "mimetype of the file"}],
        },
        save_output: true,
        timeout: 120000,
      } as const;

      setCurrentStep("Communication avec le générateur...");
      const response = await modulesService.executeModule(
        moduleSlug,
        apiPayload
      );

      setLoading(false);
      setCurrentStep("");
      if (response.success) {
        setProgress(100);
        setCurrentStep("Processus terminé !");
        toast.success("Génération du document lancée !", {
          description:
            "Votre document sera bientôt prêt sur la page 'Mon Contenu'.",
        });
        setProgress(0);
        return;
      }

      console.error("Erreur d'exécution du module:", response);
      setProgress(0);
      setError(response.error);
      toast.error(`Échec: ${response.error}`);
    },
  });

  const ragFileInputRef = useRef<HTMLInputElement>(null);

  // CALCULS DÉRIVÉS
  const currentCost = useMemo<number>(() => {
    const baseType = documentTypesFromAPI[documentType];
    return baseType?.cost || module?.creditCost || 0;
  }, [documentType, documentTypesFromAPI, module]);

  // VARIABLES DÉRIVÉES
  const currentBalance = balance || 0;
  const currentDocumentType = documentTypesFromAPI[documentType];

  const handleDocumentTypeChange = (newType: string) => {
    setDocumentType(newType);
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
          fileName: validateResult.data.fileName,
          fileType: validateResult.data.fileType,
          fileSize: validateResult.data.fileSize,
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
    <Card className="w-full  mx-auto">
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
            <TabsTrigger value="advanced">Avancé</TabsTrigger>
            {permissions.data?.isFree && (
              <TabsTrigger value="premium">Premium</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <form
              id="document-form"
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                form.handleSubmit();
              }}
            >
              <div className="space-y-3">
                <Label>Type de document</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(documentTypesFromAPI).map(
                    ([key, docType]) => {
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
                    }
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <form.AppField
                    name="title"
                    children={(field) => (
                      <>
                        <field.InputField
                          label="Titre du document"
                          placeholder="Ex: Proposition de services marketing digital"
                          required
                          maxLength={150}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>
                            {(field.state.value || "").length}/150 caractères
                          </span>
                          <span>Minimum 5 caractères</span>
                        </div>
                      </>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <form.AppField name="language">
                    {(field) => (
                      <field.SelectField
                        label="Langue"
                        options={supportedLanguagesFromAPI.map((lang) => ({
                          label: (
                            <div className="flex items-center space-x-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </div>
                          ),
                          value: lang.value,
                        }))}
                      />
                    )}
                  </form.AppField>
                </div>
              </div>

              <form.AppField
                name="description"
                children={(field) => (
                  <>
                    <field.TextareaField
                      label="Description du contexte"
                      placeholder="Décrivez le contexte, l'objectif du document..."
                      textareaClassName="min-h-[80px]"
                      required
                      maxLength={800}
                    />
                  </>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <form.AppField name="outputFormat">
                    {(field) => (
                      <field.SelectField
                        label="Format de sortie"
                        options={outputFormatsFromAPI.map((format) => ({
                          label: (
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
                          ),
                          value: format.value,
                        }))}
                      />
                    )}
                  </form.AppField>
                </div>
              </div>

              {currentDocumentType?.legalAdvice && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Informations entreprise (Requis)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <form.AppField name="companyName">
                        {(field) => (
                          <field.InputField
                            label="Nom de l'entreprise"
                            placeholder="Votre Entreprise SARL"
                            required
                          />
                        )}
                      </form.AppField>
                    </div>
                    <div className="space-y-2">
                      <form.AppField name="companyAddress">
                        {(field) => (
                          <field.InputField
                            label="Adresse entreprise"
                            placeholder="123 Rue de l'Entreprise, 75001 Paris"
                          />
                        )}
                      </form.AppField>
                    </div>
                    <div className="space-y-2">
                      <form.AppField name="projectReference">
                        {(field) => (
                          <field.InputField
                            label="Référence projet"
                            placeholder="REF-2024-001"
                          />
                        )}
                      </form.AppField>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium">Options de formatage</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <form.AppField name="includeHeader">
                      {(field) => (
                        <>
                          <Checkbox
                            id={field.name}
                            checked={!!field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked === true)
                            }
                            disabled={loading}
                          />
                          <Label htmlFor={field.name} className="text-sm">
                            En-tête personnalisé
                          </Label>
                        </>
                      )}
                    </form.AppField>
                  </div>
                  <div className="flex items-center space-x-2">
                    <form.AppField name="includeFooter">
                      {(field) => (
                        <>
                          <Checkbox
                            id={field.name}
                            checked={!!field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked === true)
                            }
                            disabled={loading}
                          />
                          <Label htmlFor={field.name} className="text-sm">
                            Pied de page
                          </Label>
                        </>
                      )}
                    </form.AppField>
                  </div>
                  <div className="flex items-center space-x-2">
                    <form.AppField name="includeSignature">
                      {(field) => (
                        <>
                          <Checkbox
                            id={field.name}
                            checked={!!field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked === true)
                            }
                            disabled={loading}
                          />
                          <Label htmlFor={field.name} className="text-sm">
                            Zone de signature
                          </Label>
                        </>
                      )}
                    </form.AppField>
                  </div>
                  <div className="flex items-center space-x-2">
                    <form.AppField name="includeDateStamp">
                      {(field) => (
                        <>
                          <Checkbox
                            id={field.name}
                            checked={!!field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked === true)
                            }
                            disabled={loading}
                          />
                          <Label htmlFor={field.name} className="text-sm">
                            Horodatage
                          </Label>
                        </>
                      )}
                    </form.AppField>
                  </div>
                  <div className="flex items-center space-x-2">
                    <form.AppField name="includePageNumbers">
                      {(field) => (
                        <>
                          <Checkbox
                            id={field.name}
                            checked={!!field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked === true)
                            }
                            disabled={loading}
                          />
                          <Label htmlFor={field.name} className="text-sm">
                            Numéros de page
                          </Label>
                        </>
                      )}
                    </form.AppField>
                  </div>
                  <div className="flex items-center space-x-2">
                    <form.AppField name="includeTOC">
                      {(field) => (
                        <>
                          <Checkbox
                            id={field.name}
                            checked={!!field.state.value}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked === true)
                            }
                            disabled={loading}
                          />
                          <Label htmlFor={field.name} className="text-sm">
                            Table des matières
                          </Label>
                        </>
                      )}
                    </form.AppField>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <form.AppField
                    name="customClauses"
                    children={(field) => (
                      <field.TextareaField
                        label="Clauses personnalisées (optionnel)"
                        placeholder="Ajoutez des clauses spécifiques..."
                        textareaClassName="min-h-[80px]"
                        maxLength={2000}
                      />
                    )}
                  />
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <form.Subscribe
                  selector={(s) => ({
                    outputFormat: s.values.outputFormat,
                  })}
                >
                  {({ outputFormat }) => (
                    <AlertDescription>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <strong>Type :</strong> {currentDocumentType?.label}
                        </div>
                        <div>
                          <strong>Format :</strong>{" "}
                          {
                            outputFormatsFromAPI.find(
                              (f) => f.value === outputFormat
                            )?.label
                          }
                        </div>
                        <div>
                          <strong>Coût :</strong> {currentCost} crédits
                        </div>
                      </div>
                    </AlertDescription>
                  )}
                </form.Subscribe>
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

              <form.AppForm>
                <form.SubmitButton
                  className="w-full"
                  size="lg"
                  disabled={loading || !hasEnoughCredits(currentCost)}
                  isLoading={loading}
                >
                  {!loading && (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Générer le document ({currentCost} crédits)</span>
                    </div>
                  )}
                  {loading && <LoadingSpinner />}
                </form.SubmitButton>
              </form.AppForm>
            </form>
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
                <LinkButton to={routes.billing.index()} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Découvrir les Fonctionnalités
                </LinkButton>
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
                <LinkButton to={routes.billing.index()}>
                  <Crown className="h-4 w-4 mr-2" />
                  Découvrir Premium
                </LinkButton>
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
              <LinkButton
                to={routes.billing.index()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Recharger le compte
              </LinkButton>
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
                <LinkButton to={routes.billing.index()} size="sm">
                  <Crown className="h-3 w-3 mr-1" />
                  Découvrir Premium
                </LinkButton>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
