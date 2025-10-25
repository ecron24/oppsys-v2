import { useAuth } from "@/components/auth/hooks/use-auth";
import { useAuthOperations } from "@/components/auth/hooks/use-auth-operations";
import { LinkButton } from "@/components/link-button";
import { ThemeSwitcher } from "@/components/themes/theme-switcher";
import { routes } from "@/routes";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SidebarTrigger,
} from "@oppsys/ui";
import {
  Bell,
  User,
  LogOut,
  Settings,
  CreditCard,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router";

export function Header({ title, breadcrumbs }: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuthOperations();
  const { user } = useAuth();
  const notifications = [
    {
      id: 1,
      title: "Bienvenue sur OppsYs",
      message: "Découvrez nos modules IA",
      is_read: false,
      created_at: new Date().toISOString(),
      type: "success",
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut.mutateAsync();
      navigate("/login");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  const creditPercentage = user
    ? Math.round(
        ((user?.creditBalance || 0) / (user.plans?.monthlyCredits || 300)) * 100
      )
    : 0;

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return (
    <>
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />

            <div className="flex items-center space-x-3">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-primary-blue bg-clip-text text-transparent">
                {title}
              </h1>

              {breadcrumbs && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={idx} className="flex items-center">
                      {idx > 0 && <span className="mx-1">/</span>}
                      <span className="capitalize">{crumb}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeSwitcher />

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    title="Notifications"
                    className="relative"
                  >
                    <Bell />
                    {unreadNotifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-medium shadow-sm">
                        {unreadNotifications.length > 9
                          ? "9+"
                          : unreadNotifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-80 rounded-xl shadow-xl mr-2"
                >
                  <div>
                    <div className="px-4 py-3 border-b border-border">
                      <h3 className="font-semibold text-popover-foreground">
                        Notifications
                      </h3>
                      {unreadNotifications.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {unreadNotifications.length} non lue
                          {unreadNotifications.length > 1 ? "s" : ""}
                        </p>
                      )}
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {unreadNotifications.length > 0 ? (
                        unreadNotifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className="px-4 py-3 hover:bg-muted/50 border-b border-border/50 last:border-0"
                          >
                            <div className="flex items-start space-x-3">
                              <div
                                className={`p-1.5 rounded-full ${
                                  notification.type === "warning"
                                    ? "bg-yellow-100 dark:bg-yellow-900/20"
                                    : notification.type === "error"
                                      ? "bg-red-100 dark:bg-red-900/20"
                                      : notification.type === "success"
                                        ? "bg-green-100 dark:bg-green-900/20"
                                        : "bg-primary/10"
                                }`}
                              >
                                <AlertCircle
                                  className={`h-3 w-3 ${
                                    notification.type === "warning"
                                      ? "text-primary"
                                      : notification.type === "error"
                                        ? "text-destructive"
                                        : notification.type === "success"
                                          ? "text-green-600"
                                          : "text-primary"
                                  }`}
                                />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-popover-foreground">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(
                                    notification.created_at
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                          <p className="text-sm text-muted-foreground">
                            Aucune notification
                          </p>
                        </div>
                      )}
                    </div>

                    {unreadNotifications.length > 0 && (
                      <div className="px-4 py-2 border-t border-border">
                        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
                          Voir toutes les notifications
                        </button>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"muted"}
                    title="Menu utilisateur"
                    className="h-auto"
                  >
                    <div className="size-8 bg-gradient-primary-blue rounded-lg flex items-center justify-center shadow-sm">
                      <User className="text-white" />
                    </div>
                    <ChevronDown className="text-muted-foreground hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-64 rounded-xl shadow-xl mr-2"
                >
                  <div className="">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-popover-foreground truncate">
                        {user?.fullName || "Utilisateur"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {user?.email}
                      </p>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Crédits restants
                          </span>
                          <span
                            className={`font-medium ${creditPercentage < 20 ? "text-destructive" : "text-foreground"}`}
                          >
                            {user?.creditBalance || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            Plan actuel
                          </span>
                          <span className="font-medium text-primary">
                            {user?.plans?.name || "Free"}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                creditPercentage < 20
                                  ? "bg-destructive"
                                  : creditPercentage < 50
                                    ? "bg-primary"
                                    : "bg-primary"
                              }`}
                              style={{
                                width: `${Math.min(creditPercentage, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {creditPercentage}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      <LinkButton
                        to={routes.profile.index()}
                        variant={"ghost"}
                        className="w-full justify-start"
                      >
                        <Settings />
                        <span>Paramètres</span>
                      </LinkButton>

                      <LinkButton
                        to={routes.billing.index()}
                        variant={"ghost"}
                        className="w-full justify-start"
                      >
                        <CreditCard className="size-4" />
                        <span>Facturation</span>
                      </LinkButton>
                    </div>
                    <div className="border-t border-border py-1">
                      <Button
                        onClick={handleLogout}
                        variant={"destructive-outline"}
                        className="w-full justify-start"
                      >
                        <LogOut />
                        <span>Déconnexion</span>
                      </Button>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {creditPercentage < 5 && (
        <div className="bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="size-4 text-destructive" />
              <p className="text-sm text-red-700 dark:text-red-300">
                <span className="font-medium">Attention</span> Vos crédits sont
                presque épuisés
              </p>
            </div>
            <LinkButton to={routes.billing.index()} variant={"destructive"}>
              Recharger
            </LinkButton>
          </div>
        </div>
      )}
    </>
  );
}
type HeaderProps = {
  title: string;
  breadcrumbs?: string[];
};
