/* eslint-disable react/no-unescaped-entities */
export function TestimonialsSection() {
  const testimonials = [
    {
      content:
        "Oppsys a transformé notre façon de créer du contenu. C'est incroyable !",
      author: "Jean Dupont",
      role: "CEO de TechCorp",
      avatar: "JD",
    },
    {
      content:
        "Grâce à Oppsys, nous avons gagné un temps précieux et amélioré notre visibilité en ligne.",
      author: "Marie Martin",
      role: "Marketing Director",
      avatar: "MM",
    },
    {
      content:
        "Un outil indispensable pour notre équipe de rédaction. Simple et efficace.",
      author: "Lucie Bernard",
      role: "Content Manager",
      avatar: "LB",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-xl text-gray-600">
            Rejoignez les entreprises qui font confiance à Oppsys
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.author}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
              <p className="text-gray-700 italic leading-relaxed">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
