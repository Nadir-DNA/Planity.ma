import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SALON_CATEGORIES, MOROCCAN_CITIES } from "@/lib/constants";
import { APP_NAME } from "@/lib/constants";

function capitalizeCity(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({
  params,
}: {
  params: { city: string };
}): Promise<Metadata> {
  const city = capitalizeCity(params.city);
  return {
    title: `Salons de beaute a ${city}`,
    description: `Trouvez et reservez les meilleurs salons de beaute, coiffeurs, barbiers et spas a ${city}, Maroc. Reservation en ligne 24/7 sur ${APP_NAME}.`,
  };
}

export async function generateStaticParams() {
  return MOROCCAN_CITIES.map((city) => ({
    city: city.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
  }));
}

export default function CityPage({ params }: { params: { city: string } }) {
  const city = capitalizeCity(params.city);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-gray-900">Accueil</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{city}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          Salons de beaute a {city}
        </h1>
        <p className="text-lg text-gray-600 mt-3">
          Decouvrez les meilleurs salons de coiffure, barbiers, instituts de
          beaute et spas a {city}. Reservez en ligne en quelques clics.
        </p>
      </div>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Explorez par categorie
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SALON_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/${params.city}/${cat.slug}`}
              className="p-4 rounded-xl border border-gray-200 hover:border-rose-300 hover:shadow-md transition-all text-center"
            >
              <h3 className="font-semibold text-gray-900">{cat.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Voir les salons</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Placeholder popular salons */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Salons populaires a {city}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-rose-200" />
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900">
                  Salon Exemple {i}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {city}
                </div>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  <span className="ml-1 text-sm font-medium">4.{6 + i}</span>
                  <span className="ml-1 text-xs text-gray-400">(0 avis)</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* SEO content */}
      <section className="mt-16 prose prose-gray max-w-none">
        <h2>Reservez votre rendez-vous beaute a {city}</h2>
        <p>
          {APP_NAME} est la plateforme de reference pour la reservation en ligne
          de rendez-vous beaute a {city}. Que vous cherchiez un coiffeur, un
          barbier, un institut de beaute ou un spa, trouvez l&apos;etablissement
          ideal pres de chez vous et reservez en quelques clics, 24h/24 et 7j/7.
        </p>
      </section>
    </div>
  );
}
