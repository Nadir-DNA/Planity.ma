import Link from "next/link";
import { Star, MapPin } from "lucide-react";

const featuredSalons = [
  {
    id: "1",
    name: "Salon Élégance",
    slug: "salon-elegance-casablanca",
    category: "Coiffeur",
    city: "Casablanca",
    rating: 4.8,
    reviewCount: 124,
    priceRange: "À partir de 80 DH",
  },
  {
    id: "2",
    name: "Barber House",
    slug: "barber-house-rabat",
    category: "Barbier",
    city: "Rabat",
    rating: 4.9,
    reviewCount: 89,
    priceRange: "À partir de 50 DH",
  },
  {
    id: "3",
    name: "Spa Zénith",
    slug: "spa-zenith-marrakech",
    category: "Spa & Hammam",
    city: "Marrakech",
    rating: 4.7,
    reviewCount: 201,
    priceRange: "À partir de 200 DH",
  },
  {
    id: "4",
    name: "Beauty Lounge",
    slug: "beauty-lounge-tanger",
    category: "Institut de beauté",
    city: "Tanger",
    rating: 4.6,
    reviewCount: 156,
    priceRange: "À partir de 120 DH",
  },
];

export function FeaturedSalons() {
  return (
    <section className="py-20 sm:py-28 bg-surface">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* Section header */}
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-3">
            Populaires
          </p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-on-surface">
            Salons recommandés
          </h2>
        </div>

        {/* Cards — white lifted surface, ghost border */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredSalons.map((salon) => (
            <Link
              key={salon.id}
              href={`/etablissement/${salon.slug}`}
              className="group bg-surface-bright rounded-md border border-outline-light hover:border-outline-medium ambient-shadow-hover transition-all overflow-hidden"
            >
              {/* Image placeholder */}
              <div className="aspect-[4/3] bg-surface-container-low" />

              <div className="p-4 space-y-2">
                {/* Category label */}
                <p className="text-xs uppercase tracking-wider text-on-surface-muted">
                  {salon.category}
                </p>

                <h3 className="text-sm font-medium text-on-surface group-hover:text-on-surface transition-colors">
                  {salon.name}
                </h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3.5 w-3.5 text-on-surface fill-on-surface" />
                    <span className="text-xs font-medium text-on-surface">
                      {salon.rating}
                    </span>
                    <span className="text-xs text-on-surface-muted">
                      ({salon.reviewCount})
                    </span>
                  </div>
                  <span className="text-xs text-on-surface-muted">
                    {salon.priceRange}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-on-surface-muted">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">{salon.city}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}