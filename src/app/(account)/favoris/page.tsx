import Link from "next/link";
import { Star, MapPin, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const mockFavorites = [
  {
    id: "1",
    name: "Salon Elegance",
    slug: "salon-elegance-casablanca",
    category: "Coiffeur",
    city: "Casablanca",
    address: "123 Bd Mohammed V",
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: "2",
    name: "Spa Zenith",
    slug: "spa-zenith-marrakech",
    category: "Spa & Hammam",
    city: "Marrakech",
    address: "Gueliz, Av. Mohammed VI",
    rating: 4.7,
    reviewCount: 201,
  },
];

export default function FavoritesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes favoris</h1>

      {mockFavorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-4 text-gray-500">
            Vous n&apos;avez pas encore de favoris
          </p>
          <Button className="mt-4" asChild>
            <Link href="/recherche">Decouvrir des salons</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockFavorites.map((salon) => (
            <Card key={salon.id} className="overflow-hidden">
              <div className="flex">
                <div className="w-32 bg-gradient-to-br from-rose-100 to-rose-200 flex-shrink-0" />
                <CardContent className="p-4 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link
                        href={`/etablissement/${salon.slug}`}
                        className="font-semibold text-gray-900 hover:text-rose-600"
                      >
                        {salon.name}
                      </Link>
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {salon.category}
                      </Badge>
                    </div>
                    <button className="text-rose-500 hover:text-rose-700">
                      <Heart className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                  <p className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {salon.address}, {salon.city}
                  </p>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="ml-1 text-sm font-medium">{salon.rating}</span>
                    <span className="ml-1 text-xs text-gray-400">
                      ({salon.reviewCount} avis)
                    </span>
                  </div>
                  <Button size="sm" className="mt-3" asChild>
                    <Link href={`/reservation/${salon.id}`}>Reserver</Link>
                  </Button>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
