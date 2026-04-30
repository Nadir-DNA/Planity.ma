
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Select } from "./select";
import { Badge } from "./badge";
import { SlidersHorizontal, X } from "lucide-react";

interface SearchFiltersProps {
  onFilterChange: (filters: Record<string, string>) => void;
  categories?: { value: string; label: string }[];
  cities?: { value: string; label: string }[];
  className?: string;
}

export function SearchFilters({ onFilterChange, categories = [], cities = [], className }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const updateFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    if (!value) delete newFilters[key];
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeCount = Object.keys(filters).length;

  const sortOptions = [
    { value: "relevance", label: "Pertinence" },
    { value: "rating", label: "Meilleures notes" },
    { value: "price_asc", label: "Prix croissant" },
    { value: "price_desc", label: "Prix décroissant" },
  ];

  const ratingOptions = [
    { value: "", label: "Tous" },
    { value: "4", label: "4+ étoiles" },
    { value: "3", label: "3+ étoiles" },
  ];

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-3 flex-wrap">
        {categories.length > 0 && (
          <Select
            options={[{ value: "", label: "Catégorie" }, ...categories]}
            value={filters.category || ""}
            onChange={(v) => updateFilter("category", v)}
            className="w-48"
          />
        )}
        
        {cities.length > 0 && (
          <Select
            options={[{ value: "", label: "Ville" }, ...cities]}
            value={filters.city || ""}
            onChange={(v) => updateFilter("city", v)}
            className="w-40"
          />
        )}

        <Select
          options={sortOptions}
          value={filters.sort || "relevance"}
          onChange={(v) => updateFilter("sort", v)}
          className="w-44"
        />

        <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
          {activeCount > 0 && <Badge variant="success">{activeCount}</Badge>}
        </Button>

        {activeCount > 0 && (
          <Button variant="ghost" onClick={clearFilters} className="gap-1 text-neutral-500">
            <X className="w-4 h-4" />
            Effacer
          </Button>
        )}
      </div>

      {showFilters && (
        <div className="rounded-lg border bg-white p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Notes</label>
              <Select options={ratingOptions} value={filters.rating || ""} onChange={(v) => updateFilter("rating", v)} className="w-full" />
            </div>
          </div>
        </div>
      )}

      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-neutral-500">Filtres:</span>
          {filters.category && <Badge variant="outline" className="gap-1">{categories.find(c => c.value === filters.category)?.label}<X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("category", "")} /></Badge>}
          {filters.city && <Badge variant="outline" className="gap-1">{cities.find(c => c.value === filters.city)?.label}<X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("city", "")} /></Badge>}
          {filters.rating && <Badge variant="outline" className="gap-1">{filters.rating}+ étoiles<X className="w-3 h-3 cursor-pointer" onClick={() => updateFilter("rating", "")} /></Badge>}
        </div>
      )}
    </div>
  );
}
