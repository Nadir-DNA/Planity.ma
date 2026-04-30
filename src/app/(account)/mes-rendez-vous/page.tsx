"use client";

import { useEffect, useState, useCallback } from "react";
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
  ChevronLeft,
  ChevronRight,
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

type TabFilter = "upcoming" | "past" | "cancelled";

const statusConfig = {
  PENDING: { label: "En attente", className: "bg-[#eeeeee] text-gray-700" },
  CONFIRMED: { label: "Confirmé", className: "bg-gray-900 text-white" },
  COMPLETED: { label: "Terminé", className: "bg-gray-600 text-white" },
  CANCELLED: { label: "Annulé", className: "bg-[#eeeeee] text-gray-400 line-through" },
  NO_SHOW: { label: "Non présenté", className: "bg-[#eeeeee] text-gray-500" },
};

export default function AppointmentsPage() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabFilter>("upcoming");
  const [cancelModal, setCancelModal] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [rescheduleModal, setRescheduleModal] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!session?.user) return;
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
  }, [session]);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }
    if (session?.user) {
      fetchBookings();
    }
  }, [session, status, fetchBookings]);

  const now = new Date();

  const filteredBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.startTime);
    if (activeTab === "upcoming") {
      return bookingDate >= now && b.status !== "CANCELLED" && b.status !== "COMPLETED";
    }
    if (activeTab === "past") {
      return (bookingDate < now || b.status === "COMPLETED") && b.status !== "CANCELLED";
    }
    if (activeTab === "cancelled") {
      return b.status === "CANCELLED";
    }
    return true;
  });

  async function handleCancel() {
    if (!cancelModal) return;

    try {
      setCancelling(true);
      const res = await fetch(`/api/v1/bookings/${cancelModal}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancellationReason: cancelReason || undefined,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur annulation");
      }

      const data = await res.json();
      toast.success("Rendez-vous annulé avec succès");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelModal ? { ...b, status: "CANCELLED" as const, cancellationReason: cancelReason || null } : b
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

  function openRescheduleModal(bookingId: string) {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    const start = new Date(booking.startTime);
    const dateStr = start.toISOString().split("T")[0];
    const timeStr = start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    setRescheduleDate(dateStr);
    setRescheduleTime(timeStr);
    setRescheduleModal(bookingId);
  }

  async function handleReschedule() {
    if (!rescheduleModal) return;

    try {
      setRescheduling(true);
      const booking = bookings.find((b) => b.id === rescheduleModal);
      if (!booking) return;

      const originalDuration = new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime();
      const newStartTime = new Date(`${rescheduleDate}T${rescheduleTime}:00`);
      const newEndTime = new Date(newStartTime.getTime() + originalDuration);

      if (isNaN(newStartTime.getTime()) || isNaN(newEndTime.getTime())) {
        toast.error("Date ou heure invalide");
        return;
      }

      const res = await fetch(`/api/v1/bookings/${rescheduleModal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString(),
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors du report");
      }

      const data = await res.json();
      toast.success("Rendez-vous reporté avec succès");
      setBookings((prev) =>
        prev.map((b) =>
          b.id === rescheduleModal
            ? {
                ...b,
                startTime: data.booking.startTime,
                endTime: data.booking.endTime,
                items: data.booking.items,
              }
            : b
        )
      );
      setRescheduleModal(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors du report");
    } finally {
      setRescheduling(false);
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

  const tabs: { key: TabFilter; label: string }[] = [
    { key: "upcoming", label: "À venir" },
    { key: "past", label: "Passés" },
    { key: "cancelled", label: "Annulés" },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-900" />
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes rendez-vous</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => {
          const count =
            tab.key === "upcoming"
              ? bookings.filter((b) => new Date(b.startTime) >= now && b.status !== "CANCELLED" && b.status !== "COMPLETED").length
              : tab.key === "past"
              ? bookings.filter((b) => (new Date(b.startTime) < now || b.status === "COMPLETED") && b.status !== "CANCELLED").length
              : bookings.filter((b) => b.status === "CANCELLED").length;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 text-xs ${
                  activeTab === tab.key ? "text-gray-900" : "text-gray-400"
                }`}>
                  ({count})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Booking list */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-4 text-gray-500">
            {activeTab === "upcoming"
              ? "Aucun rendez-vous à venir"
              : activeTab === "cancelled"
              ? "Aucun rendez-vous annulé"
              : "Aucun rendez-vous passé"}
          </p>
          {activeTab === "upcoming" && (
            <Button
              className="mt-4 bg-gray-900 text-white hover:bg-gray-800 rounded-md"
              asChild
            >
              <Link href="/recherche">Réserver maintenant</Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const config = statusConfig[booking.status];
            const services = booking.items.map((i) => i.service.name);
            const duration = getDuration(booking.startTime, booking.endTime);
            const isActive = booking.status === "CONFIRMED" || booking.status === "PENDING";

            return (
              <Card
                key={booking.id}
                className="border rounded-md"
                style={{ borderColor: "rgba(198,198,198,0.2)" }}
              >
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/etablissement/${booking.salon.slug}`}
                          className="font-semibold text-gray-900 hover:underline"
                        >
                          {booking.salon.name}
                        </Link>
                        <Badge className={`${config.className} rounded-md text-xs font-medium border-0`}>
                          {config.label}
                        </Badge>
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
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-bold text-lg text-gray-900">
                        {booking.totalPrice} DH
                      </span>
                      {isActive && (
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-md border-gray-300 text-gray-700 hover:bg-gray-50"
                            onClick={() => openRescheduleModal(booking.id)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Reporter
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-md border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            onClick={() => setCancelModal(booking.id)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Annuler
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">
                      Ref: {booking.reference} •{" "}
                      {booking.source === "ONLINE"
                        ? "En ligne"
                        : booking.source === "PHONE"
                        ? "Téléphone"
                        : "En salon"}
                    </p>
                    {booking.cancellationReason && (
                      <p className="text-xs text-gray-400">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border rounded-md" style={{ borderColor: "rgba(198,198,198,0.2)" }}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-900">
                <AlertTriangle className="h-5 w-5" />
                <h2 className="font-semibold">Annuler ce rendez-vous ?</h2>
              </div>
              <p className="text-sm text-gray-600">
                Êtes-vous sûr de vouloir annuler ce rendez-vous ? Cette action est irréversible.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif (optionnel)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                  placeholder="Ex: Conflit d'horaire, urgence..."
                />
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="rounded-md"
                  onClick={() => {
                    setCancelModal(null);
                    setCancelReason("");
                  }}
                  disabled={cancelling}
                >
                  Retour
                </Button>
                <Button
                  className="bg-gray-900 text-white hover:bg-gray-800 rounded-md"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Confirmer l&apos;annulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reschedule modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border rounded-md" style={{ borderColor: "rgba(198,198,198,0.2)" }}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3 text-gray-900">
                <Pencil className="h-5 w-5" />
                <h2 className="font-semibold">Reporter le rendez-vous</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouvelle date
                  </label>
                  <input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouvelle heure
                  </label>
                  <input
                    type="time"
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900 text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  className="rounded-md"
                  onClick={() => setRescheduleModal(null)}
                  disabled={rescheduling}
                >
                  Retour
                </Button>
                <Button
                  className="bg-gray-900 text-white hover:bg-gray-800 rounded-md"
                  onClick={handleReschedule}
                  disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                >
                  {rescheduling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Confirmer le report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}