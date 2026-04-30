import Link from "next/link";
import {
  Scissors,
  Sparkles,
  Droplets,
  Hand,
  Palette,
  Zap,
} from "lucide-react";

const categories = [
  {
    name: "Coiffeur",
    slug: "coiffeur",
    icon: Scissors,
    count: "150+ salons",
  },
  {
    name: "Barbier",
    slug: "barbier",
    icon: Scissors,
    count: "80+ salons",
  },
  {
    name: "Institut de beauté",
    slug: "institut-beaute",
    icon: Sparkles,
    count: "120+ salons",
  },
  {
    name: "Spa & Hammam",
    slug: "spa",
    icon: Droplets,
    count: "60+ salons",
  },
  {
    name: "Manucure & Pédicure",
    slug: "ongles",
    icon: Hand,
    count: "90+ salons",
  },
  {
    name: "Maquillage",
    slug: "maquillage",
    icon: Palette,
    count: "40+ salons",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-20 sm:py-28 bg-surface-bright">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-3">
            Catégories
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
            Trouvez par service
          </h2>
        </div>

        {/* Grid — no gradients, no colored icons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/recherche?category=${cat.slug}`}
              className="group bg-surface-bright p-5 rounded-md border border-outline-light hover:border-outline-medium hover:bg-surface-container transition-all"
            >
              <cat.icon className="h-5 w-5 text-on-surface-muted group-hover:text-on-surface transition-colors mb-3" />
              <h3 className="text-sm font-medium text-on-surface mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-on-surface-muted">{cat.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}