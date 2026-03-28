import Link from "next/link";
import {
  Scissors,
  Sparkles,
  Droplets,
  Hand,
  Palette,
  Zap,
  Heart,
} from "lucide-react";

const categories = [
  {
    name: "Coiffeur",
    slug: "coiffeur",
    icon: Scissors,
    color: "bg-rose-100 text-rose-600",
    count: "150+ salons",
  },
  {
    name: "Barbier",
    slug: "barbier",
    icon: Scissors,
    color: "bg-blue-100 text-blue-600",
    count: "80+ salons",
  },
  {
    name: "Institut de beaute",
    slug: "institut-beaute",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600",
    count: "120+ salons",
  },
  {
    name: "Spa & Hammam",
    slug: "spa",
    icon: Droplets,
    color: "bg-teal-100 text-teal-600",
    count: "60+ salons",
  },
  {
    name: "Manucure & Pedicure",
    slug: "ongles",
    icon: Hand,
    color: "bg-pink-100 text-pink-600",
    count: "90+ salons",
  },
  {
    name: "Maquillage",
    slug: "maquillage",
    icon: Palette,
    color: "bg-amber-100 text-amber-600",
    count: "40+ salons",
  },
  {
    name: "Epilation",
    slug: "epilation",
    icon: Zap,
    color: "bg-orange-100 text-orange-600",
    count: "70+ salons",
  },
  {
    name: "Massage",
    slug: "massage",
    icon: Heart,
    color: "bg-green-100 text-green-600",
    count: "50+ salons",
  },
];

export function CategoryGrid() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">
            Explorez par categorie
          </h2>
          <p className="mt-3 text-gray-600">
            Trouvez le service parfait pour vous
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/recherche?category=${cat.slug}`}
              className="group flex flex-col items-center p-6 rounded-xl border border-gray-200 bg-white hover:border-rose-300 hover:shadow-md transition-all"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-full ${cat.color} group-hover:scale-110 transition-transform`}
              >
                <cat.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-gray-900 text-center">
                {cat.name}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{cat.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
