"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Loader2,
  X,
  AlertTriangle,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Booking {
  id: string;
  reference: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  notes?: string;
  user: { id: string; name: string; phone?: string; email: string };
  items: {
    id: string;
    service: { id: string; name: string; price: number };
    staff: { id: string; displayName: string; color: string };
  }[];
}

export default function ProAgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const formatDateStr = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const fetchBookings = useCallback(async (date?: Date) => {
    const d = date || currentDate;
    try {
      const dateStr = formatDateStr(d);
      const res = await fetch(`/api/v1/pro/bookings?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch {
      toast.error("Erreur de chargement");
    }
  }, []);

  useEffect(() => {
    async function init() {
      setLoading(true);
      await fetchBookings(currentDate);
      setLoading(false);
    }
    init();
  }, [currentDate, fetchBookings]);

  const navigateDate = (direction: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + direction);
      return d;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Generate time slots 9h-20h
  const timeSlots = [];
  for (let h = 9; h <= 20; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 20) {
      timeSlots.push(`${h.toString().padStart(2, "0")}:30`);
    }
  }

  const getBookingsForSlot = (hour: number, minute: number) => {
    return bookings.filter((b) => {
      const start = new Date(b.startTime);
      return start.getHours() === hour && start.getMinutes() === minute;
    });
  };

  async function handleConfirmBooking(bookingId: string) {
    try {
      const res = await fetch(`/api/v1/pro/bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "CONFIRMED" }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Rendez-vous confirmé");
      setSelectedBooking(null);
      await fetchBookings(currentDate);
    } catch {
      toast.error("Erreur lors de la confirmation");
    }
  }

  async function handleCancelBooking(bookingId: string) {
    setCancelling(true);
    try {
      const res = await fetch(`/api/v1/pro/bookings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Rendez-vous annulé");
      setSelectedBooking(null);
      await fetchBookings(currentDate);
    } catch {
      toast.error("Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  }

  const statusLabels: Record<string, { label: string; colorClass: string }> = {
    PENDING: { label: "En attente", colorClass: "bg-yellow-50 text-yellow-700 border-yellow-200" },
    CONFIRMED: { label: "Confirmé", colorClass: "bg-green-50 text-green-700 border-green-200" },
    IN_PROGRESS: { label: "En cours", colorClass: "bg-blue-50 text-blue-700 border-blue-200" },
    CANCELLED: { label: "Annulé", colorClass: "bg-red-50 text-red-700 border-red-200" },
    COMPLETED: { label: "Terminé", colorClass: "bg-gray-50 text-gray-600 border-gray-200" },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Agenda</h1>
          <p className="text-sm text-gray-500 capitalize">
            {isToday(currentDate) ? "Aujourd'hui" : ""} {formatDate(currentDate)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)} className="h-8 w-8 p-0 rounded-md">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday} className="rounded-md">
            Aujourd&apos;hui
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigateDate(1)} className="h-8 w-8 p-0 rounded-md">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bookings Timeline */}
      {bookings.length === 0 ? (
        <Card className="border border-[rgba(198,198,198,0.2)] rounded-md">
          <CardContent className="py-16 text-center">
            <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Aucun rendez-vous pour cette journée</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {timeSlots.map((slot) => {
            const [h, m] = slot.split(":").map(Number);
            const slotBookings = getBookingsForSlot(h, m);
            if (slotBookings.length === 0) return null;

            return (
              <div key={slot} className="flex gap-3">
                <div className="w-12 text-right pr-2 pt-3">
                  <span className="text-xs text-gray-400 font-mono">{slot}</span>
                </div>
                <div className="flex-1 space-y-1">
                  {slotBookings.map((booking) => {
                    const statusInfo = statusLabels[booking.status] || { label: booking.status, colorClass: "bg-gray-50 text-gray-600 border-gray-200" };
                    return (
                      <Card
                        key={booking.id}
                        className="border border-[rgba(198,198,198,0.2)] rounded-md hover:border-[rgba(198,198,198,0.5)] transition-colors cursor-pointer"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        <CardContent className="py-2.5 px-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {booking.items[0]?.staff && (
                                <div
                                  className="w-2 h-8 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: booking.items[0].staff.color }}
                                />
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-black text-sm">
                                    {booking.user.name || "Client"}
                                  </p>
                                  <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded-md border ${statusInfo.colorClass}`}>
                                    {statusInfo.label}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                  {formatTime(booking.startTime)} — {formatTime(booking.endTime)} ·{" "}
                                  {booking.items.map((i) => i.service.name).join(", ")}
                                </p>
                                {booking.items[0]?.staff && (
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    avec {booking.items[0].staff.displayName}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-black">
                                {booking.totalPrice} DH
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Detail Panel */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border border-[rgba(198,198,198,0.2)] rounded-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-black">Détails du RDV</h2>
                <Button variant="ghost" size="sm" onClick={() => setSelectedBooking(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-black">{selectedBooking.user.name || "Client"}</span>
                </div>
                {selectedBooking.user.phone && (
                  <div className="text-sm text-gray-500 ml-6">
                    {selectedBooking.user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    {formatTime(selectedBooking.startTime)} — {formatTime(selectedBooking.endTime)}
                  </span>
                </div>
                <div className="text-sm text-gray-500 ml-6">
                  {new Date(selectedBooking.startTime).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </div>

                <div className="border-t border-[rgba(198,198,198,0.2)] pt-3">
                  <p className="text-sm font-medium text-black mb-2">Services</p>
                  {selectedBooking.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-600">
                        {item.service.name}
                        {item.staff && (
                          <span className="text-gray-400 ml-1">— {item.staff.displayName}</span>
                        )}
                      </span>
                      <span className="font-medium text-black">{item.service.price} DH</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-[rgba(198,198,198,0.2)] mt-2">
                    <span>Total</span>
                    <span>{selectedBooking.totalPrice} DH</span>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="text-sm text-gray-500">
                    <span className="font-medium">Notes:</span> {selectedBooking.notes}
                  </div>
                )}

                <div className="text-xs text-gray-400">
                  Réf: {selectedBooking.reference}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[rgba(198,198,198,0.2)]">
                {selectedBooking.status === "PENDING" && (
                  <Button
                    onClick={() => handleConfirmBooking(selectedBooking.id)}
                    className="bg-black text-white hover:bg-gray-800 rounded-md"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Confirmer
                  </Button>
                )}
                {(selectedBooking.status === "PENDING" || selectedBooking.status === "CONFIRMED") && (
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-md"
                    disabled={cancelling}
                    onClick={() => handleCancelBooking(selectedBooking.id)}
                  >
                    {cancelling ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-1" />
                    )}
                    Annuler le RDV
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}