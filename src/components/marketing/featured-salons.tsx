import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Placeholder data - will be replaced by DB queries
const featuredSalons = [
  {
    id: "1",
    name: "Salon Elegance",
    slug: "salon-elegance-casablanca",
    category: "Coiffeur",
    city: "Casablanca",
    rating: 4.8,
    reviewCount: 124,
    image: "/images/placeholder-salon.jpg",
    priceRange: "A partir de 80 DH",
  },
  {
    id: "2",
    name: "Barber House",
    slug: "barber-house-rabat",
    category: "Barbier",
    city: "Rabat",
    rating: 4.9,
    reviewCount: 89,
    image: "/images/placeholder-salon.jpg",
    priceRange: "A partir de 50 DH",
  },
  {
    id: "3",
    name: "Spa Zenith",
    slug: "spa-zenith-marrakech",
    category: "Spa & Hammam",
    city: "Marrakech",
    rating: 4.7,
    reviewCount: 201,
    image: "/images/placeholder-salon.jpg",
    priceRange: "A partir de 200 DH",
  },
  {
    id: "4",
    name: "Beauty Lounge",
    slug: "beauty-lounge-tanger",
    category: "Institut de beaute",
    city: "Tanger",
    rating: 4.6,
    reviewCount: 67,
    image: "/images/placeholder-salon.jpg",
    priceRange: "A partir de 100 DH",
  },
];

export function FeaturedSalons() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Salons populaires
            </h2>
            <p className="mt-2 text-gray-600">
              Les mieux notes par nos clients
            </p>
          </div>
          <Link
            href="/recherche"
            className="text-sm font-medium text-rose-600 hover:text-rose-700"
          >
            Voir tout &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSalons.map((salon) => (
            <Link key={salon.id} href={`/etablissement/${salon.slug}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-rose-200 relative">
                  <Badge className="absolute top-3 left-3" variant="secondary">
                    {salon.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                    {salon.name}
                  </h3>
                  <div className="flex items-center mt-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {salon.city}
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      <span className="ml-1 text-sm font-medium">
                        {salon.rating}
                      </span>
                      <span className="ml-1 text-xs text-gray-400">
                        ({salon.reviewCount})
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {salon.priceRange}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
