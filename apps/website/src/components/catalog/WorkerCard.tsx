/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { Star, Clock, ArrowRight } from "lucide-react";

interface WorkerCardProps {
  worker: {
    id: number;
    name: string;
    description: string;
    category: string;
    tags: string[];
    icon: any;
    color: string;
    rating: number;
    timeToComplete: string;
    difficulty: string;
    popular: boolean;
  };
}

export function WorkerCard({ worker }: WorkerCardProps) {
  const IconComponent = worker.icon;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Badge populaire */}
      {worker.popular && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-semibold px-3 py-1 text-center">
          ⭐ Populaire
        </div>
      )}

      <div className="p-6">
        {/* Header avec icône et rating */}
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-xl ${worker.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
          >
            <IconComponent className="h-6 w-6" />
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="font-medium">{worker.rating}</span>
          </div>
        </div>

        {/* Titre et description */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {worker.name}
        </h3>
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {worker.description}
        </p>

        {/* Métriques */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{worker.timeToComplete}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${
                worker.difficulty === "Facile"
                  ? "bg-green-400"
                  : worker.difficulty === "Intermédiaire"
                    ? "bg-yellow-400"
                    : "bg-red-400"
              }`}
            ></div>
            <span>{worker.difficulty}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {worker.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
          {worker.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
              +{worker.tags.length - 3}
            </span>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/pricing"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2 group-hover:shadow-lg"
        >
          <span>Essayer maintenant</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
