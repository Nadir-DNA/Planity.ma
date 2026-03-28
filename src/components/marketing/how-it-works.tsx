import { Search, CalendarCheck, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description:
      "Trouvez le salon ideal pres de chez vous par categorie, ville ou service.",
  },
  {
    icon: CalendarCheck,
    title: "Reservez",
    description:
      "Choisissez votre creneau en temps reel et confirmez votre rendez-vous en ligne.",
  },
  {
    icon: Star,
    title: "Profitez",
    description:
      "Rendez-vous au salon a l'heure prevue et partagez votre experience.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Comment ca marche ?
          </h2>
          <p className="mt-3 text-gray-600">
            Reservez en 3 etapes simples
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
                <step.icon className="h-8 w-8 text-rose-600" />
              </div>
              <div className="mt-2 flex items-center justify-center">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white">
                  {index + 1}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
