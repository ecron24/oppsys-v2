"use client";

import {
  CreditCard,
  Crown,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Search,
  SearchIcon,
  Share2,
  Sparkles,
  User,
  X,
  Zap,
} from "lucide-react";
import {
  cn,
  Kbd,
  P,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@oppsys/ui";
import { useAuth } from "./auth/hooks/use-auth";
import { routes } from "@/routes";
import { Link, useLocation } from "react-router";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@oppsys/ui/components/input-group";
import { useState } from "react";
import { LinkButton } from "./link-button";

const navItems = [
  {
    name: "Dashboard",
    short: "Dash",
    href: routes.dashboard.index(),
    icon: LayoutDashboard,
    description: "Vue d'ensemble et statistiques",
    searchTerms: [
      "dashboard",
      "accueil",
      "statistiques",
      "metrics",
      "home",
      "stats",
    ],
  },
  {
    name: "Modules",
    short: "Auto",
    href: routes.modules.index(),
    icon: Sparkles,
    description: "Automatisations IA",
    searchTerms: [
      "modules",
      "automatisations",
      "ia",
      "n8n",
      "workflows",
      "automation",
      "ai",
    ],
  },
  {
    name: "Formation",
    short: "Learn",
    href: routes.modules.index({ tab: "formation" }),
    icon: GraduationCap,
    description: "Apprentissage et tutoriels",
    searchTerms: [
      "formation",
      "apprentissage",
      "tutoriels",
      "cours",
      "learning",
      "education",
      "formation",
      "teach",
    ],
  },
  {
    name: "Contenu",
    short: "Content",
    href: routes.content.index(),
    icon: FileText,
    description: "Contenu généré",
    searchTerms: [
      "contenu",
      "articles",
      "posts",
      "créations",
      "généré",
      "content",
      "generated",
    ],
  },
  {
    name: "Facturation",
    short: "Bill",
    href: routes.billing.index(),
    icon: CreditCard,
    description: "Plans et paiements",
    searchTerms: [
      "facturation",
      "billing",
      "plans",
      "paiements",
      "crédits",
      "payment",
      "credits",
    ],
  },
  {
    name: "Profil",
    short: "Settings",
    href: routes.profile.index(),
    icon: User,
    description: "Paramètres du compte",
    searchTerms: [
      "profil",
      "compte",
      "paramètres",
      "settings",
      "profile",
      "account",
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const { open, setOpen } = useSidebar();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredNavItems =
    searchQuery.trim() === ""
      ? navItems
      : navItems.filter(
          (item) =>
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            item.searchTerms.some((term) =>
              term.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div
          className={cn("flex items-center space-x-2 py-4", {
            "justify-center": !open,
          })}
        >
          <img
            src="/logo.svg"
            alt="Oppsys Logo"
            className="w-8 h-8 rounded-lg shadow-md object-contain"
          />
          {open && (
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Oppsys
            </span>
          )}
        </div>
        <div className="p-2 py-4 border-b border-t border-border">
          {open ? (
            <InputGroup className="bg-muted">
              <InputGroupInput
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                // onKeyDown={handleSearchNavigation}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />

              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              {searchQuery.length > 0 && (
                <InputGroupAddon
                  align={"inline-end"}
                  onClick={() => setSearchQuery("")}
                >
                  <InputGroupButton
                    size="icon-xs"
                    variant={"outline"}
                    title="Effacer"
                  >
                    <X />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
              {!searchFocused && searchQuery.length == 0 && (
                <InputGroupAddon align="inline-end">
                  <Kbd>⌘</Kbd>
                  <Kbd>K</Kbd>
                </InputGroupAddon>
              )}
            </InputGroup>
          ) : (
            <div
              className="bg-muted text-muted-foreground size-9 flex justify-center items-center border rounded-md cursor-pointer"
              onClick={() => setOpen(true)}
            >
              <Search className="size-4" />
            </div>
          )}

          {searchQuery.trim() !== "" && (
            <div className="mt-2 text-xs text-muted-foreground">
              {filteredNavItems.length > 0 ? (
                <span>{filteredNavItems.length} résultat(s)</span>
              ) : (
                <span>Aucun résultat</span>
              )}
            </div>
          )}
        </div>
        <div className="py-2 border-b border-border">
          <div className={cn("grid gap-3", open ? "grid-cols-2" : "")}>
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div
                className={cn("flex items-center space-x-2", {
                  "justify-center": !open,
                })}
              >
                <Zap className="size-4 text-primary" />
                {open && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Crédits</p>
                    <p className="text-sm font-semibold">
                      {user?.creditBalance || 0}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div
                className={cn("flex items-center space-x-2", {
                  "justify-center": !open,
                })}
              >
                {user?.plans?.name === "Premium" ||
                user?.plans?.name === "Standard" ? (
                  <Crown className="size-4 text-primary" />
                ) : (
                  <CreditCard className="size-4 text-primary" />
                )}
                {open && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Plan</p>
                    <p className="text-sm font-semibold truncate">
                      {user?.plans?.name}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="p-2">
          <SidebarMenu>
            {filteredNavItems.map((item) => {
              const searchParams = new URLSearchParams(location.search);
              const currentTab = searchParams.get("tab");
              let isActive = false;

              if (item.href.includes("?tab=formation")) {
                isActive =
                  location.pathname.startsWith("/modules") &&
                  currentTab === "formation";
              } else if (item.href === "/modules") {
                isActive =
                  location.pathname.startsWith("/modules") &&
                  currentTab !== "formation";
              } else {
                isActive = location.pathname.startsWith(item.href);
              }

              return (
                <SidebarMenuItem
                  key={item.name}
                  className="flex justify-center"
                >
                  <SidebarMenuButton
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2.5 h-auto text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary border-r-2 border-primary hover:text-primary hover:bg-primary/10"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      open ? "" : "justify-center"
                    )}
                    asChild
                  >
                    <Link to={item.href}>
                      <item.icon
                        className={cn(
                          isActive ? "text-primary" : "",
                          open ? "mr-3" : ""
                        )}
                      />
                      {open && (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">
                            {item.name}
                          </div>
                          <div
                            className={cn(
                              `text-xs mt-0.5 truncate`,
                              isActive
                                ? "text-primary/70"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.description}
                          </div>
                        </div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        {open && (
          <>
            {" "}
            <div className="p-3 border-t border-border">
              <div className="bg-primary/5 rounded-lg p-3 border border-primary/20">
                <div className="flex items-center space-x-2 mb-2">
                  <Share2 className="size-4 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    Réseaux Sociaux
                  </span>
                </div>

                <P className="text-xs text-muted-foreground mb-3">
                  {/* {socialConnections.length > 0
                ? `${socialConnections.filter((c) => c.is_valid).length}/${socialConnections.length} réseaux connectés`
                : "Connectez vos réseaux sociaux"} */}
                  Connectez vos réseaux sociaux
                </P>
                {/* 
            <SocialStatusList
              connections={socialConnections}
              variant="dot"
              className="mb-3"
            /> */}

                <LinkButton
                  to={routes.profile.index()}
                  variant={"secondary"}
                  onClick={() => {
                    setTimeout(() => {
                      const event = new CustomEvent("navigateToSocialTab");
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                  className="button-primary w-full block text-center text-xs py-2"
                >
                  {/* {socialConnections.filter((c) => c.is_valid).length > 0
                ? "Gérer les connexions"
                : "Connecter les réseaux"} */}
                  Connecter les réseaux
                </LinkButton>
              </div>
            </div>
            <div className="p-3 border-t border-border text-center">
              <div className="flex items-center justify-center space-x-3 text-xs text-muted-foreground">
                <a href="#" className="hover:text-primary transition-colors">
                  Aide
                </a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">
                  Support
                </a>
                <span>•</span>
                <a href="#" className="hover:text-primary transition-colors">
                  API
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                © 2025 Oppsys
              </p>
            </div>
          </>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
