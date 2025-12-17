// apps/website/src/components/marketing/FAQSection.tsx
export function FAQSection() {
  const faqs = [
    {
      question: "Comment puis-je commencer avec Oppsys ?",
      answer:
        "Il vous suffit de créer un compte gratuit et de suivre notre guide de démarrage rapide.",
    },
    {
      question: "Quels sont les tarifs d'Oppsys ?",
      answer:
        "Nous proposons plusieurs plans tarifaires adaptés à vos besoins. Consultez notre page Tarifs pour plus de détails.",
    },
    {
      question: "Puis-je annuler mon abonnement à tout moment ?",
      answer:
        "Oui, vous pouvez annuler votre abonnement à tout moment sans frais supplémentaires.",
    },
    {
      question: "Que propose l'abonnement gratuit ?",
      answer:
        "Notre abonnement gratuit vous permet de tester toutes les fonctionnalités de base de nos workers. C'est le moyen idéal de découvrir Oppsys sans engagement.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions Fréquentes
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors duration-300"
            >
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
