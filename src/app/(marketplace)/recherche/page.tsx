"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, MapPin, Star, Loader2, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SALON_CATEGORIES, MOROCCAN_CITIES } from "@/lib/constants";

interface Salon {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  address: string;
  averageRating: number;
  reviewCount: number;
  description?: string;
  phone?: string;
  services?: { name: string; price: number }[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");
  const [minRating, setMinRating] = useState(0);
  const [availableToday, setAvailableToday] = useState(false);

  // Fetch salons from API
  const fetchSalons = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        sort: sortBy,
      });

      if (query) params.set("query", query);
      if (city) params.set("city", city);
      if (category) params.set("category", category);
      if (minRating > 0) params.set("minRating", minRating.toString());
      if (availableToday) params.set("availableToday", "true");

      const res = await fetch(`/api/v1/search?${params}`);
      if (!res.ok) throw new Error("Erreur de recherche");

      const data = await res.json();
      setSalons(data.salons || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }, [page, query, city, category, sortBy, minRating, availableToday]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (sortBy !== "rating") params.set("sort", sortBy);
    router.push(`/recherche?${params}`);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setCity("");
    setCategory("");
    setSortBy("rating");
    setMinRating(0);
    setAvailableToday(false);
    router.push("/recherche");
  }

  function getCategoryLabel(slug: string): string {
    const cat = SALON_CATEGORIES.find((c) => c.slug === slug.toLowerCase().replace(/_/g, "-"));
    return cat?.name || slug;
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Search header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {query
              ? `Résultats pour "${query}"`
              : category
              ? getCategoryLabel(category)
              : "Tous les salons"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} établissement{total !== 1 ? "s" : ""} trouvé{total !== 1 ? "s" : ""}
            {city && ` à ${city}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un salon, service, ville..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Rechercher</Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ville
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Toutes les villes</option>
                  {MOROCCAN_CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="">Toutes les catégories</option>
                  {SALON_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug.toUpperCase()}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trier par
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value="rating">Meilleures notes</option>
                  <option value="reviews">Plus d'avis</option>
                  <option value="price_asc">Prix croissant</option>
                  <option value="price_desc">Prix décroissant</option>
                  <option value="name">Nom A-Z</option>
                </select>
              </div>

              {/* Min rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Note minimum
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  <option value={0}>Toutes les notes</option>
                  <option value={1}>1+ étoiles</option>
                  <option value={2}>2+ étoiles</option>
                  <option value={3}>3+ étoiles</option>
                  <option value={4}>4+ étoiles</option>
                  <option value={5}>5 étoiles</option>
                </select>
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-wrap gap-4 mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={availableToday}
                  onChange={(e) => setAvailableToday(e.target.checked)}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm">Disponible aujourd'hui</span>
              </label>
            </div>

            {/* Clear filters */}
            <div className="flex justify-end mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active filters */}
      {(city || category || minRating > 0 || availableToday) && (
        <div className="flex flex-wrap gap-2 mb-6">
          {city && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setCity("")}>
              {city} ×
            </Badge>
          )}
          {category && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setCategory("")}>
              {getCategoryLabel(category)} ×
            </Badge>
          )}
          {minRating > 0 && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setMinRating(0)}>
              {minRating}+ étoiles ×
            </Badge>
          )}
          {availableToday && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setAvailableToday(false)}>
              Disponible aujourd'hui ×
            </Badge>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      ) : salons.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center text-gray-500">
            <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium">Aucun salon trouvé</p>
            <p className="text-sm mt-2">Essayez de modifier vos filtres ou votre recherche</p>
            <Button variant="outline" className="mt-4" onClick={clearFilters}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {salons.map((salon) => (
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
                              {getCategoryLabel(salon.category)}
                            </Badge>
                          </div>
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {salon.address}, {salon.city}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {renderStars(salon.averageRating)}
                          <span className="ml-2 text-sm font-semibold">
                            {salon.averageRating.toFixed(1)}
                          </span>
                          <span className="ml-1 text-xs text-gray-400">
                            ({salon.reviewCount} avis)
                          </span>
                        </div>
                      </div>

                      {salon.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {salon.description}
                        </p>
                      )}

                      {salon.services && salon.services.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {salon.services.slice(0, 3).map((s) => (
                            <span
                              key={s.name}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
                            >
                              {s.name} — {s.price} DH
                            </span>
                          ))}
                          {salon.services.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{salon.services.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-4">
                        {salon.phone && (
                          <span className="text-sm text-gray-500">
                            {salon.phone}
                          </span>
                        )}
                        <Button size="sm">
                          Réserver
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </Button>
              <span className="flex items-center text-sm text-gray-500">
                Page {page} sur {Math.ceil(total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
