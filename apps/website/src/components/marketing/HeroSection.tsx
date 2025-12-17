/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import Image from "next/image";
export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-20 md:py-32">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Boostez votre productivité avec
            <span className="text-orange-600 block md:inline">
              {" "}
              l'IA d'Oppsys
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Automatisez vos tâches, générez du contenu percutant et
            professionnalisez votre communication digitale en quelques clics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              href="/pricing"
              className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Commencer gratuitement
            </Link>
            <Link
              href="/pricing"
              className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Découvrir les tarifs
            </Link>
          </div>
          {/* Hero Image ou Demo */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border">
              <div className="aspect-video bg-white rounded-lg flex items-center justify-center overflow-hidden">
                <Image
                  src="/démo.png"
                  alt="Démo du générateur de documents Oppsys"
                  width={1220}
                  height={778}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
