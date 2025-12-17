/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useState } from "react";
import Link from "next/link";

import { CatalogHero } from "../catalog/CatalogHero";
import { CatalogFilters } from "../catalog/CatalogFilters";
import { CatalogGrid } from "../catalog/CatalogGrid";
import { useWorkers } from "../../hooks/useWorkers";

export function CatalogSection() {
  // ✅ REMPLACEMENT : Au lieu de tous vos useState/useEffect/useMemo
  // On utilise le hook qui fait tout le travail
  const {
    categories,
    filteredWorkers,
    loading,
    error,
    stats,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    setSortBy,
    resetFilters,
  } = useWorkers();

  // ✅ GARDÉ : Le seul état qui reste car il n'est pas dans le hook
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // ✅ SUPPRIMÉ : Tout le code useState/useEffect/useMemo que vous aviez
  // Car maintenant c'est dans le hook !

  // États de chargement et d'erreur (IDENTIQUES à votre code)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Catalogue des Workers IA
              </h1>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
                <span className="text-blue-100">
                  Chargement du catalogue...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Catalogue des Workers IA
              </h1>
              <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-2">
                  Erreur de chargement
                </h2>
                <p className="text-red-100 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-white text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Réessayer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <CatalogHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="container mx-auto px-4 py-12">
        {/* Filtres et grille */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filtres */}
          <CatalogFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            sortBy="popular" // ⚠️ CHANGEMENT : On ne peut plus passer sortBy directement
            onSortChange={setSortBy}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {/* Grille des workers */}
          <CatalogGrid
            workers={filteredWorkers} // ✅ CHANGEMENT : filteredWorkers au lieu de filteredAndSortedWorkers
            selectedCategory={selectedCategory}
            categories={categories}
            onResetFilters={resetFilters} // ✅ CHANGEMENT : resetFilters au lieu de handleResetFilters
          />
        </div>
      </div>

      {/* Section statistiques */}
      {stats.totalWorkers > 0 && ( // ✅ CHANGEMENT : stats.totalWorkers au lieu de workers.length
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Notre écosystème IA
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Découvrez les chiffres de notre plateforme d'automatisation
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stats.totalWorkers}{" "}
                  {/* ✅ CHANGEMENT : Utilisation des stats du hook */}
                </div>
                <div className="text-gray-600">Workers disponibles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {stats.popularWorkers}{" "}
                  {/* ✅ CHANGEMENT : Utilisation des stats du hook */}
                </div>
                <div className="text-gray-600">Workers populaires</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {stats.totalCategories}{" "}
                  {/* ✅ CHANGEMENT : Utilisation des stats du hook */}
                </div>
                <div className="text-gray-600">Catégories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {stats.averageRating.toFixed(1)}{" "}
                  {/* ✅ CHANGEMENT : Utilisation des stats du hook */}
                </div>
                <div className="text-gray-600">Note moyenne</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section - IDENTIQUE */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à automatiser vos tâches ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers d'utilisateurs qui gagnent du temps avec nos
            outils d'IA
          </p>
          <Link
            href="/pricing"
            className="inline-block bg-white text-blue-600 font-semibold py-4 px-8 rounded-xl hover:bg-gray-50 transition-colors text-lg"
          >
            Commencer gratuitement
          </Link>
        </div>
      </div>
    </div>
  );
}
