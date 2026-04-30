import { Search, CalendarCheck, Star } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Recherchez",
    description:
      "Trouvez le salon idéal près de chez vous par catégorie, ville ou service.",
    step: "01",
  },
  {
    icon: CalendarCheck,
    title: "Réservez",
    description:
      "Choisissez votre créneau en temps réel et confirmez votre rendez-vous en ligne.",
    step: "02",
  },
  {
    icon: Star,
    title: "Profitez",
    description:
      "Rendez-vous au salon à l'heure prévue et partagez votre expérience.",
    step: "03",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 sm:py-28 bg-surface-bright">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-3">
            Simple et rapide
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
            Comment ça marche ?
          </h2>
        </div>

        {/* Steps — editorial, no colored circles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, i) => (
            <div key={step.step} className="relative">
              {/* Step number — architectural, faint background */}
              <span className="text-[6rem] font-semibold leading-none text-outline-light absolute -top-3 left-0 select-none">
                {step.step}
              </span>

              <div className="relative pt-12">
                <div className="w-8 h-8 flex items-center justify-center rounded-md bg-surface-container mb-4">
                  <step.icon className="h-4 w-4 text-on-surface-variant" />
                </div>

                <h3 className="text-base font-medium text-on-surface mb-1.5">
                  {step.title}
                </h3>
                <p className="text-sm text-on-surface-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}