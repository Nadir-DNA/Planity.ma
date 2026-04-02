import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SALON_CATEGORIES, MOROCCAN_CITIES, APP_NAME } from "@/lib/constants";

function capitalizeCity(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getCategoryName(slug: string): string {
  const cat = SALON_CATEGORIES.find((c) => c.slug === slug);
  return cat?.name || slug;
}

export async function generateMetadata({
  params,
}: {
  params: { city: string; category: string };
}): Promise<Metadata> {
  const city = capitalizeCity(params.city);
  const category = getCategoryName(params.category);
  return {
    title: `${category} a ${city}`,
    description: `Les meilleurs ${category.toLowerCase()} a ${city}, Maroc. Consultez les avis, comparez les prix et reservez en ligne sur ${APP_NAME}.`,
  };
}

export async function generateStaticParams() {
  const params: { city: string; category: string }[] = [];
  for (const city of MOROCCAN_CITIES) {
    const citySlug = city.toLowerCase().replace(/\s+/g, "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    for (const cat of SALON_CATEGORIES) {
      params.push({ city: citySlug, category: cat.slug });
    }
  }
  return params;
}

export default function CityCategoryPage({
  params,
}: {
  params: { city: string; category: string };
}) {
  const city = capitalizeCity(params.city);
  const categoryName = getCategoryName(params.category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-900">Accueil</Link>
        <span className="mx-2">/</span>
        <Link href={`/${params.city}`} className="hover:text-gray-900">{city}</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{categoryName}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          {categoryName} a {city}
        </h1>
        <p className="text-gray-600 mt-2">
          Trouvez les meilleurs {categoryName.toLowerCase()} a {city} et
          reservez votre prochain rendez-vous en ligne.
        </p>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Link key={i} href={`/etablissement/salon-${params.category}-${i}-${params.city}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="aspect-[4/3] bg-gradient-to-br from-rose-100 to-rose-200 relative">
                <Badge className="absolute top-3 left-3" variant="secondary">
                  {categoryName}
                </Badge>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors">
                  {categoryName} {city} #{i}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {city}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <span className="ml-1 text-sm font-medium">4.{5 + (i % 5)}</span>
                    <span className="ml-1 text-xs text-gray-400">({i * 15} avis)</span>
                  </div>
                  <span className="text-xs text-gray-500">A partir de {50 + i * 20} DH</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* SEO content */}
      <section className="mt-16 prose prose-gray max-w-none">
        <h2>Trouver un {categoryName.toLowerCase()} a {city}</h2>
        <p>
          Vous recherchez un {categoryName.toLowerCase()} a {city} ? {APP_NAME}{" "}
          vous propose une selection des meilleurs etablissements de la ville.
          Consultez les avis clients, comparez les tarifs et reservez votre
          rendez-vous en ligne en toute simplicite.
        </p>
      </section>
    </div>
  );
}
