import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Building2,
  Calendar,
  CreditCard,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

const platformStats = [
  {
    title: "Utilisateurs totaux",
    value: "12,847",
    change: "+324 ce mois",
    icon: Users,
    color: "text-blue-600 bg-blue-100",
  },
  {
    title: "Salons actifs",
    value: "487",
    change: "+18 ce mois",
    icon: Building2,
    color: "text-green-600 bg-green-100",
  },
  {
    title: "Reservations (mois)",
    value: "8,562",
    change: "+12% vs mois dernier",
    icon: Calendar,
    color: "text-purple-600 bg-purple-100",
  },
  {
    title: "Volume transactions",
    value: "1.2M DH",
    change: "+15% vs mois dernier",
    icon: CreditCard,
    color: "text-rose-600 bg-rose-100",
  },
];

const recentActivity = [
  { type: "salon", text: "Nouveau salon: Beauty Lounge (Tanger)", time: "Il y a 2h" },
  { type: "review", text: "5 nouveaux avis en attente de moderation", time: "Il y a 3h" },
  { type: "user", text: "150 nouvelles inscriptions aujourd'hui", time: "Il y a 4h" },
  { type: "booking", text: "Record: 412 reservations hier", time: "Il y a 8h" },
  { type: "salon", text: "Salon Zenith (Marrakech) verifie", time: "Il y a 1j" },
];

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Plateforme
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d&apos;ensemble de Planity.ma
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {platformStats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
              <p className="text-xs text-green-600 mt-2">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth chart placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-gray-400" />
              Croissance utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between space-x-1 px-2">
              {[30, 45, 38, 52, 48, 60, 55, 72, 68, 80, 75, 92].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
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
            <CardTitle>Activite recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start justify-between">
                  <p className="text-sm text-gray-700">{activity.text}</p>
                  <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top cities */}
      <Card>
        <CardHeader>
          <CardTitle>Top villes par reservations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { city: "Casablanca", bookings: 3240, salons: 185, pct: 38 },
              { city: "Rabat", bookings: 1850, salons: 98, pct: 22 },
              { city: "Marrakech", bookings: 1420, salons: 76, pct: 17 },
              { city: "Tanger", bookings: 680, salons: 42, pct: 8 },
              { city: "Fes", bookings: 520, salons: 35, pct: 6 },
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
                <span className="text-sm text-gray-500 w-20 text-right">
                  {city.bookings} rdv
                </span>
                <span className="text-xs text-gray-400 w-16 text-right">
                  {city.salons} salons
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
