// apps/website/src/components/catalog/CatalogFilters.tsx
"use client";

import React from "react";
import { Filter, ChevronDown, Sparkles } from "lucide-react";

interface Category {
  id: string;
  name: string;
  icon: any;
  count: number;
}

interface CatalogFiltersProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

// ✅ OPTIONS DE TRI ÉTENDUES
const sortOptions = [
  { id: "popular", name: "Plus populaires" },
  { id: "newest", name: "Plus récents" }, // ✅ AJOUTÉ pour les nouveaux modules
  { id: "rating", name: "Mieux notés" },
  { id: "name", name: "Nom A-Z" },
  { id: "time", name: "Plus rapides" },
];

export function CatalogFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  sortBy,
  onSortChange,
  showFilters,
  onToggleFilters,
}: CatalogFiltersProps) {
  return (
    <div className="lg:w-64">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Filtres</h3>
          <button
            onClick={onToggleFilters}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>

        <div
          className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}
        >
          {/* Catégories */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Catégories</h4>
            <div className="space-y-2">
              {categories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {category.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        selectedCategory === category.id
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {category.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tri */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Trier par</h4>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* ✅ SECTION NOUVEAUTÉS AJOUTÉE */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <div className="flex items-center mb-2">
              <Sparkles className="h-4 w-4 text-green-600 mr-2" />
              <h4 className="font-semibold text-gray-900 text-sm">
                Nouveautés
              </h4>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Découvrez nos derniers outils IA :
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">
                  🔍 Analyse Concurrentielle
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Nouveau
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">📈 SEO + GEO</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Nouveau
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-700">
                  🧑‍💼 Talent Analyzer
                </span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Nouveau
                </span>
              </div>
            </div>
          </div>

          {/* ✅ SECTION STATS RAPIDES */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="font-semibold text-gray-900 text-sm mb-3">
              📊 En un coup d'œil
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {categories.find((c) => c.id === "all")?.count || 0}
                </div>
                <div className="text-xs text-gray-600">Outils total</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-600">
                  {categories.filter((c) => c.id !== "all").length}
                </div>
                <div className="text-xs text-gray-600">Catégories</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
