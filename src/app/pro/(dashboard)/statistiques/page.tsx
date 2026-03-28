import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const stats = [
  {
    title: "Chiffre d'affaires",
    value: "24 500 DH",
    change: "+12%",
    trend: "up",
    icon: CreditCard,
  },
  {
    title: "Rendez-vous",
    value: "156",
    change: "+8%",
    trend: "up",
    icon: Calendar,
  },
  {
    title: "Nouveaux clients",
    value: "23",
    change: "+15%",
    trend: "up",
    icon: Users,
  },
  {
    title: "Taux d'occupation",
    value: "72%",
    change: "-3%",
    trend: "down",
    icon: TrendingUp,
  },
];

export default function StatsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d&apos;ensemble de ce mois
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <stat.icon className="h-5 w-5 text-gray-400" />
                <span
                  className={`flex items-center text-sm font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="h-4 w-4 ml-0.5" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 ml-0.5" />
                  )}
                </span>
              </div>
              <p className="text-2xl font-bold mt-2">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chiffre d&apos;affaires mensuel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2 px-4">
            {[65, 45, 70, 80, 55, 90, 72, 85, 68, 92, 78, 95].map(
              (height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-rose-500 rounded-t-md transition-all hover:bg-rose-600"
                    style={{ height: `${(height / 100) * 200}px` }}
                  />
                  <span className="text-xs text-gray-400 mt-2">
                    {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"][i]}
                  </span>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top services and staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Services les plus demandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Coupe femme", count: 48, revenue: 7200 },
                { name: "Coloration", count: 32, revenue: 9600 },
                { name: "Brushing", count: 28, revenue: 2800 },
                { name: "Coupe homme", count: 25, revenue: 2000 },
              ].map((service, i) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-gray-400 w-5">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">
                      {service.revenue} DH
                    </span>
                    <span className="text-xs text-gray-400 ml-2">
                      ({service.count} rdv)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance de l&apos;equipe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Sara M.", revenue: 10200, bookings: 65, occupation: 78 },
                { name: "Karim B.", revenue: 8500, bookings: 52, occupation: 72 },
                { name: "Nadia L.", revenue: 5800, bookings: 39, occupation: 65 },
              ].map((staff) => (
                <div key={staff.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 text-xs font-bold">
                      {staff.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{staff.name}</p>
                      <p className="text-xs text-gray-500">
                        {staff.bookings} rdv - {staff.occupation}% occupation
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold">{staff.revenue} DH</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
