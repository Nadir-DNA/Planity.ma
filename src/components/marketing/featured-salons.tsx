import Link from "next/link";
import Image from "next/image";
import { Star, MapPin } from "lucide-react";
import { MOCK_SALONS } from "@/lib/mock-data";

const featuredSalons = MOCK_SALONS.slice(0, 6).map((s) => {
  const bookableServices = s.services.filter(sv => sv.isOnlineBookable);
  const prices = bookableServices.map(sv => sv.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  return {
    id: s.id,
    name: s.name,
    slug: s.slug,
    category: s.category.charAt(0) + s.category.slice(1).toLowerCase().replace(/_/g, " "),
    city: s.city,
    rating: s.averageRating,
    reviewCount: s.reviewCount,
    priceRange: minPrice > 0 ? `À partir de ${minPrice} DH` : "Sur devis",
    coverImage: s.coverImage,
  };
});

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredSalons.map((salon) => (
            <Link
              key={salon.id}
              href={`/etablissement/${salon.slug}`}
              className="group bg-surface-bright rounded-md border border-outline-light hover:border-outline-medium ambient-shadow-hover transition-all overflow-hidden"
            >
              {/* Cover image */}
              <div className="relative aspect-[16/9] bg-surface-container-low overflow-hidden">
                {salon.coverImage ? (
                  <Image
                    src={salon.coverImage}
                    alt={salon.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-on-surface-muted text-sm">
                    {salon.name}
                  </div>
                )}
              </div>

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
