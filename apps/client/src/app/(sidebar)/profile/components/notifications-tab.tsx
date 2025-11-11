import { useAuth } from "@/components/auth/hooks/use-auth";
import { CommunicationPrefs } from "./communication-prefs";
import { H3 } from "@oppsys/ui";

export const NotificationsTab = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <H3 className="mb-4 text-lg font-medium text-card-foreground">
        Préférences de notification
      </H3>

      <CommunicationPrefs clientId={user?.id} />
    </div>
  );
};
