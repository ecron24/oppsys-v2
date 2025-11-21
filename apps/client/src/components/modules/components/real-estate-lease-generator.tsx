import {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
  type ChangeEvent,
} from "react";
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
import { useAuth } from "../../auth/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { LoadingSpinner } from "../../loading";
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { modulesService } from "../service/modules-service";
import { templatesService } from "../../templates/templates-service";
import {
  FileText,
  Building,
  Home,
  Scale,
  UserCheck,
  Mail,
  Download,
  CheckCircle,
  AlertCircle,
  Info,
  Crown,
  FileSignature,
  Upload,
  Trash2,
} from "lucide-react";
import type { Module, ExecuteModuleData } from "../module-types";
import type {
  LeaseType,
  Template,
} from "@/components/templates/templates-type";
import { toSnakeCase } from "@/lib/to-snake-case";
import { MODULES_IDS } from "@oppsys/api/client";

type Config = Extract<
  Module["config"],
  { configType: typeof MODULES_IDS.REAL_ESTATE_LEASE_GENERATOR }
>;

type RealEstateLeaseGeneratorProps = {
  module: Module;
};

export default function RealEstateLeaseGenerator({
  module,
}: RealEstateLeaseGeneratorProps) {
  // HOOKS
  const { user: authUser } = useAuth();
  const { hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();

  // CONFIGURATION HYBRIDE : Fallback + BDD
  const fullModuleConfig = useMemo(() => {
    return {
      ...module,
      apiEndpoint: `/modules/${module.id}/execute`,
      // Configuration hybride
      config: {
        // Pays statiques (ne changent jamais)
        availableCountries: [
          { code: "FR", name: "France", flag: "🇫🇷", currency: "€" },
          { code: "BE", name: "Belgique", flag: "🇧🇪", currency: "€" },
          { code: "DE", name: "Allemagne", flag: "🇩🇪", currency: "€" },
          { code: "ES", name: "Espagne", flag: "🇪🇸", currency: "€" },
          { code: "IT", name: "Italie", flag: "🇮🇹", currency: "€" },
          { code: "LU", name: "Luxembourg", flag: "🇱🇺", currency: "€" },
          { code: "CH", name: "Suisse", flag: "🇨🇭", currency: "CHF" },
          { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "€" },
        ],
        // Config dynamique de la BDD
        ...module.config,
      },
    };
  }, [module]);

  // Configuration API - utilise maintenant la config hybride
  const config = useMemo(
    () => (module.config || {}) as Config,
    [module.config]
  );
  const availableCountries = fullModuleConfig?.config?.availableCountries || [];
  const outputFormatsFromAPI = useMemo(
    () => config?.outputFormats || [],
    [config]
  );
  const emailOptionsFromAPI = useMemo(
    () => config.emailOptions || {},
    [config]
  );
  const leaseTypes = useMemo(() => config?.leaseTypes || {}, [config]);

  // ÉTATS
  const [leaseType, setLeaseType] = useState<LeaseType>("residentialFree");
  const [title, setTitle] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("FR");
  const [propertyAddress, setPropertyAddress] = useState<string>("");
  const [propertyType, setPropertyType] = useState<string>("");
  const [propertySurface, setPropertySurface] = useState<string>("");
  const [propertyRent, setPropertyRent] = useState<string>("");
  const [propertyDeposit, setPropertyDeposit] = useState<string>("");
  const [propertyCharges, setPropertyCharges] = useState<string>("");

  // Composition détaillée du bien
  const [mainRooms, setMainRooms] = useState<string>("");
  const [bedrooms, setBedrooms] = useState<string>("");
  const [hasKitchen, setHasKitchen] = useState<boolean>(false);
  const [bathrooms, setBathrooms] = useState<string>("");
  const [separateWC, setSeparateWC] = useState<boolean>(false);
  const [hasTechnicalRoom, setHasTechnicalRoom] = useState<boolean>(false);
  const [hasBalcony, setHasBalcony] = useState<boolean>(false);
  const [balconySize, setBalconySize] = useState<string>("");
  const [hasGarage, setHasGarage] = useState<boolean>(false);
  const [garageSize, setGarageSize] = useState<string>("");

  // Propriétaire
  const [ownerName, setOwnerName] = useState<string>("");
  const [ownerAddress, setOwnerAddress] = useState<string>("");
  const [ownerEmail, setOwnerEmail] = useState<string>("");

  // Locataire
  const [tenantName, setTenantName] = useState<string>("");
  const [tenantAddress, setTenantAddress] = useState<string>("");
  const [tenantEmail, setTenantEmail] = useState<string>("");
  const [tenantPhone, setTenantPhone] = useState<string>("");

  // Options du bail
  const [leaseDuration, setLeaseDuration] = useState<string>("");
  const [leaseStartDate, setLeaseStartDate] = useState<string>("");
  const [leaseEndDate, setLeaseEndDate] = useState<string>("");
  const [leasePurpose, setLeasePurpose] = useState<string>("");
  const [leaseGuarantee, setLeaseGuarantee] = useState<string>("");
  const [signatureCity, setSignatureCity] = useState<string>("");
  const [signatureDate, setSignatureDate] = useState<string>("");

  // Options professionnelles (Premium)
  const [commercialClauses, setCommercialClauses] = useState<string>("");
  const [rentIndexation, setRentIndexation] = useState<boolean>(false);
  const [renewalOption, setRenewalOption] = useState<boolean>(false);
  const [exclusivityClause, setExclusivityClause] = useState<boolean>(false);

  // Envoi d'email
  const [sendEmail, setSendEmail] = useState<boolean>(false);
  const [recipientEmail, setRecipientEmail] = useState<string>("");
  const [ccEmail, setCcEmail] = useState<string>("");

  // Génération
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExecuteModuleData | null>(null);
  const isSubmitting = useRef<boolean>(false);

  // États pour les templates et formats
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [outputFormat, setOutputFormat] = useState<string>("docx");
  const [standardTemplates, setStandardTemplates] = useState<Template[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ✅ CALCUL DU COÛT depuis la BDD
  const currentCost = useMemo<number>(() => {
    if (!leaseTypes[leaseType]) {
      return fullModuleConfig?.creditCost || 0;
    }
    return leaseTypes[leaseType].cost || 0;
  }, [leaseType, fullModuleConfig, leaseTypes]);

  // ✅ FILTRAGE DES TYPES DE BAUX avec gestion permissions
  const availableLeaseTypes = useMemo(() => {
    if (!leaseTypes) {
      return [];
    }

    return Object.entries(leaseTypes).filter(([, type]) => {
      if (permissions.data?.isFree) {
        return type.userModes && type.userModes.includes("free");
      }
      if (permissions.data?.isPremium) {
        return type.userModes && type.userModes.includes("premium");
      }
      return false;
    });
  }, [permissions.data, leaseTypes]);

  const getTabsLayout = useMemo<string>(() => {
    const hasPremiumTab = !permissions.data?.isFree;

    if (hasPremiumTab) {
      return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
    } else {
      return "grid-cols-2 sm:grid-cols-4";
    }
  }, [permissions.data?.isFree]);

  // Charger tous les templates (standards et personnalisés)
  const loadTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await templatesService.getRealEstateTemplates();
      if (response.success) {
        const standard = response.data.filter((t) => t.isPublic);
        const custom = response.data.filter(
          (t) => !t.isPublic && t.userId === authUser?.id
        );
        setStandardTemplates(standard);
        setCustomTemplates(custom);
      }
    } catch (error) {
      console.error("Erreur chargement templates:", error);
      toast.error("Erreur lors du chargement des templates");
    } finally {
      setIsLoadingTemplates(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    if (authUser) {
      loadTemplates();
    }
  }, [authUser, loadTemplates]);

  // Déterminer le template à utiliser
  const determineTemplatePath = (): string => {
    const userPlan = authUser?.plans?.name?.toLowerCase() || "free";

    if (userPlan === "free") {
      return "residential_standard.md";
    } else {
      if (selectedTemplate) {
        const template = [...standardTemplates, ...customTemplates].find(
          (t) => t.id === selectedTemplate
        );
        if (template) {
          const urlParts = template.filePath.split("/");
          return urlParts[urlParts.length - 1];
        }
      }

      const templateMap: Record<string, string> = {
        residential_free: "residential_standard.md",
        residential_pro:
          userPlan === "premium"
            ? "residential_pro_premium.md"
            : "residential_pro_standard.md",
        furnished: "furnished_standard.md",
        commercial: "commercial_standard.md",
        professional: "professional_standard.md",
      };

      return templateMap[leaseType] || "residential_standard.md";
    }
  };

  // Upload d'un nouveau template personnalisé
  const handleTemplateUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !authUser) return;

    if (!permissions.data?.isPremium) {
      toast.error("Fonctionnalité réservée aux abonnés Premium");
      return;
    }

    const allowedTypes = [".docx", ".doc", ".pdf", ".txt"];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf("."));
    if (!allowedTypes.includes(fileExtension)) {
      toast.error("Format de fichier non supporté");
      return;
    }

    const response = await templatesService.uploadTemplate({
      file,
      leaseType,
      category: "real_estate",
    });

    if (response.success) {
      toast.success("Template ajouté avec succès");
      setCustomTemplates((prev) => [...prev, response.data]);
      setSelectedTemplate(response.data.id);
      return;
    }

    console.error("Erreur upload template:", error);
    toast.error("Erreur lors de l'ajout du template");
  };

  // Supprimer un template personnalisé
  const deleteCustomTemplate = async (templateId: string) => {
    if (!authUser) return;
    const response = await templatesService.deleteTemplate(templateId);
    if (response.success) {
      setCustomTemplates((prev) => prev.filter((t) => t.id !== templateId));
      if (selectedTemplate === templateId) {
        setSelectedTemplate("");
      }
      toast.success("Template supprimé");
      return;
    }
    console.error("Erreur suppression template:", error);
    toast.error("Erreur lors de la suppression");
  };

  // Validation du formulaire
  const validateForm = (): boolean => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return false;
    }
    if (!hasEnoughCredits(currentCost)) {
      toast.error("Crédits insuffisants.");
      return false;
    }
    if (!title.trim()) {
      toast.error("Titre requis");
      return false;
    }
    if (!propertyAddress.trim()) {
      toast.error("Adresse du bien requise");
      return false;
    }
    if (!ownerName.trim() || !tenantName.trim()) {
      toast.error("Noms du propriétaire et locataire requis");
      return false;
    }
    if (leaseType === "commercial" && !leasePurpose.trim()) {
      toast.error("Destination des locaux requise pour les baux commerciaux");
      return false;
    }
    return true;
  };

  // ✅ SOUMISSION CORRIGÉE
  const handleSubmit = async () => {
    if (isSubmitting.current || loading) return;
    setError(null);
    if (!validateForm()) return;

    isSubmitting.current = true;
    setLoading(true);
    setResult(null);
    setCurrentStep("Préparation des données...");
    setProgress(20);

    // ✅ UTILISER Le slug DE LA BDD
    const moduleSlug = fullModuleConfig?.slug || "real-estate-lease-generator";

    if (!moduleSlug) {
      setError("Configuration du module incomplète");
      setLoading(false);
      isSubmitting.current = false;
      return;
    }

    const selectedCountryInfo = availableCountries.find(
      (country) => country.code === selectedCountry
    );

    const apiPayload = {
      input: {
        leaseType,
        title: title.trim(),
        templateFile: determineTemplatePath(),
        userPlan: authUser?.plans?.name || "free",
        userId: authUser?.id,
        outputFormat,
        country: selectedCountry,
        countryInfo: selectedCountryInfo,
        propertyInfo: {
          address: propertyAddress.trim(),
          type: propertyType.trim(),
          surface: propertySurface.trim(),
          rent: propertyRent.trim(),
          deposit: propertyDeposit.trim(),
          charges: propertyCharges.trim(),
          mainRooms: mainRooms.trim(),
          bedrooms: bedrooms.trim(),
          hasKitchen,
          bathrooms: bathrooms.trim(),
          separateWC,
          hasTechnicalRoom,
          hasBalcony,
          balconySize: balconySize.trim(),
          hasGarage,
          garageSize: garageSize.trim(),
        },
        ownerInfo: {
          name: ownerName.trim(),
          address: ownerAddress.trim(),
          email: ownerEmail.trim(),
        },
        tenantInfo: {
          name: tenantName.trim(),
          address: tenantAddress.trim(),
          email: tenantEmail.trim(),
          phone: tenantPhone.trim(),
        },
        leaseInfo: {
          duration: leaseDuration?.toString().trim() || "",
          startDate: leaseStartDate.trim(),
          endDate: leaseEndDate.trim(),
          purpose: leasePurpose.trim(),
          guarantee: leaseGuarantee.trim(),
          signatureCity: signatureCity.trim(),
          signatureDate: signatureDate.trim(),
        },
        commercialOptions: {
          clauses: commercialClauses.trim(),
          rentIndexation,
          renewalOption,
          exclusivityClause,
        },
        emailOptions: {
          send: sendEmail,
          recipient: recipientEmail.trim(),
          cc: ccEmail.trim(),
        },
      },
      save_output: true,
      timeout: 120000,
    };

    setCurrentStep("Génération du document...");
    setProgress(60);

    const response = await modulesService.executeModule(moduleSlug, apiPayload);
    setLoading(false);
    setProgress(0);
    setCurrentStep("");
    isSubmitting.current = false;
    if (response.success && response.data) {
      setProgress(100);
      setCurrentStep("Document généré avec succès !");
      toast.success("Document généré avec succès !");
      setResult(response.data);
      return;
    }
    setError("Aucune réponse du serveur");
    toast.error(`Échec: Aucune réponse du serveur`);
  };

  // Téléchargement du document
  const downloadDocument = () => {
    if (
      result?.output?.result &&
      typeof result.output.result === "object" &&
      "documentUrl" in result.output.result &&
      result.output.result.documentUrl
    ) {
      const link = document.createElement("a");
      link.href = result.output.result.documentUrl.toString();
      link.download = `bail-${title.toLowerCase().replace(/[^a-z0-9]/g, "-")}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Document téléchargé");
    }
  };

  // Préparation des variables pour les templates
  const selectedCountryInfo = availableCountries.find(
    (country) => country.code === selectedCountry
  );
  const templateVariables: Record<string, string> = {
    owner_name: ownerName,
    owner_address: ownerAddress,
    owner_email: ownerEmail,
    tenant_name: tenantName,
    tenant_address: tenantAddress,
    tenant_email: tenantEmail,
    tenant_phone: tenantPhone,
    property_address: propertyAddress,
    property_type: propertyType,
    property_surface: propertySurface,
    property_rent: propertyRent,
    property_deposit: propertyDeposit,
    property_charges: propertyCharges,
    country_code: selectedCountry,
    country_name: selectedCountryInfo?.name || "",
    country_flag: selectedCountryInfo?.flag || "",
    currency: selectedCountryInfo?.currency || "€",
    main_rooms: mainRooms,
    bedrooms: bedrooms,
    has_kitchen: hasKitchen ? "Oui" : "Non",
    bathrooms: bathrooms,
    separate_wc: separateWC ? "Oui" : "Non",
    has_technical_room: hasTechnicalRoom ? "Oui" : "Non",
    has_balcony: hasBalcony ? `Oui (${balconySize} m²)` : "Non",
    has_garage: hasGarage ? `Oui (${garageSize} m²)` : "Non",
    lease_duration: leaseDuration,
    lease_start_date: leaseStartDate,
    lease_end_date: leaseEndDate,
    lease_purpose: leasePurpose,
    lease_guarantee: leaseGuarantee,
    signature_city: signatureCity,
    signature_date: signatureDate,
    commercial_clauses: commercialClauses,
    rent_indexation: rentIndexation ? "Oui" : "Non",
    renewal_option: renewalOption ? "Oui" : "Non",
    exclusivity_clause: exclusivityClause ? "Oui" : "Non",
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSignature className="h-6 w-6 text-blue-500" />
            <CardTitle>
              {fullModuleConfig?.name || "Générateur de Baux Immobiliers"}
            </CardTitle>
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
          {fullModuleConfig?.description ||
            "Générez des baux immobiliers conformes à la législation."}
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

        <Tabs defaultValue="document" className="w-full">
          <TabsList className={`grid w-full ${getTabsLayout}`}>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="property">Bien</TabsTrigger>
            <TabsTrigger value="parties">Parties</TabsTrigger>
            <TabsTrigger value="lease">
              {leaseType === "commercial" ? "Bail & Commercial" : "Bail"}
            </TabsTrigger>
            {!permissions.data?.isFree && (
              <TabsTrigger value="email">Envoi</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="document" className="space-y-6">
            {/* Sélection du pays */}
            <div className="space-y-3">
              <Label>Pays et législation applicable</Label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {availableCountries.map((country) => (
                  <div
                    key={country.code}
                    className={`border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedCountry === country.code
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:border-blue-400 dark:bg-blue-900/20 dark:ring-blue-400/30"
                        : "border-border hover:border-blue-500/50"
                    }`}
                    onClick={() => setSelectedCountry(country.code)}
                    title={country.name}
                  >
                    <div className="text-center space-y-1">
                      <div className="text-lg">{country.flag}</div>
                      <span className="text-xs font-medium">
                        {country.code}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Le choix du pays détermine la législation applicable et les
                clauses légales du bail.
              </p>
            </div>

            <div className="space-y-3">
              <Label>Type de bail</Label>
              {availableLeaseTypes.length === 0 ? (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                  <p className="text-orange-700 text-sm">
                    {"Aucun type de bail disponible pour votre plan."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {availableLeaseTypes.map(([key, lease]) => (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        leaseType === key
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                          : "border-border hover:border-blue-500/50"
                      }`}
                      onClick={() =>
                        setLeaseType(toSnakeCase(key) as LeaseType)
                      }
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">
                            {lease.label}
                          </span>
                          {lease.cost === 0 && (
                            <Badge
                              variant="outline"
                              className="text-xs bg-green-100"
                            >
                              Gratuit
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {lease.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {lease.cost === 0
                              ? "Gratuit"
                              : `${lease.cost} crédits`}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {lease.complexity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {permissions.data?.isPremium && (
              <div className="space-y-4">
                <Label>Modèles disponibles</Label>

                {standardTemplates.filter((t) => t.leaseType === leaseType)
                  .length > 0 && (
                  <div>
                    <Label className="text-sm text-muted-foreground mb-2">
                      Modèles standards
                    </Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {standardTemplates
                        .filter((t) => t.leaseType === leaseType)
                        .map((template) => (
                          <div
                            key={template.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              selectedTemplate === template.id
                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20"
                                : "border-border hover:border-blue-500/50"
                            }`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {template.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                Standard
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm text-muted-foreground mb-2">
                    Mes templates
                  </Label>

                  {customTemplates.filter((t) => t.leaseType === leaseType)
                    .length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {customTemplates
                        .filter((t) => t.leaseType === leaseType)
                        .map((template) => (
                          <div
                            key={template.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all ${
                              selectedTemplate === template.id
                                ? "border-green-500 bg-green-50 ring-2 ring-green-500/20"
                                : "border-border hover:border-green-500/50"
                            }`}
                            onClick={() => setSelectedTemplate(template.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-sm">
                                {template.name}
                              </span>
                              <div className="flex items-center space-x-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-100"
                                >
                                  Personnalisé
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteCustomTemplate(template.id);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1 h-6 w-6"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 border border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Aucun template personnalisé
                      </p>
                    </div>
                  )}

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleTemplateUpload}
                        accept=".docx,.doc,.pdf,.txt"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading || isLoadingTemplates}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Importer un template
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Formats supportés: MD, DOCX, DOC, PDF, TXT
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                  {outputFormatsFromAPI?.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center space-x-2">
                        <span>{format.icon}</span>
                        <span>{format.label}</span>
                        {format.premium && !permissions.data?.isPremium && (
                          <Badge variant="outline" className="text-xs ml-2">
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
              <Label htmlFor="title">Titre du document *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Bail d'habitation - Appartement Paris"
                disabled={loading}
              />
            </div>

            {selectedTemplate && (
              <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800">
                  Variables disponibles pour ce template
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {Object.entries(templateVariables).map(([key, value]) => (
                    <div
                      key={key}
                      className="text-xs bg-white p-2 rounded border border-blue-100"
                    >
                      <code className="text-blue-600">{"{" + key + "}"}</code>
                      <span className="text-gray-600 ml-1">
                        -&gt; {value || "(vide)"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="property" className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium flex items-center space-x-2">
                <Building className="h-4 w-4" />
                <span>Informations sur le bien</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="propertyAddress">Adresse du bien *</Label>
                  <Input
                    id="propertyAddress"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="123 Avenue de la République, 75001 Paris"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyType">Type de bien</Label>
                  <Select
                    value={propertyType}
                    onValueChange={setPropertyType}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                        const category =
                          leaseType === "commercial" ||
                          leaseType === "professional"
                            ? "commercial"
                            : "residential";
                        const propertyOptions =
                          "propertyTypes" in fullModuleConfig.config
                            ? fullModuleConfig?.config?.propertyTypes?.[
                                category
                              ]
                            : [];

                        return propertyOptions.map((property) => (
                          <SelectItem
                            key={property.value}
                            value={property.value}
                          >
                            {property.label}
                          </SelectItem>
                        ));
                      })()}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertySurface">Surface (m²)</Label>
                  <Input
                    id="propertySurface"
                    value={propertySurface}
                    onChange={(e) => setPropertySurface(e.target.value)}
                    placeholder="60"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyRent">
                    Loyer mensuel ({selectedCountryInfo?.currency || "€"}) *
                  </Label>
                  <Input
                    id="propertyRent"
                    value={propertyRent}
                    onChange={(e) => setPropertyRent(e.target.value)}
                    placeholder="1200"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyDeposit">
                    Dépôt de garantie ({selectedCountryInfo?.currency || "€"})
                  </Label>
                  <Input
                    id="propertyDeposit"
                    value={propertyDeposit}
                    onChange={(e) => setPropertyDeposit(e.target.value)}
                    placeholder="2400"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="propertyCharges">
                    Montant des charges locatives (
                    {selectedCountryInfo?.currency || "€"})
                  </Label>
                  <Input
                    id="propertyCharges"
                    value={propertyCharges}
                    onChange={(e) => setPropertyCharges(e.target.value)}
                    placeholder="150"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Composition détaillée</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mainRooms">Pièce(s) principale(s)</Label>
                  <Input
                    id="mainRooms"
                    value={mainRooms}
                    onChange={(e) => setMainRooms(e.target.value)}
                    placeholder="Ex: 3"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bedrooms">Chambre(s)</Label>
                  <Input
                    id="bedrooms"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="Ex: 2"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasKitchen"
                    checked={hasKitchen}
                    onCheckedChange={(checked) =>
                      setHasKitchen(checked == true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="hasKitchen" className="text-sm">
                    Cuisine
                  </Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bathrooms">
                    Salle(s) de bain/salle(s) d'eau
                  </Label>
                  <Input
                    id="bathrooms"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="Ex: 1"
                    disabled={loading}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="separateWC"
                    checked={separateWC}
                    onCheckedChange={(checked) =>
                      setSeparateWC(checked == true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="separateWC" className="text-sm">
                    WC séparé(s)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasTechnicalRoom"
                    checked={hasTechnicalRoom}
                    onCheckedChange={(checked) =>
                      setHasTechnicalRoom(checked == true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="hasTechnicalRoom" className="text-sm">
                    Local technique
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasBalcony"
                    checked={hasBalcony}
                    onCheckedChange={(checked) =>
                      setHasBalcony(checked == true)
                    }
                    disabled={loading}
                  />
                  <Label htmlFor="hasBalcony" className="text-sm">
                    Balcon/terrasse
                  </Label>
                </div>
                {hasBalcony && (
                  <div className="space-y-2">
                    <Label htmlFor="balconySize">
                      Surface du balcon/terrasse (m²)
                    </Label>
                    <Input
                      id="balconySize"
                      value={balconySize}
                      onChange={(e) => setBalconySize(e.target.value)}
                      placeholder="Ex: 10"
                      disabled={loading}
                    />
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasGarage"
                    checked={hasGarage}
                    onCheckedChange={(checked) => setHasGarage(checked == true)}
                    disabled={loading}
                  />
                  <Label htmlFor="hasGarage" className="text-sm">
                    Garage/cave
                  </Label>
                </div>
                {hasGarage && (
                  <div className="space-y-2">
                    <Label htmlFor="garageSize">
                      Surface du garage/cave (m²)
                    </Label>
                    <Input
                      id="garageSize"
                      value={garageSize}
                      onChange={(e) => setGarageSize(e.target.value)}
                      placeholder="Ex: 20"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="parties" className="space-y-4">
            <div className="space-y-6">
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Propriétaire</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Nom du propriétaire *</Label>
                    <Input
                      id="ownerName"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Jean Dupont"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Email</Label>
                    <Input
                      id="ownerEmail"
                      value={ownerEmail}
                      onChange={(e) => setOwnerEmail(e.target.value)}
                      placeholder="proprietaire@example.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="ownerAddress">Adresse</Label>
                    <Input
                      id="ownerAddress"
                      value={ownerAddress}
                      onChange={(e) => setOwnerAddress(e.target.value)}
                      placeholder="456 Rue du Propriétaire"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Locataire</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tenantName">Nom du locataire *</Label>
                    <Input
                      id="tenantName"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Marie Martin"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantEmail">Email</Label>
                    <Input
                      id="tenantEmail"
                      value={tenantEmail}
                      onChange={(e) => setTenantEmail(e.target.value)}
                      placeholder="locataire@example.com"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantPhone">Téléphone</Label>
                    <Input
                      id="tenantPhone"
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="0612345678"
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tenantAddress">Adresse</Label>
                    <Input
                      id="tenantAddress"
                      value={tenantAddress}
                      onChange={(e) => setTenantAddress(e.target.value)}
                      placeholder="789 Rue du Locataire"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lease" className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h3 className="font-medium flex items-center space-x-2">
                <FileSignature className="h-4 w-4" />
                <span>Informations du bail</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leaseDuration">Durée du bail</Label>
                  <Select
                    value={leaseDuration}
                    onValueChange={setLeaseDuration}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une durée" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaseTypes?.[leaseType]?.durations?.map((duration) => (
                        <SelectItem key={duration} value={duration.toString()}>
                          {duration} an{duration > 1 ? "s" : ""}
                        </SelectItem>
                      )) || <SelectItem value="3">3 ans</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseStartDate">Date de début</Label>
                  <Input
                    id="leaseStartDate"
                    value={leaseStartDate}
                    onChange={(e) => setLeaseStartDate(e.target.value)}
                    placeholder="01/01/2024"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseEndDate">Date de fin</Label>
                  <Input
                    id="leaseEndDate"
                    value={leaseEndDate}
                    onChange={(e) => setLeaseEndDate(e.target.value)}
                    placeholder="01/01/2025"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaseGuarantee">Garant du loyer</Label>
                  <Input
                    id="leaseGuarantee"
                    value={leaseGuarantee}
                    onChange={(e) => setLeaseGuarantee(e.target.value)}
                    placeholder="Nom du garant ou caution"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signatureCity">Ville de signature</Label>
                  <Input
                    id="signatureCity"
                    value={signatureCity}
                    onChange={(e) => setSignatureCity(e.target.value)}
                    placeholder="Paris"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signatureDate">Date de signature</Label>
                  <Input
                    id="signatureDate"
                    type="date"
                    value={signatureDate}
                    onChange={(e) => setSignatureDate(e.target.value)}
                    disabled={loading}
                  />
                </div>
                {leaseType === "commercial" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="leasePurpose">
                      Destination des locaux *
                    </Label>
                    <Input
                      id="leasePurpose"
                      value={leasePurpose}
                      onChange={(e) => setLeasePurpose(e.target.value)}
                      placeholder="Boutique de vente de vêtements"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            </div>

            {leaseType === "commercial" && (
              <div className="space-y-4 p-4 border rounded-lg bg-amber-50/50 border-amber-200">
                <h3 className="font-medium flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-amber-600" />
                  <span className="text-amber-800">
                    Options commerciales spécifiques
                  </span>
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="commercialClauses">
                      Clauses commerciales spécifiques
                    </Label>
                    <Textarea
                      id="commercialClauses"
                      value={commercialClauses}
                      onChange={(e) => setCommercialClauses(e.target.value)}
                      placeholder="Ajoutez des clauses spécifiques pour ce bail commercial..."
                      className="min-h-[100px] bg-white"
                      disabled={loading}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rentIndexation"
                        checked={rentIndexation}
                        onCheckedChange={(checked) =>
                          setRentIndexation(checked == true)
                        }
                        disabled={loading}
                      />
                      <Label htmlFor="rentIndexation" className="text-sm">
                        Indexation du loyer
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="renewalOption"
                        checked={renewalOption}
                        onCheckedChange={(checked) =>
                          setRenewalOption(checked == true)
                        }
                        disabled={loading}
                      />
                      <Label htmlFor="renewalOption" className="text-sm">
                        Option de renouvellement
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exclusivityClause"
                        checked={exclusivityClause}
                        onCheckedChange={(checked) =>
                          setExclusivityClause(checked == true)
                        }
                        disabled={loading}
                      />
                      <Label htmlFor="exclusivityClause" className="text-sm">
                        Clause d'exclusivité
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {!permissions.data?.isFree && (
            <TabsContent value="email" className="space-y-4">
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Options d'envoi</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sendEmail"
                      checked={sendEmail}
                      onCheckedChange={(checked) =>
                        setSendEmail(checked == true)
                      }
                      disabled={loading}
                    />
                    <Label htmlFor="sendEmail" className="text-sm">
                      Envoyer le document par email
                    </Label>
                  </div>
                  {sendEmail && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                      <div className="space-y-2">
                        <Label htmlFor="recipientEmail">
                          Email du destinataire *
                        </Label>
                        <Input
                          id="recipientEmail"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="client@example.com"
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ccEmail">
                          Email en copie (optionnel)
                        </Label>
                        <Input
                          id="ccEmail"
                          value={ccEmail}
                          onChange={(e) => setCcEmail(e.target.value)}
                          placeholder="copie@example.com"
                          disabled={loading}
                        />
                      </div>
                    </div>
                  )}
                  {permissions.data?.isPremium &&
                    emailOptionsFromAPI.premiumFeatures && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">
                          Fonctionnalités Premium disponibles
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                          {emailOptionsFromAPI.premiumFeatures.map(
                            (feature, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2 text-xs text-muted-foreground"
                              >
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                <span>{feature.replace("_", " ")}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        {loading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{currentStep || "Génération en cours..."}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !title.trim() ||
              !propertyAddress.trim() ||
              !ownerName.trim() ||
              !tenantName.trim() ||
              !hasEnoughCredits(currentCost)
            }
            className="flex-1"
            size="lg"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Générer le bail ({currentCost} crédits)</span>
              </div>
            )}
          </Button>
          {result && (
            <Button
              onClick={downloadDocument}
              variant="outline"
              disabled={loading}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <Label>Document généré avec succès !</Label>
            </div>
            {result?.output?.result &&
              typeof result.output.result === "object" &&
              "documentUrl" in result.output.result && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p>
                      Votre document est prêt. Vous pouvez le télécharger ou
                      l'envoyer par email.
                    </p>
                    {sendEmail && "emailSent" in result.output.result && (
                      <p className="text-green-600 mt-2">
                        Le document a été envoyé par email.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
