// src/pages/ProfilePage.jsx - VERSION COMPLÈTE CORRIGÉE
import { useState, useEffect } from "react";
import { toast } from "@oppsys/ui";
import { supabase } from "@/lib/supabase";
import LoadingSpinner from "@/components/loading";
import DeleteAccountModal from "./account/DeleteAccountModal";
import TwoFactorAuthSetup from "./TwoFactorAuthSetup";
import CommunicationPrefs from "./CommunicationPrefs";
import { SocialAuthButtons } from "./social/SocialAuthButton";
import { socialService } from "./socialService";
import {
  User,
  Mail,
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Share2,
  Download,
  RefreshCw,
} from "lucide-react";

const ProfilePage = () => {
  const { user } = useAuth();
  const { updatePassword } = useAuthOperations();

  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ✅ États pour les connexions sociales
  const [socialConnections, setSocialConnections] = useState([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialStats, setSocialStats] = useState(null);

  // États du formulaire général
  const [generalForm, setGeneralForm] = useState({
    full_name: "",
    language: "fr",
    timezone: "Europe/Paris",
  });

  // États du formulaire de sécurité
  const [securityForm, setSecurityForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // États des notifications
  const [notificationSettings, setNotificationSettings] = useState({
    new_features: true,
    quota_alerts: true,
    billing_notifications: true,
  });

  // ✅ Configuration des onglets avec l'onglet social
  const tabs = [
    { id: "general", label: "Général", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "social", label: "Réseaux Sociaux", icon: Share2 },
    { id: "data", label: "Données", icon: Download },
  ];

  // ✅ Fonctions pour les connexions sociales
  const loadSocialConnections = async () => {
    setSocialLoading(true);
    try {
      const [connections, stats] = await Promise.all([
        socialService.getConnections(),
        socialService.getStats(),
      ]);
      setSocialConnections(connections);
      setSocialStats(stats);
    } catch (error) {
      console.error("Error loading social connections:", error);
      toast.error("Erreur lors du chargement des connexions sociales");
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSocialConnect = async (platform) => {
    try {
      const authUrl = await socialService.initAuth(platform);

      // Ouvrir popup OAuth
      const popup = window.open(
        authUrl,
        "social-auth",
        "width=600,height=600,scrollbars=yes,resizable=yes"
      );

      // Écouter le résultat
      const messageHandler = (event) => {
        if (event.origin !== window.location.origin) return;

        if (event.data.type === "SOCIAL_AUTH_SUCCESS") {
          popup.close();
          toast.success(`${platform} connecté avec succès !`);
          loadSocialConnections();
          window.removeEventListener("message", messageHandler);
        } else if (event.data.type === "SOCIAL_AUTH_ERROR") {
          popup.close();
          toast.error(`Erreur de connexion à ${platform}`);
          window.removeEventListener("message", messageHandler);
        }
      };

      window.addEventListener("message", messageHandler);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          window.removeEventListener("message", messageHandler);
          clearInterval(checkClosed);
        }
      }, 1000);
    } catch (err) {
      toast.error(`Impossible de connecter ${platform}`);
    }
  };

  const handleSocialDisconnect = async (platform) => {
    try {
      await socialService.disconnect(platform);
      toast.success(`${platform} déconnecté`);
      loadSocialConnections();
    } catch (err) {
      toast.error(`Erreur lors de la déconnexion`);
    }
  };

  const handleSocialRefresh = async (platform) => {
    try {
      await socialService.refreshToken(platform);
      toast.success(`Token ${platform} actualisé`);
      loadSocialConnections();
    } catch (err) {
      toast.error(`Erreur lors de l'actualisation`);
    }
  };

  // ✅ useEffect corrigé
  useEffect(() => {
    if (user) {
      setGeneralForm({
        full_name: user.full_name || "",
        language: user.language || "fr",
        timezone: user.timezone || "Europe/Paris",
      });

      if (user.notification_settings) {
        setNotificationSettings({
          new_features: user.notification_settings.new_features ?? true,
          quota_alerts: user.notification_settings.quota_alerts ?? true,
          billing_notifications:
            user.notification_settings.billing_notifications ?? true,
        });
      }

      // Charger les connexions sociales quand on va sur l'onglet social
      if (activeTab === "social") {
        loadSocialConnections();
      }
    }
  }, [user, activeTab]);

  // ✅ Écouter l'événement de navigation vers l'onglet social depuis la sidebar
  useEffect(() => {
    const handleNavigateToSocial = () => {
      setActiveTab("social");
    };

    window.addEventListener("navigateToSocialTab", handleNavigateToSocial);
    return () =>
      window.removeEventListener("navigateToSocialTab", handleNavigateToSocial);
  }, []);

  const handleSaveGeneral = async () => {
    setLoading(true);
    try {
      await updateUserProfile(generalForm);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      console.error("Erreur mise à jour profil:", error);
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!securityForm.current_password || !securityForm.new_password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    if (securityForm.new_password !== securityForm.confirm_password) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (securityForm.new_password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setLoading(true);
    try {
      await updatePassword(securityForm.new_password);
      toast.success("Mot de passe mis à jour avec succès");
      setSecurityForm({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await updateUserProfile({ notification_settings: notificationSettings });
      toast.success("Préférences sauvegardées avec succès");
    } catch (error) {
      console.error("Erreur sauvegarde notifications:", error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (userError) throw userError;

      const exportData = {
        profile: userData,
        exported_at: new Date().toISOString(),
        export_version: "1.0",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `profile_export_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
      toast.success("Données exportées avec succès");
    } catch (error) {
      console.error("Erreur export données:", error);
      toast.error("Erreur lors de l'export des données");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        clientId={user?.id}
      />

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mon Profil</h1>
        <p className="mt-1 text-muted-foreground">
          Gérez vos informations personnelles et préférences
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-border">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenu des onglets */}
      <div className="card p-6">
        {/* Onglet Général */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-card-foreground">
                Informations personnelles
              </h3>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    value={generalForm.full_name || ""}
                    onChange={(e) =>
                      setGeneralForm({
                        ...generalForm,
                        full_name: e.target.value,
                      })
                    }
                    className="form-input"
                    placeholder="Votre nom complet"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="form-input cursor-not-allowed bg-muted text-muted-foreground"
                    />
                    <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    L'email ne peut pas être modifié
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Langue
                  </label>
                  <select
                    value={generalForm.language}
                    onChange={(e) =>
                      setGeneralForm({
                        ...generalForm,
                        language: e.target.value,
                      })
                    }
                    className="form-input"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Fuseau horaire
                  </label>
                  <select
                    value={generalForm.timezone}
                    onChange={(e) =>
                      setGeneralForm({
                        ...generalForm,
                        timezone: e.target.value,
                      })
                    }
                    className="form-input"
                  >
                    <option value="Europe/Paris">Paris (UTC+1)</option>
                    <option value="Europe/London">Londres (UTC+0)</option>
                    <option value="America/New_York">New York (UTC-5)</option>
                    <option value="America/Los_Angeles">
                      Los Angeles (UTC-8)
                    </option>
                    <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleSaveGeneral}
                  disabled={loading}
                  className="button-primary flex items-center space-x-2 px-6 py-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Sauvegarder</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Sécurité */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-card-foreground">
                Changer le mot de passe
              </h3>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={securityForm.current_password}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          current_password: e.target.value,
                        })
                      }
                      className="form-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          current: !showPasswords.current,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={securityForm.new_password}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          new_password: e.target.value,
                        })
                      }
                      className="form-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-card-foreground">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={securityForm.confirm_password}
                      onChange={(e) =>
                        setSecurityForm({
                          ...securityForm,
                          confirm_password: e.target.value,
                        })
                      }
                      className="form-input pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={loading}
                  className="button-primary flex items-center space-x-2 px-6 py-2"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  <span>Changer le mot de passe</span>
                </button>
              </div>
            </div>

            {/* Authentification à deux facteurs */}
            <div className="border-t border-border pt-6">
              <h3 className="mb-4 text-lg font-medium text-card-foreground">
                Authentification à deux facteurs
              </h3>
              <TwoFactorAuthSetup userId={user?.id} />
            </div>
          </div>
        )}

        {/* Onglet Notifications */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <h3 className="mb-4 text-lg font-medium text-card-foreground">
              Préférences de notification
            </h3>

            <CommunicationPrefs clientId={user?.id} />
          </div>
        )}

        {/* ✅ ONGLET RÉSEAUX SOCIAUX - VERSION SIMPLIFIÉE */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-card-foreground">
                Connexions Réseaux Sociaux
              </h3>
              <p className="mb-6 text-sm text-muted-foreground">
                Connectez vos comptes sociaux pour publier automatiquement
                depuis vos modules IA.
              </p>

              {/* Statistiques rapides */}
              {socialStats && (
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-lg font-semibold text-green-900">
                          {socialStats.valid}
                        </p>
                        <p className="text-xs text-green-700">Connectés</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center space-x-2">
                      <XCircle className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {socialStats.invalid}
                        </p>
                        <p className="text-xs text-gray-700">Inactifs</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                      <div>
                        <p className="text-lg font-semibold text-orange-900">
                          {socialStats.expiringSoon}
                        </p>
                        <p className="text-xs text-orange-700">
                          Expirent bientôt
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <div className="flex items-center space-x-2">
                      <Share2 className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-lg font-semibold text-blue-900">
                          {socialStats.total}
                        </p>
                        <p className="text-xs text-blue-700">Total</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Connexions rapides */}
              <div className="mb-6 rounded-lg bg-muted/30 p-6">
                <h4 className="mb-3 font-medium">Connexions Rapides</h4>
                <p className="mb-4 text-sm text-muted-foreground">
                  {socialConnections.length > 0
                    ? "Gérez vos connexions existantes ou ajoutez de nouveaux réseaux :"
                    : "Connectez vos réseaux sociaux préférés pour commencer :"}
                </p>
                <SocialAuthButtons
                  platforms={[
                    "facebook",
                    "instagram",
                    "linkedin",
                    "twitter",
                    "youtube",
                    "tiktok",
                  ]}
                  onConnect={handleSocialConnect}
                  variant="branded"
                  columns={3}
                />
              </div>

              {/* Liste des connexions existantes (format compact) */}
              {socialConnections.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Connexions actuelles</h4>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {socialConnections.map((connection) => {
                      const isExpiring =
                        connection?.expires_at &&
                        new Date(connection.expires_at) <
                          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

                      return (
                        <div
                          key={connection.platform}
                          className={`flex items-center justify-between rounded-lg border p-3 ${
                            connection.is_valid
                              ? "border-green-200 bg-green-50"
                              : "border-gray-200 bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                connection.is_valid
                                  ? "bg-green-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <Share2
                                className={`h-4 w-4 ${
                                  connection.is_valid
                                    ? "text-green-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">
                                {connection.platform}
                              </p>
                              <p
                                className={`text-xs ${
                                  connection.is_valid
                                    ? "text-green-700"
                                    : "text-gray-600"
                                }`}
                              >
                                {connection.is_valid
                                  ? "Connecté"
                                  : "Déconnecté"}
                                {connection.platform_username &&
                                  ` • @${connection.platform_username}`}
                              </p>
                              {isExpiring && (
                                <p className="mt-1 flex items-center text-xs text-orange-600">
                                  <AlertCircle className="mr-1 h-3 w-3" />
                                  Expire bientôt
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {connection.is_valid && (
                              <button
                                onClick={() =>
                                  handleSocialRefresh(connection.platform)
                                }
                                disabled={socialLoading}
                                className="rounded p-1 text-blue-600 hover:bg-blue-100"
                                title="Actualiser"
                              >
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() =>
                                connection.is_valid
                                  ? handleSocialDisconnect(connection.platform)
                                  : handleSocialConnect(connection.platform)
                              }
                              disabled={socialLoading}
                              className={`rounded px-3 py-1 text-xs ${
                                connection.is_valid
                                  ? "text-red-600 hover:bg-red-100"
                                  : "text-green-600 hover:bg-green-100"
                              }`}
                            >
                              {connection.is_valid
                                ? "Déconnecter"
                                : "Reconnecter"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Conseils d'utilisation */}
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 font-medium text-blue-900">
                  💡 Comment ça marche ?
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>• Connectez vos comptes sociaux une seule fois</li>
                  <li>
                    • Vos modules IA utilisent automatiquement ces connexions
                  </li>
                  <li>
                    • Les tokens sont sécurisés et actualisés automatiquement
                  </li>
                  <li>• Publiez sur plusieurs plateformes simultanément</li>
                </ul>
              </div>

              {/* Bouton de rechargement */}
              <div className="mt-6">
                <button
                  onClick={loadSocialConnections}
                  disabled={socialLoading}
                  className="button-primary flex items-center space-x-2 px-6 py-2"
                >
                  {socialLoading ? (
                    <LoadingSpinner size="sm" color="white" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  <span>Actualiser les connexions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Onglet Données */}
        {activeTab === "data" && (
          <div className="space-y-6">
            <div>
              <h3 className="mb-4 text-lg font-medium text-card-foreground">
                Gestion des données
              </h3>

              <div className="space-y-6">
                {/* Export des données */}
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">
                        Exporter mes données
                      </h4>
                      <p className="mb-3 mt-1 text-sm text-muted-foreground">
                        Téléchargez une copie de toutes vos données
                      </p>
                      <button
                        onClick={handleExportData}
                        disabled={loading}
                        className="button-primary flex items-center space-x-2 px-4 py-2"
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span>Exporter les données</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suppression du compte */}
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-destructive/10 p-2">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-destructive">
                        Supprimer mon compte
                      </h4>
                      <p className="mb-3 mt-1 text-sm text-destructive/80">
                        Suppression définitive de toutes vos données
                      </p>
                      <button
                        onClick={() => setDeleteModalOpen(true)}
                        disabled={loading}
                        className="flex items-center space-x-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
                      >
                        {loading ? (
                          <LoadingSpinner size="sm" color="white" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                        <span>Supprimer le compte</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
