import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/hooks/use-auth";
import { WithHeader } from "@/app/(sidebar)/_components/with-header";
import { GeneralTab } from "./components/general-tab";
import { SecurityTab } from "./components/security-tab";
import { NotificationsTab } from "./components/notifications-tab";
import { SocialTab } from "./components/social-tab";
import { DataTab } from "./components/data-tab";
import type { GeneralForm } from "./profile-types";
import { User, Shield, Bell, Share2, Download } from "lucide-react";
import { H2, P } from "@oppsys/ui/components/typography";
import { Card, CardContent } from "@oppsys/ui/components/card";

const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("general");

  const [generalForm, setGeneralForm] = useState<GeneralForm>({
    fullName: "",
    language: "fr",
    timezone: "Europe/Paris",
  });

  const tabs = [
    { id: "general", label: "Général", icon: User },
    { id: "security", label: "Sécurité", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "social", label: "Réseaux Sociaux", icon: Share2 },
    { id: "data", label: "Données", icon: Download },
  ];

  useEffect(() => {
    if (user) {
      setGeneralForm({
        fullName: user.fullName || "",
        language: (user.language as "fr" | "en" | "es" | "de") || "fr",
        timezone: user.timezone || "Europe/Paris",
      });
    }
  }, [user]);

  return (
    <WithHeader title="Paramètres">
      <div className="space-y-6">
        <div>
          <H2 className="md:text-3xl text-foreground">Mon Profil</H2>
          <P className="text-muted-foreground mt-2">
            Gérez vos informations personnelles et préférences
          </P>
        </div>

        {/* tabs */}
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 border-b-2 px-1 py-2 text-sm font-medium cursor-pointer ${
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

        {/* Contenu des tabs */}
        <Card>
          <CardContent>
            {activeTab === "general" && (
              <GeneralTab initialData={generalForm} />
            )}
            {activeTab === "security" && <SecurityTab />}
            {activeTab === "notifications" && <NotificationsTab />}
            {activeTab === "social" && <SocialTab />}
            {activeTab === "data" && <DataTab />}
          </CardContent>
        </Card>
      </div>
    </WithHeader>
  );
};

export default ProfilePage;
