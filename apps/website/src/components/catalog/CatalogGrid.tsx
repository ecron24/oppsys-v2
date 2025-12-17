/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Search } from "lucide-react";
import { WorkerCard } from "./WorkerCard";

interface CatalogGridProps {
  workers: any[];
  selectedCategory: string;
  categories: any[];
  onResetFilters: () => void;
}

export function CatalogGrid({
  workers,
  selectedCategory,
  categories,
  onResetFilters,
}: CatalogGridProps) {
  const categoryName =
    selectedCategory === "all"
      ? "Tous les outils"
      : categories.find((c) => c.id === selectedCategory)?.name;

  return (
    <div className="flex-1">
      {/* Header résultats */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{categoryName}</h2>
          <p className="text-gray-600">
            {workers.length} outil{workers.length > 1 ? "s" : ""} disponible
            {workers.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Grille des cards */}
      {workers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <WorkerCard key={worker.id} worker={worker} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun outil trouvé
          </h3>
          <p className="text-gray-600 mb-4">
            Essayez de modifier vos critères de recherche ou parcourez une autre
            catégorie.
          </p>
          <button
            onClick={onResetFilters}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
