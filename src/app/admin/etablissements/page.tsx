"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Check, X, Eye } from "lucide-react";

interface Salon {
  id: string;
  name: string;
  slug: string;
  category: string;
  city: string;
  owner: string;
  status: "pending" | "active" | "rejected";
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export default function EtablissementsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    const mockSalons: Salon[] = [
      {
        id: "1",
        name: "Salon Elegance",
        slug: "salon-elegance-casablanca",
        category: "Coiffeur",
        city: "Casablanca",
        owner: "Sara Mansouri",
        status: "active",
        rating: 4.8,
        reviewCount: 124,
        createdAt: "2024-01-15",
      },
      {
        id: "2",
        name: "Barber House",
        slug: "barber-house-rabat",
        category: "Barbier",
        city: "Rabat",
        owner: "Karim Bennani",
        status: "active",
        rating: 4.9,
        reviewCount: 89,
        createdAt: "2024-02-01",
      },
      {
        id: "3",
        name: "Beauty Lounge",
        slug: "beauty-lounge-tanger",
        category: "Institut de beauté",
        city: "Tanger",
        owner: "Leila Tazi",
        status: "pending",
        rating: 0,
        reviewCount: 0,
        createdAt: "2024-03-10",
      },
      {
        id: "4",
        name: "Spa Zenith",
        slug: "spa-zenith-marrakech",
        category: "Spa",
        city: "Marrakech",
        owner: "Amina El Fassi",
        status: "active",
        rating: 4.7,
        reviewCount: 201,
        createdAt: "2024-01-20",
      },
    ];
    setSalons(mockSalons);
  }, []);

  const filteredSalons = salons.filter((salon) => {
    const matchesSearch =
      salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salon.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || salon.status === filter;
    return matchesSearch && matchesFilter;
  });

  function approveSalon(id: string) {
    setSalons((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "active" as const } : s))
    );
  }

  function rejectSalon(id: string) {
    setSalons((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" as const } : s))
    );
  }

  const statusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Actif</Badge>;
      case "pending":
        return <Badge variant="warning">En attente</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejeté</Badge>;
      default:
        return null;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Établissements</h1>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center border rounded-lg">
          {["all", "pending", "active", "rejected"].map((f) => (
            <button
              key={f}
              className={`px-3 py-1.5 text-sm font-medium ${
                filter === f
                  ? "bg-gray-900 text-white rounded-l-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "Tous" : f === "pending" ? "En attente" : f === "active" ? "Actifs" : "Rejetés"}
            </button>
          ))}
        </div>
      </div>

      {/* Salons list */}
      <div className="space-y-3">
        {filteredSalons.map((salon) => (
          <Card key={salon.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-gray-900">{salon.name}</h3>
                    {statusBadge(salon.status)}
                    <Badge variant="secondary">{salon.category}</Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{salon.city}</span>
                    <span>Propriétaire: {salon.owner}</span>
                    {salon.rating > 0 && (
                      <span>★ {salon.rating} ({salon.reviewCount} avis)</span>
                    )}
                    <span>Créé le {salon.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {salon.status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => approveSalon(salon.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => rejectSalon(salon.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
