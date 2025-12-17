// apps/website/src/components/marketing/CTASection.tsx
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Prêt à transformer votre productivité ?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Rejoignez des milliers d'utilisateurs qui automatisent leurs tâches
          avec Oppsys
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
        >
          Commencer gratuitement
        </Link>
      </div>
    </section>
  );
}
