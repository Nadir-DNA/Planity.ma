"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MOROCCAN_CITIES } from "@/lib/constants";

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

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-rose-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
            Reservez votre prochain
            <span className="text-rose-600"> rendez-vous beaute</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Trouvez les meilleurs salons de coiffure, barbiers, instituts de
            beaute et spas pres de chez vous au Maroc.
          </p>

          {/* Search form */}
          <form
            onSubmit={handleSearch}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Coiffeur, barbier, spa..."
                className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-base focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="relative sm:w-48">
              <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-8 text-base focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="">Toutes les villes</option>
                {MOROCCAN_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="lg" className="sm:w-auto">
              Rechercher
            </Button>
          </form>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-12 gap-y-4 text-center">
            <div>
              <p className="text-3xl font-bold text-gray-900">500+</p>
              <p className="text-sm text-gray-500">Salons partenaires</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">10 000+</p>
              <p className="text-sm text-gray-500">Reservations par mois</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">18</p>
              <p className="text-sm text-gray-500">Villes au Maroc</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
