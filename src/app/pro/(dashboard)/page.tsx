"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  Loader2,
  CalendarCheck,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "react-hot-toast";

interface Stats {
  bookingsToday: number;
  bookingsThisWeek: number;
  monthlyRevenue: number;
  newClientsThisMonth: number;
  pendingBookings: number;
  totalRevenue: number;
}

interface Booking {
  id: string;
  reference: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  notes?: string;
  user: { id: string; name: string; email: string; phone?: string };
  items: {
    id: string;
    service: { id: string; name: string; price: number };
    staff: { id: string; displayName: string; color: string };
  }[];
}

export default function ProDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [statsRes, bookingsRes] = await Promise.all([
          fetch("/api/v1/pro/stats"),
          fetch(`/api/v1/pro/bookings?date=${new Date().toISOString().split("T")[0]}`),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else {
          toast.error("Erreur de chargement des stats");
        }

        if (bookingsRes.ok) {
          const bookingsData = await bookingsRes.json();
          setTodayBookings(bookingsData.bookings || []);
        }
      } catch {
        toast.error("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("fr-MA") + " DH";
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Vue d&apos;ensemble de votre activité
        </p>
      </div>

      {/* Stats Cards - Clinical Atelier style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* RDV aujourd'hui */}
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  Aujourd&apos;hui
                </p>
                <p className="text-3xl font-bold text-black mt-1">
                  {stats?.bookingsToday ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Rendez-vous</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-[#f9f9f9] flex items-center justify-center">
                <Calendar className="h-5 w-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RDV cette semaine */}
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  Cette semaine
                </p>
                <p className="text-3xl font-bold text-black mt-1">
                  {stats?.bookingsThisWeek ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Rendez-vous</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-[#f9f9f9] flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CA du mois */}
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  Ce mois
                </p>
                <p className="text-3xl font-bold text-black mt-1">
                  {formatCurrency(stats?.monthlyRevenue ?? 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Chiffre d&apos;affaires</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-[#f9f9f9] flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nouveaux clients */}
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">
                  Nouveaux
                </p>
                <p className="text-3xl font-bold text-black mt-1">
                  {stats?.newClientsThisMonth ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Clients ce mois</p>
              </div>
              <div className="w-10 h-10 rounded-md bg-[#f9f9f9] flex items-center justify-center">
                <Users className="h-5 w-5 text-black" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending bookings alert */}
      {(stats?.pendingBookings ?? 0) > 0 && (
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">
                  {stats?.pendingBookings} rendez-vous en attente de confirmation
                </p>
                <p className="text-sm text-yellow-600">
                  Consultez l&apos;agenda pour confirmer ou annuler
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Bookings */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-3">
          Rendez-vous d&apos;aujourd&apos;hui
        </h2>
        {todayBookings.length === 0 ? (
          <EmptyState
            icon={CalendarCheck}
            title="Aucun rendez-vous aujourd'hui"
            description="Profitez de votre journée !"
          />
        ) : (
          <div className="space-y-2">
            {todayBookings.map((booking) => (
              <Card
                key={booking.id}
                className="border border-[rgba(198,198,198,0.2)] rounded-md hover:border-[rgba(198,198,198,0.4)] transition-colors"
              >
                <CardContent className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-center min-w-[50px]">
                        <p className="text-sm font-bold text-black">
                          {formatTime(booking.startTime)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatTime(booking.endTime)}
                        </p>
                      </div>
                      <div className="w-px h-10 bg-[rgba(198,198,198,0.2)]" />
                      <div>
                        <p className="font-medium text-black text-sm">
                          {booking.user.name || "Client"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.items.map((i) => i.service.name).join(", ")}
                        </p>
                        {booking.items[0]?.staff && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: booking.items[0].staff.color }}
                            />
                            <span className="text-xs text-gray-400">
                              {booking.items[0].staff.displayName}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-md ${
                          booking.status === "CONFIRMED"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : booking.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : booking.status === "IN_PROGRESS"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {booking.status === "CONFIRMED"
                          ? "Confirmé"
                          : booking.status === "PENDING"
                          ? "En attente"
                          : booking.status === "IN_PROGRESS"
                          ? "En cours"
                          : booking.status}
                      </span>
                      <p className="text-sm font-medium text-black mt-1">
                        {booking.totalPrice} DH
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}