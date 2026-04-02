"use client";

import { useQuery } from "@tanstack/react-query";

interface SearchParams {
  q?: string;
  city?: string;
  category?: string;
  sortBy?: string;
  page?: number;
  minRating?: number;
}

async function fetchSearch(params: SearchParams) {
  const searchParams = new URLSearchParams();
  if (params.q) searchParams.set("q", params.q);
  if (params.city) searchParams.set("city", params.city);
  if (params.category) searchParams.set("category", params.category);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.page) searchParams.set("page", params.page.toString());
  if (params.minRating) searchParams.set("minRating", params.minRating.toString());

  const res = await fetch(`/api/v1/search?${searchParams}`);
  if (!res.ok) throw new Error("Erreur lors de la recherche");
  return res.json();
}

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["search", params],
    queryFn: () => fetchSearch(params),
    enabled: !!(params.q || params.city || params.category),
  });
}
