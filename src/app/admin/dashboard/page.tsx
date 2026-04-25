"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Check,
  X,
  Eye,
  BarChart3,
  Users,
  Building2,
  Star,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface DashboardStats {
  totalSalons: number;
  activeSalons: number;
  pendingSalons: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  monthlyGrowth: number;
}

interface RecentActivity {
  id: string;
  type: "salon" | "booking" | "user" | "review";
  action: string;
  entity: string;
  date: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Mock data
        const mockStats: DashboardStats = {
          totalSalons: 156,
          activeSalons: 142,
          pendingSalons: 14,
          totalUsers: 2847,
          totalBookings: 5432,
          totalRevenue: 1245600,
          averageRating: 4.6,
          monthlyGrowth: 12.5,
        };
        setStats(mockStats);

        const mockActivities: RecentActivity[] = [
          { id: "a1", type: "salon", action: "Nouveau salon inscrit", entity: "Salon Belle Femme - Marrakech", date: "2024-03-20T14:30:00Z" },
          { id: "a2", type: "booking", action: "150 réservations aujourd'hui", entity: "+12% vs hier", date: "2024-03-20T12:00:00Z" },
          { id: "a3", type: "user", action: "Nouveau utilisateur", entity: "fatima.z@email.com", date: "2024-03-20T10:15:00Z" },
          { id: "a4", type: "review", action: "Avis signalé", entity: "Spa Zenith - Marrakech", date: "2024-03-19T16:45:00Z" },
          { id: "a5", type: "salon", action: "Salon approuvé", entity: "Barber House - Rabat", date: "2024-03-19T09:30:00Z" },
        ];
        setRecentActivities(mockActivities);
      } catch (err) {
        toast.error("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function getActivityIcon(type: string) {
    switch (type) {
      case "salon":
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case "booking":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "user":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "review":
        return <Star className="h-4 w-4 text-yellow-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-sm text-gray-500">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Salons actifs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeSalons}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-orange-600">
              <span>{stats.pendingSalons} en attente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{stats.monthlyGrowth}% ce mois
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">RDV ce mois</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <span>Revenu: {(stats.totalRevenue / 1000).toFixed(0)}k DH</span>
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
              <span>Basé sur {stats.totalBookings} avis</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start">
              <Building2 className="h-4 w-4 mr-2" />
              Salons en attente ({stats.pendingSalons})
            </Button>
            <Button variant="outline" className="justify-start">
              <Star className="h-4 w-4 mr-2" />
              Avis à modérer
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="h-4 w-4 mr-2" />
              Gérer utilisateurs
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Voir statistiques
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold mb-4">Activité récente</h2>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                {getActivityIcon(activity.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.entity}</p>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(activity.date)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
