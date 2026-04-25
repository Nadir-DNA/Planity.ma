"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Building2 } from "lucide-react";

export default function AnalytiquesPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Analytiques</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Visiteurs ce mois</p>
            <p className="text-2xl font-bold">45,230</p>
            <p className="text-xs text-green-600 mt-1">+22% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Taux de conversion</p>
            <p className="text-2xl font-bold">8.5%</p>
            <p className="text-xs text-green-600 mt-1">+1.2% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">RDV/mois</p>
            <p className="text-2xl font-bold">8,562</p>
            <p className="text-xs text-green-600 mt-1">+12% vs mois dernier</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Taux de rétention</p>
            <p className="text-2xl font-bold">67%</p>
            <p className="text-xs text-green-600 mt-1">+3% vs mois dernier</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Croissance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1 px-2">
              {[30, 45, 38, 52, 48, 60, 55, 72, 68, 80, 75, 92].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(h / 100) * 160}px` }}
                  />
                  <span className="text-xs text-gray-400 mt-1">
                    {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Top villes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { city: "Casablanca", pct: 38 },
                { city: "Rabat", pct: 22 },
                { city: "Marrakech", pct: 17 },
                { city: "Tanger", pct: 8 },
                { city: "Fès", pct: 6 },
              ].map((city) => (
                <div key={city.city} className="flex items-center space-x-4">
                  <span className="text-sm font-medium w-24">{city.city}</span>
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-rose-500 rounded-full"
                        style={{ width: `${city.pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {city.pct}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
