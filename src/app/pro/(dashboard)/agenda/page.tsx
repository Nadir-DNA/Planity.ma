"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Loader2,
  X,
  Check,
  AlertTriangle,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Booking {
  id: string;
  reference: string;
  startTime: string;
  endTime: string;
  totalPrice: number;
  status: string;
  user: { name: string; phone: string; email: string };
  items: {
    id: string;
    service: { name: string; price: number };
    staff: { id: string; displayName: string; color: string };
  }[];
}

interface Staff {
  id: string;
  displayName: string;
  color: string;
  title?: string;
}

interface Salon {
  id: string;
  name: string;
}

export default function ProAgendaPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<"day" | "week">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // New booking form
  const [newBooking, setNewBooking] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    serviceId: "",
    staffId: "",
    date: "",
    time: "",
    duration: 30,
  });

  // Get start of week (Monday)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const dayStart = new Date(currentDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(currentDate);
  dayEnd.setHours(23, 59, 59, 999);

  // Generate time slots (8:00 - 20:00)
  const timeSlots = Array.from({ length: 25 }, (_, i) => {
    const h = 8 + Math.floor(i / 2);
    const m = i % 2 === 0 ? "00" : "30";
    return `${h.toString().padStart(2, "0")}:${m}`;
  });

  // Fetch salon data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // TODO: Get salonId from session/user
        const salonRes = await fetch("/api/v1/salons");
        if (salonRes.ok) {
          const salonData = await salonRes.json();
          if (salonData.salons?.[0]) {
            setSalon(salonData.salons[0]);
            const salonId = salonData.salons[0].id;

            // Fetch staff
            const staffRes = await fetch(`/api/v1/salons/${salonId}/staff`);
            if (staffRes.ok) {
              const staffData = await staffRes.json();
              setStaff(staffData.staff || []);
            }

            // Fetch bookings for the week
            await fetchBookings(salonId);
          }
        }
      } catch (err) {
        console.error("Failed to fetch agenda data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fetchBookings = useCallback(async (salonId?: string) => {
    if (!salonId && !salon?.id) return;
    const id = salonId || salon!.id;

    try {
      const startStr = weekStart.toISOString();
      const endStr = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await fetch(
        `/api/v1/bookings?salonId=${id}&status=CONFIRMED&startTime_gte=${startStr}&startTime_lte=${endStr}`
      );
      if (res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    }
  }, [salon, weekStart]);

  const navigateDate = (direction: number) => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      if (view === "day") {
        d.setDate(d.getDate() + direction);
      } else {
        d.setDate(d.getDate() + direction * 7);
      }
      return d;
    });
  };

  const getBookingsForDay = (date: Date, staffId?: string) => {
    return bookings.filter((b) => {
      const bookingDate = new Date(b.startTime);
      if (bookingDate.getDate() !== date.getDate()) return false;
      if (staffId) {
        return b.items.some((item) => item.staff.id === staffId);
      }
      return true;
    });
  };

  const getBookingPosition = (booking: Booking) => {
    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = (startHour - 8) * 48; // 48px per hour
    const height = (endHour - startHour) * 48;
    return { top, height };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500">
            {view === "day"
              ? formatDate(currentDate)
              : `${formatDate(weekStart)} — ${formatDate(weekDays[6])}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView(view === "day" ? "week" : "day")}
          >
            {view === "day" ? "Semaine" : "Jour"}
          </Button>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd&apos;hui
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateDate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau RDV
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardContent className="p-0">
          {view === "week" ? (
            /* Week View */
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Day headers */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-2 text-xs text-gray-500 border-r"></div>
                  {weekDays.map((day, i) => (
                    <div
                      key={i}
                      className={`p-2 text-center border-r last:border-r-0 ${
                        isToday(day) ? "bg-rose-50" : ""
                      }`}
                    >
                      <div className="text-xs text-gray-500">
                        {day.toLocaleDateString("fr-FR", { weekday: "short" })}
                      </div>
                      <div className={`text-lg font-bold ${isToday(day) ? "text-rose-600" : "text-gray-900"}`}>
                        {day.getDate()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Staff rows */}
                {staff.length > 0 ? (
                  staff.map((member) => (
                    <div key={member.id} className="grid grid-cols-8 border-b last:border-b-0">
                      {/* Staff label */}
                      <div className="p-2 border-r text-xs sticky left-0 bg-white">
                        <div
                          className="w-2 h-2 rounded-full mb-1"
                          style={{ backgroundColor: member.color }}
                        />
                        <span className="truncate block">{member.displayName.split(" ")[0]}</span>
                      </div>

                      {/* Day cells */}
                      {weekDays.map((day, dayIndex) => {
                        const dayBookings = getBookingsForDay(day, member.id);
                        return (
                          <div
                            key={dayIndex}
                            className={`border-r last:border-r-0 min-h-[60px] relative p-1 ${
                              isToday(day) ? "bg-rose-50/50" : ""
                            }`}
                          >
                            {dayBookings.map((booking) => {
                              const pos = getBookingPosition(booking);
                              return (
                                <div
                                  key={booking.id}
                                  className="absolute left-1 right-1 rounded text-xs cursor-pointer hover:opacity-80 overflow-hidden"
                                  style={{
                                    top: pos.top,
                                    height: Math.max(pos.height - 2, 20),
                                    backgroundColor: member.color + "20",
                                    borderLeft: `3px solid ${member.color}`,
                                  }}
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <div className="p-1 truncate">
                                    <div className="font-medium">
                                      {booking.items[0]?.service.name}
                                    </div>
                                    <div className="text-gray-500">
                                      {booking.user.name}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>Aucun membre d'équipe configuré</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Day View */
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {/* Day header */}
                <div className="grid grid-cols-8 border-b">
                  <div className="p-2 text-xs text-gray-500 border-r"></div>
                  {staff.map((member) => (
                    <div
                      key={member.id}
                      className={`p-2 text-center border-r last:border-r-0 ${
                        isToday(currentDate) ? "bg-rose-50" : ""
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full mx-auto mb-1"
                        style={{ backgroundColor: member.color }}
                      />
                      <span className="text-xs font-medium">{member.displayName}</span>
                    </div>
                  ))}
                </div>

                {/* Time grid */}
                {timeSlots.map((time) => {
                  const hour = parseInt(time.split(":")[0]);
                  const minute = parseInt(time.split(":")[1]);
                  const dayBookings = staff.flatMap((member) =>
                    getBookingsForDay(currentDate, member.id)
                      .filter((b) => {
                        const start = new Date(b.startTime);
                        return (
                          start.getHours() === hour && start.getMinutes() === minute
                        );
                      })
                      .map((b) => ({ ...b, staffId: b.items[0]?.staff.id }))
                  );

                  return (
                    <div key={time} className="grid grid-cols-8 border-b last:border-b-0 min-h-[48px]">
                      <div className="p-1 text-xs text-gray-500 border-r text-right pr-2 sticky left-0 bg-white">
                        {time}
                      </div>
                      {staff.map((member) => {
                        const slotBooking = dayBookings.find((b) => b.staffId === member.id);
                        return (
                          <div
                            key={member.id}
                            className={`border-r last:border-r-0 relative ${
                              isToday(currentDate) ? "bg-rose-50/30" : ""
                            }`}
                          >
                            {slotBooking && (
                              <div
                                className="absolute inset-1 rounded p-1 text-xs cursor-pointer hover:opacity-80"
                                style={{
                                  backgroundColor: member.color + "20",
                                  borderLeft: `3px solid ${member.color}`,
                                }}
                                onClick={() => setSelectedBooking(slotBooking)}
                              >
                                <div className="font-medium">
                                  {slotBooking.items[0]?.service.name}
                                </div>
                                <div className="text-gray-500 truncate">
                                  {slotBooking.user.name}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Nouveau rendez-vous</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client *
                  </label>
                  <input
                    type="text"
                    placeholder="Nom du client"
                    value={newBooking.clientName}
                    onChange={(e) => setNewBooking({ ...newBooking, clientName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+212 6XX-XXXXXX"
                      value={newBooking.clientPhone}
                      onChange={(e) => setNewBooking({ ...newBooking, clientPhone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="client@email.com"
                      value={newBooking.clientEmail}
                      onChange={(e) => setNewBooking({ ...newBooking, clientEmail: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service *
                  </label>
                  <select
                    value={newBooking.serviceId}
                    onChange={(e) => setNewBooking({ ...newBooking, serviceId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Sélectionnez un service</option>
                    {/* TODO: Fetch services from salon */}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professionnel *
                  </label>
                  <select
                    value={newBooking.staffId}
                    onChange={(e) => setNewBooking({ ...newBooking, staffId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">Sélectionnez</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.displayName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heure *
                    </label>
                    <select
                      value={newBooking.time}
                      onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="">Sélectionnez</option>
                      {timeSlots.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button onClick={() => {
                  toast("RDV créé avec succès !", { icon: "✅" });
                  setShowModal(false);
                  setNewBooking({
                    clientName: "", clientPhone: "", clientEmail: "",
                    serviceId: "", staffId: "", date: "", time: "", duration: 30,
                  });
                }}>
                  <Check className="h-4 w-4 mr-1" />
                  Créer le RDV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Détails du RDV</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedBooking(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-gray-400" />
                  <span>
                    {new Date(selectedBooking.startTime).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    {new Date(selectedBooking.startTime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} — {new Date(selectedBooking.endTime).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{selectedBooking.user.name}</span>
                </div>
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Services:</p>
                      {selectedBooking.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm py-1">
                          <span>{item.service.name}</span>
                          <span className="font-medium">{item.service.price} DH</span>
                        </div>
                      ))}
                  <div className="flex justify-between text-sm font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>{selectedBooking.totalPrice} DH</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  Réf: {selectedBooking.reference}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Annuler
                </Button>
                <Button size="sm">
                  <Check className="h-4 w-4 mr-1" />
                  Confirmer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
