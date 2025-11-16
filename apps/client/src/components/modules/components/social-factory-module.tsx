import { useState, useRef, useMemo, useEffect, type ChangeEvent } from "react";
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
import { usePremiumFeatures } from "@/hooks/use-premium-features";
import { useNavigate, useLocation } from "react-router";
import {
  PremiumMediaFeature,
  PremiumSchedulingFeature,
} from "../../premium-feature.tsx";
import {
  Share2,
  Upload,
  Sparkles,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Copy,
  Crown,
  Calendar,
  Target,
  Palette,
  Users,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Heart,
  Camera,
  Globe,
  Eye,
  Video,
  Image as ImageIcon,
  Info,
  ExternalLink,
  LayoutTemplate,
  Figma,
  Cloud,
  Lock,
  Unlock,
  RefreshCw,
  Image as ImageIcon2,
  Plus,
  FileText,
} from "lucide-react";
import { modulesService } from "../service/modules-service";
import { documentService } from "../../documents/document-service";
import { LoadingSpinner } from "../../loading";
import type { ExecuteModuleData, Module } from "../module-types";
import type { RagDocument } from "../../documents/document-types";
import type { LucideIcon } from "lucide-react";
import { contentService } from "@/components/content/content-service.ts";

type Template = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  platform: string;
  topic: string;
  keywords: string;
  callToAction: string;
  postType: string;
  objective: string;
  contentStyle: string;
  includeHashtags: boolean;
  autoGenerateHashtags: boolean;
  includeEmojis: boolean;
  addCTA?: boolean;
  ctaType?: string;
  ctaUrl?: string;
};

type SocialFactoryModuleProps = {
  module: Module;
};

export default function SocialFactoryModule({
  module,
}: SocialFactoryModuleProps) {
  // HOOKS
  const { user: authUser } = useAuth();
  const { balance, hasEnoughCredits, formatBalance } = useCredits();
  const permissions = usePremiumFeatures();
  const navigate = useNavigate();
  const location = useLocation();

  // CONFIGURATION VIA L'API
  const networksFromAPI = useMemo(
    () =>
      module?.config && "networks" in module.config
        ? module.config.networks
        : {},
    [module?.config]
  );
  const postTypesFromAPI = useMemo(
    () =>
      module?.config && "postTypes" in module.config
        ? module.config.postTypes
        : {},
    [module?.config]
  );
  const contentStylesFromAPI = useMemo(
    () =>
      module?.config && "contentStyles" in module.config
        ? module.config.contentStyles
        : {},
    [module?.config]
  );
  const objectivesFromAPI = useMemo(
    () =>
      module?.config && "objectives" in module.config
        ? module.config.objectives
        : {},
    [module?.config]
  );
  const ctaTypesFromAPI = useMemo(
    () =>
      (module?.config && "ctaTypes" in module.config
        ? module.config.ctaTypes
        : []) as { value: string; label: string }[],
    [module?.config]
  );
  const premiumFeaturesFromAPI = useMemo(
    () =>
      module?.config && "premiumFeatures" in module.config
        ? module.config.premiumFeatures
        : [],
    [module?.config]
  );

  // ÉTATS
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([
    "instagram",
  ]);
  const [postType, setPostType] = useState<string>("text");
  const [contentStyle, setContentStyle] = useState<string>("professional");
  const [objective, setObjective] = useState<string>("engagement");
  const [topic, setTopic] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [callToAction, setCallToAction] = useState<string>("");
  const [includeHashtags, setIncludeHashtags] = useState<boolean>(true);
  const [includeEmojis, setIncludeEmojis] = useState<boolean>(true);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<File | null>(null);

  // ✅ NOUVEAUX ÉTATS DEPUIS FACEBOOK MODULE
  const [addCTA, setAddCTA] = useState<boolean>(false);
  const [ctaType, setCtaType] = useState<string>("learn_more");
  const [ctaUrl, setCtaUrl] = useState<string>("");
  const [mentions, setMentions] = useState<string>("");
  const [autoGenerateHashtags, setAutoGenerateHashtags] =
    useState<boolean>(true);

  // ÉTATS DE PLANIFICATION ET CHARGEMENT
  const [schedulePost, setSchedulePost] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [schedulingLoading, setSchedulingLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ExecuteModuleData | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [uploadingRag, setUploadingRag] = useState<boolean>(false);
  const [ragUploadProgress, setRagUploadProgress] = useState<number>(0);
  const [schedulingContentId, setSchedulingContentId] = useState<string | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<string>("content");

  // ✅ NOUVEAUX ÉTATS POUR L'ONGLET TEMPLATES (ADAPTÉS DE LINKEDIN)
  const [templatePlatform, setTemplatePlatform] = useState<string>("");
  const [platformConnected, setPlatformConnected] = useState<boolean>(false);
  const [platformTemplates, setPlatformTemplates] = useState<Template[]>([]);
  const [templateLoading, setTemplateLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // RÉFÉRENCES
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const ragFileInputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = useRef<boolean>(false);
  const isScheduling = useRef<boolean>(false);

  // CALCULS DÉRIVÉS
  const currentCost = useMemo(() => {
    let baseCost = 0;
    selectedNetworks.forEach((networkKey) => {
      baseCost += networksFromAPI[networkKey]?.cost || 0;
    });
    const typeMultiplier = postTypesFromAPI[postType]?.cost || 1;
    baseCost = Math.ceil(baseCost * typeMultiplier);
    if (uploadedImages.length > 0)
      baseCost += uploadedImages.length * (permissions.data?.isPremium ? 1 : 2);
    if (uploadedVideo) baseCost += permissions.data?.isPremium ? 3 : 5;
    if (schedulePost) baseCost = Math.ceil(baseCost * 1.1);
    if (addCTA) baseCost = Math.ceil(baseCost * 1.1);
    if (autoGenerateHashtags) baseCost = Math.ceil(baseCost * 1.05);
    return Math.max(baseCost, 5);
  }, [
    selectedNetworks,
    postType,
    uploadedImages.length,
    uploadedVideo,
    schedulePost,
    addCTA,
    autoGenerateHashtags,
    permissions.data?.isPremium,
    networksFromAPI,
    postTypesFromAPI,
  ]);

  const maxImagesAllowed = useMemo(() => {
    const baseMax = Math.min(
      ...selectedNetworks.map((key) => networksFromAPI[key]?.maxImages ?? 10)
    );
    return (permissions.data?.media?.maxImages || 0) > baseMax
      ? baseMax
      : permissions.data?.media?.maxImages || 0;
  }, [selectedNetworks, networksFromAPI, permissions.data?.media?.maxImages]);

  // VARIABLES DÉRIVÉES
  const currentBalance = balance;
  const currentObjective = objectivesFromAPI[objective] || {};
  const currentContentStyle = contentStylesFromAPI[contentStyle] || {};

  // FONCTIONS DE GESTION
  const handleNavigateToBilling = () => navigate("/billing");
  const handleNetworkToggle = (networkKey: string) =>
    setSelectedNetworks((prev) =>
      prev.includes(networkKey)
        ? prev.filter((key) => key !== networkKey)
        : [...prev, networkKey]
    );
  const handlePostTypeChange = (newType: string) => {
    setPostType(newType);
    if (newType === "video") setUploadedImages([]);
    if (newType !== "video") setUploadedVideo(null);
  };
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files).slice(
      0,
      (maxImagesAllowed || 0) - uploadedImages.length
    );
    if (files.length > 0) setUploadedImages((prev) => [...prev, ...files]);
    toast.success(`${files.length} image(s) ajoutée(s).`);
  };
  const handleVideoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedVideo(file);
    toast.success("Vidéo ajoutée.");
  };
  const removeImage = (index: number) =>
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  const removeVideo = () => {
    setUploadedVideo(null);
    if (videoInputRef.current) videoInputRef.current.value = "";
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

  const validateForm = (): boolean => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return false;
    }
    if (selectedNetworks.length === 0) {
      toast.error("Sélectionnez au moins un réseau social.");
      return false;
    }
    if (!topic.trim()) {
      toast.error("Sujet requis.");
      return false;
    }
    if (addCTA && !ctaUrl.trim()) {
      toast.error("URL du CTA requise.");
      return false;
    }
    if (schedulePost && !(permissions.data?.scheduling?.canSchedule || false)) {
      toast.error("La planification est une fonctionnalité Premium.");
      return false;
    }
    if (!hasEnoughCredits(currentCost)) {
      toast.error("Crédits insuffisants.");
      return false;
    }
    return true;
  };

  // ✅ NOUVEAU: useEffect pour gérer les paramètres d'URL
  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const contentId = params.get("content_id");
    const action = params.get("action");

    // Si on vient de la page ContentPage avec l'action planify
    if (tab === "schedule" && contentId && action === "planify") {
      // Définir l'onglet actif sur schedule
      setActiveTab("schedule");

      // Récupérer les détails du contenu
      const fetchContentDetails = async () => {
        const response = await contentService.getContentById(contentId);
        if (response.success && response.data) {
          const contentData = response.data;

          // Pré-remplir le formulaire avec les données du contenu
          setTopic(contentData.metadata?.topic?.toString() || "");
          setKeywords(contentData.metadata?.keywords?.toString() || "");
          setCallToAction(contentData.metadata?.callToAction || "");

          // Activer la planification
          setSchedulePost(true);

          // Pré-remplir la date et l'heure (par défaut dans 1 heure)
          const now = new Date();
          now.setHours(now.getHours() + 1);
          setScheduledDate(now.toISOString().split("T")[0]);
          setScheduledTime(now.toTimeString().slice(0, 5));

          // Stocker l'ID du contenu pour la planification
          setSchedulingContentId(contentId);

          toast.success("Contenu prêt à être planifié !");
        } else {
          toast.error("Erreur lors du chargement du contenu");
        }
      };

      fetchContentDetails();
    } else if (tab) {
      // Si on a juste un paramètre tab, définir l'onglet actif
      setActiveTab(tab);
    }
  }, [location.search]);

  // ✅ MODIFIÉ: Fonction handleSubmit principale
  const handleSubmit = async () => {
    if (isSubmitting.current || loading) return;
    setError(null);
    if (!validateForm()) return;

    // Vérifier si on est en mode planification depuis ContentPage
    const params = new URLSearchParams(location.search);
    const action = params.get("action");

    if (action === "planify" && schedulingContentId) {
      // Mode planification directe vers le calendrier
      await handleDirectSchedule();
    } else {
      // Mode normal (génération + planification)
      await handleNormalSubmit();
    }
  };

  // ✅ NOUVEAU: Fonction pour la planification directe
  const handleDirectSchedule = async () => {
    if (!authUser) {
      toast.error("Vous devez être connecté.");
      return;
    }
    if (!scheduledDate || !scheduledTime) {
      toast.error("Veuillez sélectionner une date et une heure.");
      return;
    }

    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (scheduledDateTime <= new Date()) {
      toast.error("La date doit être dans le futur.");
      return;
    }

    isScheduling.current = true;
    setSchedulingLoading(true);

    // FIXMEL it doesn't exist
    // try {
    //   // Créer directement une entrée dans scheduled_tasks
    //   const response = await scheduleService.createUserTask({
    //     user_id: authUser.id,
    //     module_id: module?.id,
    //     generated_content_id: schedulingContentId,
    //     execution_time: scheduledDateTime.toISOString(),
    //     status: "scheduled",
    //     payload: {
    //       networks: selectedNetworks,
    //       postType,
    //       contentStyle,
    //       objective,
    //       topic: topic.trim(),
    //       keywords: keywords.trim(),
    //       callToAction: callToAction.trim(),
    //       includeHashtags,
    //       includeEmojis,
    //       autoGenerateHashtags,
    //       mentions: mentions.trim(),
    //       addCTA,
    //       ctaType: addCTA ? ctaType : "",
    //       ctaUrl: addCTA ? ctaUrl.trim() : "",
    //       media: {
    //         imageCount: uploadedImages.length,
    //         hasVideo: !!uploadedVideo,
    //       },
    //     },
    //   });

    //   if (response) {
    //     toast.success("Contenu planifié avec succès !", {
    //       description: `Publication prévue le ${scheduledDateTime.toLocaleString()}`,
    //     });

    //     // Rediriger vers le calendrier
    //     navigate("/calendar");

    //     // Réinitialiser le formulaire
    //     setTopic("");
    //     setKeywords("");
    //     setCallToAction("");
    //     setSchedulePost(false);
    //     setScheduledDate("");
    //     setScheduledTime("");
    //     setSchedulingContentId(null);
    //   } else {
    //     throw new Error("Erreur de planification");
    //   }
    // } catch (error) {
    //   const message =
    //     error instanceof Error ? error.message : "Une erreur est survenue.";
    //   setError(message);
    //   toast.error(`Échec: ${message}`);
    // } finally {
    //   setSchedulingLoading(false);
    //   isScheduling.current = false;
    // }
  };

  // ✅ NOUVEAU: Fonction pour la soumission normale
  const handleNormalSubmit = async () => {
    if (isSubmitting.current || loading) return;
    setError(null);
    if (!validateForm()) return;

    isSubmitting.current = true;
    setLoading(true);
    setResult(null);
    setCurrentStep("Lancement du processus...");
    setProgress(50);

    const moduleId = module?.slug || "social-factory";
    const apiPayload = {
      input: {
        networks: selectedNetworks,
        postType,
        contentStyle,
        objective,
        topic: topic.trim(),
        keywords: keywords.trim(),
        callToAction: callToAction.trim(),
        includeHashtags,
        includeEmojis,
        autoGenerateHashtags,
        mentions: mentions.trim(),
        addCTA,
        ctaType: addCTA ? ctaType : "",
        ctaUrl: addCTA ? ctaUrl.trim() : "",
        schedulePost,
        scheduledDate,
        scheduledTime,
        media: { imageCount: uploadedImages.length, hasVideo: !!uploadedVideo },
        options: {
          ragDocuments: ragDocuments.map((doc) => ({
            name: doc.name,
            path: doc.path,
            type: doc.type,
          })),
        },
      },
    };

    try {
      setCurrentStep("Communication avec le générateur...");
      const response = await modulesService.executeModule(moduleId, apiPayload);
      if (response && response.success) {
        setProgress(100);
        setCurrentStep("Processus terminé !");
        toast.success("Génération lancée !", {
          description: "Votre contenu sera bientôt prêt.",
        });
        setResult(response.data);
      } else {
        throw new Error(response.error || "Une erreur est survenue.");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Une erreur est survenue.";
      setError(message);
      toast.error(`Échec: ${message}`);
    } finally {
      setLoading(false);
      setProgress(0);
      setCurrentStep("");
      isSubmitting.current = false;
    }
  };

  const getIconForType = (key: string): LucideIcon => {
    const ICONS: Record<string, LucideIcon> = {
      instagram: Instagram,
      facebook: Facebook,
      linkedin: Linkedin,
      twitter: Twitter,
      youtube: Youtube,
      users: Users,
      messageSquare: MessageSquare,
      image: ImageIcon,
      copy: Copy,
      video: Video,
      camera: Camera,
      target: Target,
      heart: Heart,
      palette: Palette,
      trendingUp: TrendingUp,
      barChart3: BarChart3,
      globe: Globe,
      eye: Eye,
    };
    return ICONS[key] || Sparkles;
  };

  // ✅ NOUVEAU: Fonctions pour l'onglet Templates (adaptées de LinkedIn)
  const connectToPlatform = async (platform: string) => {
    setAuthLoading(true);
    setTemplatePlatform(platform);

    try {
      // Simuler une connexion OAuth
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simuler la récupération des templates (adapté pour SocialFactory)
      const mockTemplates: Template[] = [
        {
          id: `${platform}-template-1`,
          name: `Design ${platform.charAt(0).toUpperCase() + platform.slice(1)} #1`,
          description: "Template moderne et épuré pour réseaux sociaux",
          thumbnail: `https://via.placeholder.com/150x100/8B5CF6/FFFFFF?text=${platform}+1`,
          platform: platform,
          topic: `Exemple de sujet inspiré de ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          keywords: `design,${platform},créativité`,
          callToAction: "Découvrez plus !",
          postType: "image",
          objective: "engagement",
          contentStyle: "creative",
          includeHashtags: true,
          autoGenerateHashtags: true,
          includeEmojis: true,
        },
        {
          id: `${platform}-template-2`,
          name: `Design ${platform.charAt(0).toUpperCase() + platform.slice(1)} #2`,
          description: "Template professionnel pour posts corporate",
          thumbnail: `https://via.placeholder.com/150x100/3B82F6/FFFFFF?text=${platform}+2`,
          platform: platform,
          topic: `Template corporate de ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
          keywords: `corporate,${platform},professionnel`,
          callToAction: "En savoir plus",
          postType: "text",
          objective: "branding",
          contentStyle: "professional",
          includeHashtags: true,
          autoGenerateHashtags: true,
          includeEmojis: false,
          addCTA: true,
          ctaType: "learn_more",
          ctaUrl: "https://example.com",
        },
      ];

      setPlatformTemplates(mockTemplates);
      setPlatformConnected(true);
      toast.success(
        `Connecté à ${platform.charAt(0).toUpperCase() + platform.slice(1)} avec succès !`
      );
    } catch (error) {
      console.error("Erreur de connexion:", error);
      toast.error(`Erreur lors de la connexion à ${platform}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const disconnectPlatform = () => {
    setPlatformConnected(false);
    setTemplatePlatform("");
    setPlatformTemplates([]);
    toast.success("Déconnecté de la plateforme");
  };

  const refreshTemplates = async () => {
    setTemplateLoading(true);
    // Simuler le rafraîchissement
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("Templates rafraîchis");
    setTemplateLoading(false);
  };

  // GESTION DES TEMPLATES (adapté pour SocialFactory)
  const applyTemplate = (template: Template) => {
    setTemplateLoading(true);

    setTimeout(() => {
      setTopic(template.topic || "");
      setKeywords(template.keywords || "");
      setCallToAction(template.callToAction || "");
      setPostType(template.postType || "text");
      setObjective(template.objective || "engagement");
      setContentStyle(template.contentStyle || "professional");
      setIncludeHashtags(
        template.includeHashtags !== undefined ? template.includeHashtags : true
      );
      setAutoGenerateHashtags(
        template.autoGenerateHashtags !== undefined
          ? template.autoGenerateHashtags
          : true
      );
      setIncludeEmojis(
        template.includeEmojis !== undefined ? template.includeEmojis : true
      );
      setAddCTA(template.addCTA || false);
      setCtaType(template.ctaType || "learn_more");
      setCtaUrl(template.ctaUrl || "");

      setActiveTab("content");
      toast.success(`Template "${template.name}" appliqué avec succès !`);
      setTemplateLoading(false);
    }, 500);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "figma":
        return <Figma className="h-5 w-5" />;
      case "adobe":
        return <ImageIcon2 className="h-5 w-5" />; // Utiliser ImageIcon2 pour Adobe XD
      default:
        return <Cloud className="h-5 w-5" />;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Share2 className="h-6 w-6 text-blue-500" />
            <CardTitle>Social Media Factory</CardTitle>
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
          Créez du contenu viral pour tous vos réseaux sociaux en quelques
          clics.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full ${permissions.data?.isFree || false ? "grid-cols-5" : "grid-cols-4"}`}
          >
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="schedule">Planification</TabsTrigger>
            {(permissions.data?.isFree || false) && (
              <TabsTrigger value="premium">Premium</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-3">
              <Label>Réseaux Sociaux</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(networksFromAPI).map(([key, network]) => {
                  const IconComponent = getIconForType(network.iconKey);
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedNetworks.includes(key)
                          ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/20 dark:border-blue-400 dark:bg-blue-900/20 dark:ring-blue-400/30"
                          : "border-border hover:border-blue-500/50"
                      }`}
                      onClick={() => handleNetworkToggle(key)}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4" />
                        <span>{network.label}</span>
                      </div>
                      <Badge variant="outline" className="text-xs mt-2">
                        {network.cost} crédits
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Type de Publication</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(postTypesFromAPI).map(([key, type]) => {
                  const IconComponent = getIconForType(type.iconKey);
                  return (
                    <div
                      key={key}
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        postType === key
                          ? "border-purple-500 bg-purple-50 ring-2 ring-purple-500/20 dark:border-purple-400 dark:bg-purple-900/20 dark:ring-purple-400/30"
                          : "border-border hover:border-purple-500/50"
                      }`}
                      onClick={() => handlePostTypeChange(key)}
                    >
                      <div className="flex items-center space-x-2">
                        <IconComponent className="h-4 w-4 text-purple-600" />
                        <span>{type.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Style de Contenu</Label>
                <Select value={contentStyle} onValueChange={setContentStyle}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentStylesFromAPI).map(
                      ([key, style]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <Palette className="h-4 w-4" />
                            <span>{style.label}</span>
                          </div>
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Objectif</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(objectivesFromAPI).map(([key, obj]) => {
                      const Icon = getIconForType(obj.iconKey);
                      return (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center space-x-2">
                            <Icon className="h-4 w-4" />
                            <span>{obj.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Sujet Principal *</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Lancement de notre nouvelle collection de vêtements éco-responsables..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="keywords">Mots-clés</Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="marketing, innovation, startup"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mentions">Mentions</Label>
                <Input
                  id="mentions"
                  value={mentions}
                  onChange={(e) => setMentions(e.target.value)}
                  placeholder="@compte1 @compte2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeHashtags"
                  checked={includeHashtags}
                  onCheckedChange={(checked) =>
                    setIncludeHashtags(checked === true)
                  }
                />
                <Label htmlFor="includeHashtags">Inclure des hashtags</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoGenerateHashtags"
                  checked={autoGenerateHashtags}
                  onCheckedChange={(checked) =>
                    setAutoGenerateHashtags(checked === true)
                  }
                />
                <Label htmlFor="autoGenerateHashtags">
                  Génération automatique de hashtags
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="includeEmojis"
                checked={includeEmojis}
                onCheckedChange={(checked) =>
                  setIncludeEmojis(checked === true)
                }
              />
              <Label htmlFor="includeEmojis">Inclure des émojis</Label>
            </div>

            {/* ✅ Déplacé depuis l'onglet targeting */}
            <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="addCTA"
                  checked={addCTA}
                  onCheckedChange={(checked) => setAddCTA(checked === true)}
                />
                <Label htmlFor="addCTA">Ajouter un Call-to-Action</Label>
              </div>

              {addCTA && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type de CTA</Label>
                      <Select value={ctaType} onValueChange={setCtaType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ctaTypesFromAPI.map((cta) => (
                            <SelectItem key={cta.value} value={cta.value}>
                              <div className="flex items-center space-x-2">
                                <ExternalLink className="h-4 w-4" />
                                <span>{cta.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>URL du CTA</Label>
                      <Input
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="https://votre-lien.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="callToAction">
                      Message du Call-to-Action
                    </Label>
                    <Input
                      id="callToAction"
                      value={callToAction}
                      onChange={(e) => setCallToAction(e.target.value)}
                      placeholder="Découvrez notre nouvelle collection !"
                    />
                  </div>
                </div>
              )}

              {!permissions.data?.isPremium && (
                <div className="flex items-center space-x-2 p-2 bg-amber-50 rounded-md border border-amber-200">
                  <Crown className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-amber-700">
                    Premium : Ciblage avancé + Analytics par réseau
                  </span>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <PremiumMediaFeature
              fallback={
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4 opacity-70">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        Images (max {permissions.data?.media?.maxImages || 0})
                      </Label>
                      <Button variant="outline" size="sm" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter Image(s)
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">
                        Vidéo (max {permissions.data?.media?.maxVideoSize || 0}
                        MB)
                      </Label>
                      <Button variant="outline" size="sm" disabled>
                        <Upload className="h-4 w-4 mr-2" />
                        Ajouter Vidéo
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    ⚡ Passez à Premium pour uploader des médias et générer des
                    visuels par IA.
                  </p>
                </div>
              }
            >
              <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Images (max {maxImagesAllowed || 0})</Label>
                      <Badge
                        variant="secondary"
                        className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                      >
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={
                        loading || uploadedImages.length >= maxImagesAllowed
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter Image(s)
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Vidéo (max {permissions.data?.media?.maxVideoSize || 0}MB)
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => videoInputRef.current?.click()}
                      disabled={loading || !!uploadedVideo}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Ajouter Vidéo
                    </Button>
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t">
                  <Label className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>Génération d'images par IA</span>
                  </Label>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-800"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer avec l'IA
                  </Button>
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
              </div>
            </PremiumMediaFeature>

            {(uploadedImages.length > 0 || uploadedVideo) && (
              <div className="mt-4 space-y-2">
                <Label>Fichiers ajoutés</Label>
                {uploadedImages.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-background rounded-md border text-sm"
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <ImageIcon className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {uploadedVideo && (
                  <div className="flex items-center justify-between p-2 bg-background rounded-md border text-sm">
                    <div className="flex items-center space-x-2 truncate">
                      <Video className="h-5 w-5 flex-shrink-0" />
                      <span className="truncate">{uploadedVideo.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={removeVideo}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ✅ NOUVEL ONGLET TEMPLATES (Remplace targeting, adapté de LinkedIn) */}
          <TabsContent value="templates" className="space-y-6">
            {permissions.data?.isPremium ? (
              <div className="space-y-6">
                {/* Sélection de la plateforme */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">
                    Importer vos templates
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Connectez-vous à votre plateforme de design pour importer
                    vos templates personnalisés pour les réseaux sociaux
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                      onClick={() => connectToPlatform("figma")}
                      disabled={authLoading || platformConnected}
                    >
                      <Figma className="h-6 w-6" />
                      <span>Figma</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                      onClick={() => connectToPlatform("adobe")}
                      disabled={authLoading || platformConnected}
                    >
                      <ImageIcon2 className="h-6 w-6" />
                      <span>Adobe XD</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-20 flex-col space-y-2"
                      onClick={() => connectToPlatform("canva")}
                      disabled={authLoading || platformConnected}
                    >
                      <ImageIcon2 className="h-6 w-6" />
                      <span>Canva</span>
                    </Button>
                  </div>
                </div>

                {/* État de connexion */}
                {platformConnected && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getPlatformIcon(templatePlatform)}
                        <span className="font-medium text-green-800">
                          Connecté à{" "}
                          {templatePlatform.charAt(0).toUpperCase() +
                            templatePlatform.slice(1)}
                        </span>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <Unlock className="h-3 w-3 mr-1" />
                        Connecté
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshTemplates}
                        disabled={templateLoading}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        {templateLoading ? "Rafraîchissement..." : "Rafraîchir"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={disconnectPlatform}
                      >
                        <Lock className="h-4 w-4 mr-1" />
                        Déconnecter
                      </Button>
                    </div>
                  </div>
                )}

                {/* Templates de la plateforme */}
                {platformConnected && platformTemplates.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">
                        Vos templates{" "}
                        {templatePlatform.charAt(0).toUpperCase() +
                          templatePlatform.slice(1)}
                      </h4>
                      <Badge variant="outline">
                        {platformTemplates.length} templates
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {platformTemplates.map((template) => (
                        <div
                          key={template.id}
                          className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative">
                            <img
                              src={template.thumbnail}
                              alt={template.name}
                              className="w-full h-32 object-cover"
                            />
                            <Badge className="absolute top-2 right-2 bg-purple-600">
                              {template.platform}
                            </Badge>
                          </div>
                          <div className="p-4 space-y-3">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {template.description}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-1">
                              <Badge variant="outline" className="text-xs">
                                {template.postType}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {template.objective}
                              </Badge>
                            </div>

                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => applyTemplate(template)}
                              disabled={templateLoading}
                            >
                              {templateLoading ? (
                                <LoadingSpinner size="sm" />
                              ) : (
                                <>
                                  <LayoutTemplate className="h-4 w-4 mr-1" />
                                  Appliquer ce template
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <p className="font-medium">💡 Conseil Pro :</p>
                    <p className="text-sm">
                      Connectez-vous à votre plateforme de design préférée pour
                      importer vos templates personnalisés. Une fois appliqué,
                      vous pourrez personnaliser le contenu selon vos besoins.
                    </p>
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="text-center p-8 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 opacity-70">
                <div className="relative">
                  <LayoutTemplate className="h-16 w-16 mx-auto mb-4 text-purple-500" />
                  <Crown className="h-6 w-6 absolute -top-1 -right-1 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-2">
                  Templates Externes Premium
                </h3>
                <p className="text-purple-700 mb-6 max-w-md mx-auto">
                  Connectez-vous à Figma, Adobe XD ou Canva pour importer vos
                  templates personnalisés. (Fonctionnalité Premium)
                </p>
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                  disabled
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Fonctionnalité Premium
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <PremiumSchedulingFeature
              fallback={
                <div className="p-4 bg-muted/30 rounded-lg border space-y-4 opacity-70">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedulePostDisabled"
                      checked={false}
                      disabled
                    />
                    <Label
                      htmlFor="schedulePostDisabled"
                      className="text-muted-foreground"
                    >
                      Programmer les publications
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    ⚡ La planification est réservée aux abonnés Premium.
                  </p>
                  <Button
                    onClick={handleNavigateToBilling}
                    variant="outline"
                    size="sm"
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    Passer à Premium
                  </Button>
                </div>
              }
            >
              <div className="p-4 bg-muted/30 rounded-lg border space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="schedulePost"
                      checked={schedulePost}
                      onCheckedChange={(checked) =>
                        setSchedulePost(checked === true)
                      }
                    />
                    <Label htmlFor="schedulePost">
                      Programmer les publications
                    </Label>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-amber-100 to-amber-200 text-amber-700 text-xs"
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
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

                    {scheduledDate && scheduledTime && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            Publication prévue le{" "}
                            {new Date(
                              `${scheduledDate}T${scheduledTime}`
                            ).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 pt-2 border-t">
                      <Label className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                        <span>Timing optimal automatique</span>
                      </Label>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200 text-amber-800"
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Programmer au meilleur moment
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </PremiumSchedulingFeature>

            {/* ✅ NOUVEAU: Bouton pour accéder au calendrier */}
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => navigate("/calendar")}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Voir le calendrier
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  schedulingLoading ||
                  selectedNetworks.length === 0 ||
                  !topic.trim() ||
                  !hasEnoughCredits(currentCost)
                }
                className="flex items-center gap-2"
              >
                {loading || schedulingLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Calendar className="h-4 w-4" />
                    Planifier dans le calendrier
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {permissions.data?.isFree && (
            <TabsContent value="premium" className="space-y-4">
              <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
                <div className="relative">
                  <Share2 className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                  <Crown className="h-6 w-6 absolute top-0 right-0 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  Passez à Social Factory Premium
                </h3>
                <p className="text-blue-700 mb-6 max-w-md mx-auto">
                  Débloquez les médias avancés, la planification et les
                  analytics pour tous vos réseaux.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6 text-left max-w-lg mx-auto">
                  {(premiumFeaturesFromAPI || [])
                    .slice(0, 6)
                    .map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-xs text-blue-700"
                      >
                        <CheckCircle className="h-3 w-3 text-blue-600" />
                        <span>{feature}</span>
                      </div>
                    ))}
                </div>
                <Button
                  onClick={handleNavigateToBilling}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Découvrir Premium
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong>Réseaux:</strong> {selectedNetworks.length}
              </div>
              <div>
                <strong>Style:</strong> {currentContentStyle.label}
              </div>
              <div>
                <strong>Objectif:</strong> {currentObjective.label}
              </div>
              <div>
                <strong>Coût:</strong> {currentCost} crédits
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {(loading || schedulingLoading) && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Clock className="h-4 w-4" />
              <span>
                {loading && (currentStep || "Génération...")}
                {schedulingLoading && "Planification en cours..."}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              schedulingLoading ||
              selectedNetworks.length === 0 ||
              !topic.trim() ||
              !hasEnoughCredits(currentCost)
            }
            className="flex-1"
            size="lg"
          >
            {loading ? (
              <LoadingSpinner />
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Générer Maintenant ({currentCost} crédits)</span>
              </div>
            )}
          </Button>

          {permissions.data?.scheduling?.canSchedule || false ? (
            <Button
              onClick={handleSubmit}
              disabled={
                loading ||
                schedulingLoading ||
                selectedNetworks.length === 0 ||
                !topic.trim() ||
                !hasEnoughCredits(currentCost) ||
                !schedulePost ||
                !scheduledDate ||
                !scheduledTime
              }
              variant="outline"
              className="flex-1"
              size="lg"
            >
              {schedulingLoading ? (
                <LoadingSpinner />
              ) : (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Planifier ({currentCost} crédits)</span>
                </div>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNavigateToBilling}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <div className="flex items-center space-x-2">
                <Crown className="h-4 w-4" />
                <span>Planifier (Premium)</span>
              </div>
            </Button>
          )}
        </div>

        {result && (
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Label>Contenu généré avec succès</Label>
              </div>
            </div>
            <Button variant="outline" onClick={() => setResult(null)} size="sm">
              Fermer
            </Button>
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
                {currentBalance || 0}.
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
      </CardContent>
    </Card>
  );
}
