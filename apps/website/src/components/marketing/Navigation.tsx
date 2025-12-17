// apps/website/src/components/marketing/Navigation.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  const navigationItems = [
    { name: "Accueil", href: "/" },
    { name: "Fonctionnalités", href: "/#features" },
    { name: "Catalogue", href: "/catalogue" },
    { name: "Tarifs", href: "/pricing" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <Image
              src="/logo-oppsys-192.png"
              alt="Oppsys"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="text-xl font-bold text-gray-900">Oppsys</span>
          </Link>

          {/* Navigation Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-orange-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <Link
                    href={process.env.NEXT_PUBLIC_APP_URL!}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                  >
                    Tableau de bord
                  </Link>
                ) : (
                  <>
                    <Link
                      href="https://app.oppsys.io/login"
                      className="text-gray-600 hover:text-orange-600 px-4 py-2 font-medium transition-colors duration-200"
                    >
                      Connexion
                    </Link>
                    <Link
                      href="/pricing"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                    >
                      Commencer
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {isOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Mobile */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-orange-600 px-4 py-2 transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="border-t border-gray-100 pt-4 px-4">
                {!loading && (
                  <>
                    {user ? (
                      <Link
                        href={process.env.NEXT_PUBLIC_APP_URL!}
                        className="block bg-orange-600 hover:bg-orange-700 text-white text-center px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                        onClick={() => setIsOpen(false)}
                      >
                        Tableau de bord
                      </Link>
                    ) : (
                      <div className="space-y-2">
                        <Link
                          href="https://app.oppsys.io/login"
                          className="block text-center border border-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          Connexion
                        </Link>
                        <Link
                          href="/pricing"
                          className="block bg-orange-600 hover:bg-orange-700 text-white text-center px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                          onClick={() => setIsOpen(false)}
                        >
                          Commencer
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
