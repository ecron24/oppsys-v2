/* eslint-disable react/no-unescaped-entities */ "use client";

import React from "react";
import { Search } from "lucide-react";

interface CatalogHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function CatalogHero({ searchQuery, onSearchChange }: CatalogHeroProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Catalogue des Workers IA
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Découvrez notre collection d'outils d'intelligence artificielle pour
            automatiser vos tâches et booster votre productivité
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              <input
                type="text"
                placeholder="Rechercher un outil..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-white/70 border-0 focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
