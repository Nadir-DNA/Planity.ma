"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOROCCAN_CITIES } from "@/lib/constants";

const categoryChips = [
  { label: "Coiffeur", slug: "coiffeur" },
  { label: "Barbier", slug: "barbier" },
  { label: "Institut de beauté", slug: "institut-beaute" },
  { label: "Spa", slug: "spa" },
  { label: "Manucure", slug: "ongles" },
  { label: "Maquillage", slug: "maquillage" },
];

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`/recherche?${params.toString()}`);
  }

  function handleChipClick(slug: string) {
    const params = new URLSearchParams();
    params.set("category", slug);
    if (city) params.set("city", city);
    router.push(`/recherche?${params.toString()}`);
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center bg-surface pt-14">
      {/* Subtle surface shift for depth — no lines, no gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface-container-low to-surface" />

      <div className="relative z-10 mx-auto max-w-3xl px-5 text-center py-24">
        {/* Label */}
        <p className="text-xs uppercase tracking-widest text-on-surface-muted mb-6">
          Réservation beauté au Maroc
        </p>

        {/* Headline — extreme scale, tight tracking */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-tightest text-on-surface leading-none">
          Trouvez votre
          <br />
          <span className="text-on-surface-variant">salon idéal.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-on-surface-muted max-w-lg mx-auto leading-relaxed tracking-tight">
          Coiffeurs, barbiers, instituts et spas près de chez vous.
          Réservez en quelques clics.
        </p>

        {/* Search bar — architectural, no border radius excess */}
        <form
          onSubmit={handleSearch}
          className="mt-10 flex flex-col sm:flex-row gap-2 max-w-xl mx-auto"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Salon, service ou catégorie"
              className="w-full pl-10 pr-4 py-3 bg-surface-bright text-on-surface placeholder:text-on-surface-muted text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary transition-shadow"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-muted" />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="appearance-none pl-10 pr-8 py-3 bg-surface-bright text-on-surface-variant text-sm rounded-md focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-shadow"
            >
              <option value="">Toutes les villes</option>
              {MOROCCAN_CITIES.map((c) => (
                <option key={c} value={c.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-")}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-on-surface text-primary-on rounded-md px-6 py-3 text-sm font-medium"
          >
            Rechercher
          </Button>
        </form>

        {/* Category chips — ghost border, no fill */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categoryChips.map((chip) => (
            <button
              key={chip.slug}
              onClick={() => handleChipClick(chip.slug)}
              className="px-3.5 py-1.5 text-xs text-on-surface-muted hover:text-on-surface ghost-border rounded-md hover:bg-surface-container transition-all"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}