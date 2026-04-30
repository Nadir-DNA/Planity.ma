import Link from "next/link";
import { MapPin } from "lucide-react";

const cities = [
  {
    name: "Casablanca",
    slug: "casablanca",
    salons: "180+ salons",
    description: "La métropole économique",
  },
  {
    name: "Rabat",
    slug: "rabat",
    salons: "95+ salons",
    description: "La capitale royale",
  },
  {
    name: "Marrakech",
    slug: "marrakech",
    salons: "110+ salons",
    description: "La ville impériale",
  },
  {
    name: "Fès",
    slug: "fes",
    salons: "60+ salons",
    description: "La capitale spirituelle",
  },
  {
    name: "Tanger",
    slug: "tanger",
    salons: "45+ salons",
    description: "La perle du détroit",
  },
  {
    name: "Agadir",
    slug: "agadir",
    salons: "35+ salons",
    description: "La station balnéaire",
  },
];

export function CitiesSection() {
  return (
    <section className="py-20 sm:py-28 bg-surface-bright">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-3">
            Villes
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
            Disponible partout au Maroc
          </h2>
        </div>

        {/* City cards — uniform, no per-city colors */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {cities.map((city) => (
            <Link
              key={city.slug}
              href={`/recherche?city=${city.slug}`}
              className="group bg-surface-bright p-4 rounded-md border border-outline-light hover:border-outline-medium hover:bg-surface-container transition-all"
            >
              <MapPin className="h-4 w-4 text-on-surface-muted group-hover:text-on-surface transition-colors mb-2" />
              <h3 className="text-sm font-medium text-on-surface mb-0.5">
                {city.name}
              </h3>
              <p className="text-xs text-on-surface-muted">
                {city.description}
              </p>
              <p className="text-xs text-on-surface-muted mt-1">{city.salons}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}