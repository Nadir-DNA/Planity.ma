import type { Metadata } from "next";
import { SlidersHorizontal, MapPin, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Recherche",
  description: "Recherchez des salons de beaute pres de chez vous au Maroc",
};

// Placeholder results - will be replaced by DB search
const mockResults = [
  {
    id: "1",
    name: "Salon Elegance",
    slug: "salon-elegance-casablanca",
    category: "Coiffeur",
    city: "Casablanca",
    address: "123 Bd Mohammed V",
    rating: 4.8,
    reviewCount: 124,
    priceRange: "80-300 DH",
    nextAvailable: "Aujourd'hui 14:00",
    services: ["Coupe femme", "Coloration", "Brushing"],
  },
  {
    id: "2",
    name: "Barber House",
    slug: "barber-house-rabat",
    category: "Barbier",
    city: "Rabat",
    address: "45 Rue Hassan II",
    rating: 4.9,
    reviewCount: 89,
    priceRange: "50-150 DH",
    nextAvailable: "Aujourd'hui 16:30",
    services: ["Coupe homme", "Barbe", "Rasage"],
  },
  {
    id: "3",
    name: "Spa Zenith",
    slug: "spa-zenith-marrakech",
    category: "Spa & Hammam",
    city: "Marrakech",
    address: "Gueliz, Av. Mohammed VI",
    rating: 4.7,
    reviewCount: 201,
    priceRange: "200-800 DH",
    nextAvailable: "Demain 10:00",
    services: ["Hammam", "Massage", "Gommage"],
  },
];

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; city?: string; category?: string };
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Search header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchParams.q
              ? `Resultats pour "${searchParams.q}"`
              : searchParams.category
              ? `Salons - ${searchParams.category}`
              : "Tous les salons"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {mockResults.length} etablissements trouves
            {searchParams.city && ` a ${searchParams.city}`}
          </p>
        </div>
        <Button variant="outline" size="sm">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
          Disponible aujourd&apos;hui
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
          Mieux notes
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
          Prix croissant
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
          Distance
        </Badge>
      </div>

      {/* Results list */}
      <div className="space-y-4">
        {mockResults.map((salon) => (
          <Link key={salon.id} href={`/etablissement/${salon.slug}`}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Image placeholder */}
                  <div className="sm:w-48 h-48 sm:h-auto bg-gradient-to-br from-rose-100 to-rose-200 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none flex-shrink-0" />

                  {/* Content */}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {salon.name}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {salon.category}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {salon.address}, {salon.city}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="ml-1 text-sm font-semibold">
                          {salon.rating}
                        </span>
                        <span className="ml-1 text-xs text-gray-400">
                          ({salon.reviewCount} avis)
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {salon.services.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-sm text-gray-500">
                        {salon.priceRange}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {salon.nextAvailable}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
