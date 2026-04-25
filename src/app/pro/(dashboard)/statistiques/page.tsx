"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  Star,
  Download,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Stats {
  totalBookings: number;
  totalRevenue: number;
  newClients: number;
  averageRating: number;
  occupancyRate: number;
  topServices: { name: string; count: number; revenue: number }[];
  topStaff: { name: string; bookings: number; revenue: number }[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export default function ProStatistiquesPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"month" | "quarter" | "year">("month");
  const [expandedSection, setExpandedSection] = useState<string>("revenue");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Mock data for now
        const mockStats: Stats = {
          totalBookings: 156,
          totalRevenue: 28450,
          newClients: 42,
          averageRating: 4.7,
          occupancyRate: 78,
          topServices: [
            { name: "Coupe femme", count: 45, revenue: 6750 },
            { name: "Coloration", count: 32, revenue: 9600 },
            { name: "Brushing", count: 28, revenue: 2800 },
            { name: "Hammam", count: 25, revenue: 5000 },
            { name: "Massage", count: 20, revenue: 4000 },
          ],
          topStaff: [
            { name: "Sara M.", bookings: 58, revenue: 10200 },
            { name: "Karim B.", bookings: 45, revenue: 8500 },
            { name: "Nadia L.", bookings: 38, revenue: 6200 },
            { name: "Amina K.", bookings: 15, revenue: 3550 },
          ],
          monthlyRevenue: [
            { month: "Jan", revenue: 22000 },
            { month: "Fév", revenue: 24500 },
            { month: "Mar", revenue: 28450 },
            { month: "Avr", revenue: 26000 },
            { month: "Mai", revenue: 29000 },
            { month: "Jun", revenue: 31000 },
          ],
        };
        setStats(mockStats);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function exportPDF() {
    toast("Rapport PDF en cours de génération...", { icon: "📊" });
    setTimeout(() => {
      toast.success("Rapport téléchargé !", { icon: "✅" });
    }, 2000);
  }

  function toggleSection(section: string) {
    setExpandedSection(expandedSection === section ? "" : section);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!stats) return null;

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-sm text-gray-500">
            Vue d'ensemble de votre activité
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as "month" | "quarter" | "year")}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
          <Button variant="outline" size="sm" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">RDV ce mois</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Revenus</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toLocaleString()} DH</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Nouveaux clients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.newClients}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15% vs mois dernier
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Note moyenne</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating}/5</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              Basé sur {stats.totalBookings} avis
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("revenue")}
          >
            <h2 className="text-lg font-semibold">Revenus mensuels</h2>
            {expandedSection === "revenue" ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
          {expandedSection === "revenue" && (
            <div className="mt-4">
              <div className="flex items-end gap-2 h-40">
                {stats.monthlyRevenue.map((m) => (
                  <div key={m.month} className="flex-1 flex flex-col items-center">
                    <span className="text-xs font-medium text-gray-600 mb-1">
                      {(m.revenue / 1000).toFixed(0)}k
                    </span>
                    <div
                      className="w-full bg-rose-500 rounded-t transition-all hover:bg-rose-600"
                      style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className="text-xs text-gray-500 mt-1">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Services & Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Services */}
        <Card>
          <CardContent className="pt-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("services")}
            >
              <h2 className="text-lg font-semibold">Services populaires</h2>
              {expandedSection === "services" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {expandedSection === "services" && (
              <div className="mt-4 space-y-3">
                {stats.topServices.map((service, i) => (
                  <div key={service.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{service.name}</p>
                        <p className="text-xs text-gray-500">{service.count} RDV</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{service.revenue.toLocaleString()} DH</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Staff */}
        <Card>
          <CardContent className="pt-6">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection("staff")}
            >
              <h2 className="text-lg font-semibold">Performance équipe</h2>
              {expandedSection === "staff" ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
            {expandedSection === "staff" && (
              <div className="mt-4 space-y-3">
                {stats.topStaff.map((member, i) => (
                  <div key={member.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-600">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.bookings} RDV</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{member.revenue.toLocaleString()} DH</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Rate */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection("occupancy")}
          >
            <h2 className="text-lg font-semibold">Taux d'occupation</h2>
            {expandedSection === "occupancy" ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
          {expandedSection === "occupancy" && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{stats.occupancyRate}%</span>
                <span className="text-sm text-gray-500">Objectif: 85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-rose-500 rounded-full h-4 transition-all"
                  style={{ width: `${stats.occupancyRate}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Vos professionnels sont occupés {stats.occupancyRate}% du temps disponible.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
