/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Dashboard.jsx
import { useState, useEffect } from "react";
import { supabase, signOut } from "../lib/supabase";
import {
  Users,
  Settings,
  Activity,
  CreditCard,
  LogOut,
  ExternalLink,
} from "lucide-react";

export default function Dashboard({ user, onLogout }: any) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalModules: 0,
    totalUsage: 0,
  });
  const [loading, setLoading] = useState(true);

  const apiUrl = import.meta.env.VITE_ADMIN_API_URL || "https://api.oppsys.io";
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true";

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Récupérer les statistiques de base
      const [usersResult, modulesResult, usageResult] = await Promise.all([
        supabase.from("profiles").select("id, created_at", { count: "exact" }),
        supabase
          .from("modules")
          .select("id", { count: "exact" })
          .eq("is_active", true),
        supabase.from("module_usage").select("id", { count: "exact" }),
      ]);

      // Compter les utilisateurs actifs (derniers 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: activeUsersCount } = await supabase
        .from("module_usage")
        .select("user_id", { count: "exact" })
        .gte("used_at", thirtyDaysAgo.toISOString());

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersCount || 0,
        totalModules: modulesResult.count || 0,
        totalUsage: usageResult.count || 0,
      });
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">OppsYs Admin</h1>
              <p className="text-gray-600">
                Interface d'administration - Plateforme SaaS
              </p>
              {isDemoMode && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                  Mode démonstration
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Utilisateurs totaux
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Activity className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Utilisateurs actifs (30j)
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.activeUsers}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Settings className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Modules actifs
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalModules}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Utilisations totales
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.totalUsage}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Configuration API
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    API Backend
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {apiUrl}
                    </code>
                    <a
                      href={`${apiUrl}/health`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Base de données
                  </label>
                  <div className="mt-1">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      Supabase PostgreSQL
                    </code>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Authentification
                  </label>
                  <div className="mt-1">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      Supabase Auth + RLS
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Accès aux plateformes
              </h3>
              <div className="space-y-3">
                <a
                  href="https://app.oppsys.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Application Client
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
                <a
                  href="https://oppsys.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Site Marketing
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
                <a
                  href="https://n8n.oppsys.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">
                    Workflows N8N
                  </span>
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Plateforme SaaS OppsYs - Interface d'administration
            </h3>
            <div className="text-sm text-gray-600">
              <p className="mb-4">
                Interface d'administration pour la gestion complète de la
                plateforme SaaS OppsYs.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Fonctionnalités actuelles :
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Dashboard avec statistiques en temps réel</li>
                    <li>Authentification sécurisée (Supabase)</li>
                    <li>Interface responsive et moderne</li>
                    <li>Connexion à l'API backend</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Prochaines étapes :
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Gestion des utilisateurs et rôles</li>
                    <li>Configuration des modules IA/N8N</li>
                    <li>Monitoring et analytics avancés</li>
                    <li>Système de facturation Stripe</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Version 2.0.0 - Build avec Vite + React 18 + TailwindCSS +
                  Supabase
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
