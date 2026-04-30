"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  MapPin,
  Star,
  Loader2,
  Search as SearchIcon,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RatingStars, Skeleton } from "@/components/ui";
import Link from "next/link";
import { SALON_CATEGORIES, MOROCCAN_CITIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────

interface Salon {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  address: string;
  averageRating: number;
  reviewCount: number;
  isVerified?: boolean;
  description?: string;
  phone?: string;
  services?: { name: string; price: number }[];
  openingHours?: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
}

// ─── Helpers ─────────────────────────────────────────────────────

function isSalonOpenNow(
  hours: Salon["openingHours"]
): boolean {
  if (!hours || hours.length === 0) return false;
  const now = new Date();
  const jsDay = now.getDay(); // 0=Sunday
  const schemaDay = (jsDay + 6) % 7; // Convert to 0=Monday
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const today = hours.find((h) => h.dayOfWeek === schemaDay);
  if (!today || today.isClosed) return false;
  return currentTime >= today.openTime && currentTime <= today.closeTime;
}

function getCategoryLabel(slug: string): string {
  const cat = SALON_CATEGORIES.find(
    (c) => c.slug === slug.toLowerCase().replace(/_/g, "-")
  );
  return cat?.name || slug;
}

function categorySlugToEnum(slug: string): string {
  return slug.toUpperCase().replace(/-/g, "_");
}

function enumToCategorySlug(enumVal: string): string {
  return enumVal.toLowerCase().replace(/_/g, "-");
}

// ─── Filter Section Component ─────────────────────────────────────

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-[rgba(198,198,198,0.2)] pb-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-900 uppercase tracking-wider"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-gray-400 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && <div className="pt-2">{children}</div>}
    </div>
  );
}

// ─── Star Rating Picker ──────────────────────────────────────────

function StarRatingPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className={cn(
            "p-0.5 rounded-md transition-colors",
            star <= value ? "text-gray-900" : "text-gray-300 hover:text-gray-500"
          )}
        >
          <Star
            className="h-5 w-5"
            fill={star <= value ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-xs text-gray-500">{value}+ étoiles</span>
      )}
    </div>
  );
}

// ─── Toggle Checkbox ─────────────────────────────────────────────

function ToggleCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 py-2 cursor-pointer select-none">
      <div
        className={cn(
          "flex h-4.5 w-4.5 items-center justify-center rounded-md border transition-colors",
          checked
            ? "bg-gray-900 border-gray-900"
            : "bg-white border-gray-300"
        )}
        style={{ width: 18, height: 18 }}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  );
}

// ─── Main Search Content ─────────────────────────────────────────

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Data state
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter state — initialize from URL params
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category") || "";
    return cat ? cat.split(",").map(enumToCategorySlug) : [];
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "rating");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [minRating, setMinRating] = useState(
    parseInt(searchParams.get("minRating") || "0", 10)
  );
  const [isVerified, setIsVerified] = useState(
    searchParams.get("isVerified") === "true"
  );
  const [isOpen, setIsOpen] = useState(
    searchParams.get("isOpen") === "true"
  );

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
      if (selectedCategories.length > 0) {
        params.set(
          "category",
          selectedCategories.map(categorySlugToEnum).join(",")
        );
      }
      if (minRating > 0) params.set("minRating", minRating.toString());
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (isVerified) params.set("isVerified", "true");
      if (isOpen) params.set("isOpen", "true");

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
  }, [
    page,
    query,
    city,
    selectedCategories,
    sortBy,
    minRating,
    minPrice,
    maxPrice,
    isVerified,
    isOpen,
  ]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  function handleSearch() {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.map(categorySlugToEnum).join(","));
    }
    if (sortBy !== "rating") params.set("sort", sortBy);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating > 0) params.set("minRating", minRating.toString());
    if (isVerified) params.set("isVerified", "true");
    if (isOpen) params.set("isOpen", "true");
    router.push(`/recherche?${params}`);
    setPage(1);
  }

  function clearFilters() {
    setQuery("");
    setCity("");
    setSelectedCategories([]);
    setSortBy("rating");
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
    setIsVerified(false);
    setIsOpen(false);
    router.push("/recherche");
  }

  function toggleCategory(slug: string) {
    setSelectedCategories((prev) =>
      prev.includes(slug)
        ? prev.filter((c) => c !== slug)
        : [...prev, slug]
    );
  }

  // Count active filters for badge
  const activeFilterCount = [
    selectedCategories.length > 0,
    minPrice !== "",
    maxPrice !== "",
    minRating > 0,
    isVerified,
    isOpen,
  ].filter(Boolean).length;

  // ─── Filter content (shared between desktop sidebar & mobile sheet) ────

  const renderFilterContent = () => (
    <div className="space-y-4">
      {/* Categories */}
      <FilterSection title="Catégories" defaultOpen={true}>
        <div className="space-y-1">
          {SALON_CATEGORIES.map((cat) => (
            <label
              key={cat.slug}
              className="flex items-center gap-3 py-1.5 cursor-pointer select-none"
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded-md border transition-colors",
                  selectedCategories.includes(cat.slug)
                    ? "bg-gray-900 border-gray-900"
                    : "bg-white border-gray-300"
                )}
                style={{ width: 18, height: 18 }}
              >
                {selectedCategories.includes(cat.slug) && (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                )}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedCategories.includes(cat.slug)}
                onChange={() => toggleCategory(cat.slug)}
              />
              <span className="text-sm text-gray-700">{cat.name}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Budget (DH)" defaultOpen={true}>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="h-9 text-sm rounded-md"
          />
          <span className="text-gray-400 text-sm">—</span>
          <Input
            type="number"
            placeholder="Max"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="h-9 text-sm rounded-md"
          />
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Note minimum" defaultOpen={true}>
        <StarRatingPicker value={minRating} onChange={setMinRating} />
      </FilterSection>

      {/* Toggles */}
      <FilterSection title="Options" defaultOpen={true}>
        <ToggleCheckbox
          label="Vérifié uniquement"
          checked={isVerified}
          onChange={setIsVerified}
        />
        <ToggleCheckbox
          label="Ouvert maintenant"
          checked={isOpen}
          onChange={setIsOpen}
        />
      </FilterSection>

      {/* City */}
      <FilterSection title="Ville" defaultOpen={false}>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded-md border border-[rgba(198,198,198,0.4)] bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="">Toutes les villes</option>
          {MOROCCAN_CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Sort */}
      <FilterSection title="Trier par" defaultOpen={false}>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full rounded-md border border-[rgba(198,198,198,0.4)] bg-white px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        >
          <option value="rating">Meilleures notes</option>
          <option value="reviews">Plus d'avis</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="name">Nom A-Z</option>
        </select>
      </FilterSection>

      {/* Clear */}
      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full rounded-md"
        >
          Réinitialiser les filtres
        </Button>
      )}
    </div>
  );

  // ─── Active Filter Badges ──────────────────────────────────────

  const renderActiveFilters = () => {
    const badges: React.ReactNode[] = [];

    if (city) {
      badges.push(
        <Badge
          key="city"
          variant="outline"
          className="cursor-pointer gap-1 rounded-md"
          onClick={() => setCity("")}
        >
          {city} ×
        </Badge>
      );
    }

    selectedCategories.forEach((catSlug) => {
      badges.push(
        <Badge
          key={`cat-${catSlug}`}
          variant="outline"
          className="cursor-pointer gap-1 rounded-md"
          onClick={() => toggleCategory(catSlug)}
        >
          {getCategoryLabel(catSlug)} ×
        </Badge>
      );
    });

    if (minPrice) {
      badges.push(
        <Badge
          key="minPrice"
          variant="outline"
          className="cursor-pointer gap-1 rounded-md"
          onClick={() => setMinPrice("")}
        >
          Min {minPrice} DH ×
        </Badge>
      );
    }

    if (maxPrice) {
      badges.push(
        <Badge
          key="maxPrice"
          variant="outline"
          className="cursor-pointer gap-1 rounded-md"
          onClick={() => setMaxPrice("")}
        >
          Max {maxPrice} DH ×
        </Badge>
      );
    }

    if (minRating > 0) {
      badges.push(
        <Badge
          key="rating"
          variant="outline"
          className="cursor-pointer gap-1 rounded-md"
          onClick={() => setMinRating(0)}
        >
          {minRating}+ ★ ×
        </Badge>
      );
    }

    if (isVerified) {
      badges.push(
        <Badge
          key="verified"
          variant="outline"
          className="cursor-pointer gap-1 rounded-md"
          onClick={() => setIsVerified(false)}
        >
          Vérifié ×
        </Badge>
      );
    }

    if (isOpen) {
      badges.push(
        <Badge
          key="open"
          variant="outline"
          className="cursor-pointer gap-1 rounded-md"
          onClick={() => setIsOpen(false)}
        >
          Ouvert ×
        </Badge>
      );
    }

    return badges.length > 0 ? (
      <div className="flex flex-wrap gap-2">{badges}</div>
    ) : null;
  };

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Search header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {query
              ? `Résultats pour "${query}"`
              : selectedCategories.length === 1
              ? getCategoryLabel(selectedCategories[0])
              : "Tous les salons"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {total} établissement{total !== 1 ? "s" : ""} trouvé
            {total !== 1 ? "s" : ""}
            {city && ` à ${city}`}
          </p>
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
            className="pl-10 rounded-md"
          />
        </div>
        <Button onClick={handleSearch} className="rounded-md">
          Rechercher
        </Button>
        {/* Mobile filter button */}
        <Button
          variant="outline"
          size="default"
          className="lg:hidden relative rounded-md"
          onClick={() => setShowMobileFilters(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-md bg-gray-900 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Main layout: sidebar + results */}
      <div className="flex gap-8">
        {/* ─── Desktop Sidebar ─────────────────────────── */}
        <aside
          className={cn(
            "hidden lg:block shrink-0 transition-all duration-200",
            sidebarCollapsed ? "w-0 overflow-hidden" : "w-64"
          )}
        >
          <div className="sticky top-24 bg-white border border-[rgba(198,198,198,0.2)] rounded-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-900">
                Filtres
              </h2>
              {activeFilterCount > 0 && (
                <span className="text-xs text-gray-500">
                  {activeFilterCount} actif{activeFilterCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            {renderFilterContent()}
          </div>
        </aside>

        {/* Sidebar collapse toggle (desktop) */}
        <button
          className="hidden lg:flex items-center justify-center w-5 shrink-0 text-gray-400 hover:text-gray-900 transition-colors"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? "Afficher les filtres" : "Masquer les filtres"}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              sidebarCollapsed ? "-rotate-90" : "rotate-90"
            )}
          />
        </button>

        {/* ─── Results Area ─────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Active filter badges */}
          {renderActiveFilters() && (
            <div className="mb-4">{renderActiveFilters()}</div>
          )}

          {/* Results */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <Skeleton className="sm:w-48 h-48 sm:h-32 rounded-t-md sm:rounded-l-md sm:rounded-tr-none" />
                      <div className="flex-1 p-5 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : salons.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center text-gray-500">
                <SearchIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">Aucun salon trouvé</p>
                <p className="text-sm mt-2">
                  Essayez de modifier vos filtres ou votre recherche
                </p>
                <Button
                  variant="outline"
                  className="mt-4 rounded-md"
                  onClick={clearFilters}
                >
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
                        <div className="sm:w-48 h-48 sm:h-auto bg-[#eeeeee] rounded-t-md sm:rounded-l-md sm:rounded-tr-none flex-shrink-0" />

                        {/* Content */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {salon.name}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="text-xs rounded-md"
                                >
                                  {getCategoryLabel(salon.category)}
                                </Badge>
                                {salon.isVerified && (
                                  <span className="text-xs text-gray-500 font-medium">
                                    ✓ Vérifié
                                  </span>
                                )}
                                {isSalonOpenNow(salon.openingHours) && (
                                  <span className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded-md">
                                    Ouvert
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                {salon.address}, {salon.city}
                              </div>
                            </div>
                            <div className="flex items-center shrink-0">
                              <RatingStars rating={salon.averageRating} size="sm" />
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
                                  className="text-xs bg-[#eeeeee] text-gray-600 px-2 py-0.5 rounded-md"
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
                            <Button size="sm" className="rounded-md">
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
                    className="rounded-md"
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
                    className="rounded-md"
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
      </div>

      {/* ─── Mobile Filter Bottom Sheet ─────────────────── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          {/* Sheet */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-md shadow-xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[rgba(198,198,198,0.2)]">
              <h2 className="font-semibold text-gray-900">Filtres</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5">
              {renderFilterContent()}
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-[rgba(198,198,198,0.2)]">
              <Button
                className="w-full rounded-md"
                onClick={() => setShowMobileFilters(false)}
              >
                Voir {total} résultat{total !== 1 ? "s" : ""}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}