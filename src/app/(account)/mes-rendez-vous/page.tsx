"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  MapPin,
  Pencil,
  X,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface BookingItem {
  id: string;
  service: { name: string; price: number };
  staff: { displayName: string };
  startTime: string;
  endTime: string;
  price: number;
}

interface Booking {
  id: string;
  reference: string;
  salon: { id: string; name: string; slug: string; city: string; address: string };
  user: { id: string; name: string; email: string; phone: string };
  items: BookingItem[];
  payment: { id: string; status: string } | null;
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  startTime: string;
  endTime: string;
  totalPrice: number;
  notes: string | null;
  cancellationReason: string | null;
  source: "ONLINE" | "IN_SALON" | "PHONE";
  createdAt: string;
}

const statusConfig = {
  PENDING: { label: "En attente", variant: "warning" as const, color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmé", variant: "default" as const, color: "bg-green-100 text-green-800" },
  COMPLETED: { label: "Terminé", variant: "success" as const, color: "bg-gray-100 text-gray-800" },
  CANCELLED: { label: "Annulé", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
  NO_SHOW: { label: "Non présenté", variant: "destructive" as const, color: "bg-orange-100 text-orange-800" },
};

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("upcoming");
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    async function fetchBookings() {
      try {
        setLoading(true);
        const userId = (session?.user as any)?.id;
        if (!userId) return;

        const res = await fetch(`/api/v1/bookings?userId=${userId}`);
        if (!res.ok) throw new Error("Erreur chargement");

        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        toast.error("Impossible de charger vos rendez-vous");
      } finally {
        setLoading(false);
      }
    }

    if (session?.user) {
      fetchBookings();
    }
  }, [session, status]);

  const filteredBookings = bookings.filter((b) => {
    const now = new Date();
    const bookingDate = new Date(b.startTime);
    if (filter === "upcoming") return bookingDate >= now && !["CANCELLED", "COMPLETED"].includes(b.status);
    if (filter === "past") return bookingDate < now || ["CANCELLED", "COMPLETED"].includes(b.status);
    return true;
  });

  async function handleCancel() {
    if (!cancelModal) return;

    try {
      setCancelling(true);
      const res = await fetch(`/api/v1/bookings`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: cancelModal,
          reason: cancelReason || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur annulation");
      }

      toast.success("Rendez-vous annulé avec succès");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelModal ? { ...b, status: "CANCELLED" as const } : b
        )
      );
      setCancelModal(null);
      setCancelReason("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getDuration(startTime: string, endTime: string): number {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    return Math.round((end - start) / 60000);
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center py-16">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
        <p className="mt-4 text-gray-500">Connectez-vous pour voir vos rendez-vous</p>
        <Button className="mt-4" asChild>
          <Link href="/connexion?callbackUrl=/mes-rendez-vous">Se connecter</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
        <div className="flex gap-2">
          {(["upcoming", "past", "all"] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f)}
            >
              {f === "upcoming" ? "À venir" : f === "past" ? "Passés" : "Tous"}
            </Button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-4 text-gray-500">
            {filter === "upcoming"
              ? "Aucun rendez-vous à venir"
              : "Aucun rendez-vous"}
          </p>
          {filter === "upcoming" && (
            <Button className="mt-4" asChild>
              <Link href="/recherche">Réserver un rendez-vous</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const config = statusConfig[booking.status];
            const services = booking.items.map((i) => i.service.name);
            const duration = getDuration(booking.startTime, booking.endTime);

            return (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 flex-wrap">
                        <Link
                          href={`/etablissement/${booking.salon.slug}`}
                          className="font-semibold text-gray-900 hover:text-rose-600"
                        >
                          {booking.salon.name}
                        </Link>
                        <Badge className={config.color}>{config.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {services.join(", ")}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="h-3.5 w-3.5 mr-1" />
                          {formatDate(booking.startTime)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatTime(booking.startTime)} ({duration} min)
                        </span>
                        <span className="flex items-center">
                          <MapPin className="h-3.5 w-3.5 mr-1" />
                          {booking.salon.city}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-lg">
                        {booking.totalPrice} DH
                      </span>
                      {(booking.status === "CONFIRMED" || booking.status === "PENDING") && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              toast("Modification bientôt disponible", { icon: "🚧" });
                            }}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => setCancelModal(booking.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Annuler
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                      Ref: {booking.reference} • {booking.source === "ONLINE" ? "En ligne" : booking.source === "PHONE" ? "Téléphone" : "En salon"}
                    </p>
                    {booking.cancellationReason && (
                      <p className="text-xs text-red-500">
                        Motif: {booking.cancellationReason}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="font-semibold">Annuler ce rendez-vous ?</h2>
              </div>
              <p className="text-sm text-gray-600">
                Êtes-vous sûr de vouloir annuler ce rendez-vous ?
                Vous pourrez en réserver un autre à tout moment.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif (optionnel)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Ex: Conflit d'horaire, urgence..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCancelModal(null);
                    setCancelReason("");
                  }}
                  disabled={cancelling}
                >
                  Retour
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Confirmer l'annulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
