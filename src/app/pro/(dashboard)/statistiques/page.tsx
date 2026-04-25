"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Users,
  Star,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function StatistiquesPage() {
  const [period, setPeriod] = useState<"day" | "week" | "month" | "year">("month");

  const stats = {
    revenue: { value: 12450, change: 15, label: "Chiffre d'affaires" },
    bookings: { value: 87, change: 8, label: "Réservations" },
    clients: { value: 45, change: 12, label: "Nouveaux clients" },
    occupancy: { value: 72, change: -3, label: "Taux d'occupation" },
    avgTicket: { value: 143, change: 7, label: "Ticket moyen" },
    satisfaction: { value: 4.6, change: 0.2, label: "Satisfaction" },
  };

  const topServices = [
    { name: "Coupe femme", count: 34, revenue: 5100, pct: 41 },
    { name: "Coloration", count: 18, revenue: 5400, pct: 22 },
    { name: "Brushing", count: 15, revenue: 1500, pct: 17 },
    { name: "Mèches", count: 8, revenue: 2000, pct: 10 },
    { name: "Soin capillaire", count: 12, revenue: 2400, pct: 10 },
  ];

  const topStaff = [
    { name: "Sara M.", bookings: 42, revenue: 6300, satisfaction: 4.8 },
    { name: "Karim B.", bookings: 28, revenue: 4200, satisfaction: 4.7 },
    { name: "Nadia L.", bookings: 17, revenue: 1950, satisfaction: 4.3 },
  ];

  const weeklyData = [
    { day: "Lun", revenue: 1800, bookings: 12 },
    { day: "Mar", revenue: 2100, bookings: 15 },
    { day: "Mer", revenue: 1900, bookings: 13 },
    { day: "Jeu", revenue: 2400, bookings: 17 },
    { day: "Ven", revenue: 2800, bookings: 20 },
    { day: "Sam", revenue: 3200, bookings: 23 },
    { day: "Dim", revenue: 0, bookings: 0 },
  ];

  const maxRevenue = Math.max(...weeklyData.map((d) => d.revenue));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analysez vos performances
          </p>
        </div>
        <div className="flex items-center border rounded-lg">
          {(["day", "week", "month", "year"] as const).map((p) => (
            <button
              key={p}
              className={`px-3 py-1.5 text-sm font-medium ${
                period === p
                  ? "bg-rose-600 text-white rounded-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              onClick={() => setPeriod(p)}
            >
              {p === "day" ? "Jour" : p === "week" ? "Semaine" : p === "month" ? "Mois" : "Année"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(stats).map(([key, stat]) => (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <span
                  className={`flex items-center text-xs font-medium ${
                    stat.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change >= 0 ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(stat.change)}%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {typeof stat.value === "number" && stat.value % 1 !== 0
                  ? stat.value.toFixed(1)
                  : stat.value.toLocaleString("fr-FR")}
                {key === "revenue" || key === "avgTicket" ? " DH" : ""}
                {key === "occupancy" ? "%" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="h-5 w-5 mr-2" />
              Revenus par jour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end space-x-2 h-48">
              {weeklyData.map((data) => (
                <div key={data.day} className="flex-1 flex flex-col items-center">
                  <p className="text-xs text-gray-500 mb-1">
                    {data.revenue > 0 ? `${data.revenue} DH` : ""}
                  </p>
                  <div
                    className="w-full bg-rose-500 rounded-t transition-all hover:bg-rose-600"
                    style={{
                      height: `${(data.revenue / maxRevenue) * 140}px`,
                      minHeight: data.revenue > 0 ? "8px" : "0",
                    }}
                  />
                  <span className="text-xs text-gray-400 mt-1">{data.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top staff */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Users className="h-5 w-5 mr-2" />
              Performance équipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topStaff.map((member) => (
                <div
                  key={member.name}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">
                      {member.bookings} RDV
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{member.revenue} DH</p>
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span className="text-xs ml-1">{member.satisfaction}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top services */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="h-5 w-5 mr-2" />
            Services les plus populaires
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topServices.map((service) => (
              <div key={service.name} className="flex items-center space-x-4">
                <span className="text-sm font-medium w-40 truncate">
                  {service.name}
                </span>
                <div className="flex-1">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full"
                      style={{ width: `${service.pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-500 w-16 text-right">
                  {service.count} RDV
                </span>
                <span className="text-sm font-medium w-20 text-right">
                  {service.revenue} DH
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
