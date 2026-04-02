"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Check, X, Eye } from "lucide-react";

const mockSalons = [
  {
    id: "1",
    name: "Salon Elegance",
    city: "Casablanca",
    category: "Coiffeur",
    owner: "Sara Mansouri",
    status: "active",
    verified: true,
    bookings: 245,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Barber House",
    city: "Rabat",
    category: "Barbier",
    owner: "Ahmed Khalil",
    status: "active",
    verified: true,
    bookings: 189,
    createdAt: "2024-02-01",
  },
  {
    id: "3",
    name: "Beaute Plus",
    city: "Marrakech",
    category: "Institut",
    owner: "Nadia Benali",
    status: "pending",
    verified: false,
    bookings: 0,
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Zen Spa",
    city: "Tanger",
    category: "Spa",
    owner: "Karim Tazi",
    status: "active",
    verified: true,
    bookings: 156,
    createdAt: "2024-01-20",
  },
];

export default function AdminSalonsPage() {
  const [search, setSearch] = useState("");

  const filtered = mockSalons.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etablissements</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mockSalons.length} salons enregistres
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Rechercher un salon..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Badge variant="outline" className="cursor-pointer hover:bg-gray-50 flex items-center">
          En attente (1)
        </Badge>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-medium text-gray-500">Salon</th>
                  <th className="text-left p-4 font-medium text-gray-500">Ville</th>
                  <th className="text-left p-4 font-medium text-gray-500">Categorie</th>
                  <th className="text-left p-4 font-medium text-gray-500">Proprietaire</th>
                  <th className="text-left p-4 font-medium text-gray-500">Statut</th>
                  <th className="text-left p-4 font-medium text-gray-500">Reservations</th>
                  <th className="text-left p-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((salon) => (
                  <tr key={salon.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{salon.name}</span>
                        {salon.verified && (
                          <Check className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{salon.city}</td>
                    <td className="p-4">
                      <Badge variant="secondary">{salon.category}</Badge>
                    </td>
                    <td className="p-4 text-gray-600">{salon.owner}</td>
                    <td className="p-4">
                      <Badge
                        variant={salon.status === "active" ? "success" : "warning"}
                      >
                        {salon.status === "active" ? "Actif" : "En attente"}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">{salon.bookings}</td>
                    <td className="p-4">
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!salon.verified && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600">
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
