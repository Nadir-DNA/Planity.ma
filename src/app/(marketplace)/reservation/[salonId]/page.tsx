"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CreditCard,
  Loader2,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import { toast } from "react-hot-toast";

const STEPS = ["Service", "Professionnel", "Date & Heure", "Confirmation"];

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string;
}

interface Staff {
  id: string;
  displayName: string;
  title?: string;
  color: string;
  avatar?: string;
}

interface AvailabilitySlot {
  staffId: string;
  staffName: string;
  staffColor: string;
  slots: { start: string; end: string }[];
}

interface AvailabilityResult {
  date: string;
  salonId: string;
  availability: AvailabilitySlot[];
}

// Next-available-days data returned from batch API
interface DayAvailability {
  date: string;
  dayLabel: string;
  slotCount: number;
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const salonId = params?.salonId as string;

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [salonName, setSalonName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Availability state
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Next-available-days for quick selection after staff pick
  const [nextDays, setNextDays] = useState<DayAvailability[]>([]);
  const [nextDaysLoading, setNextDaysLoading] = useState(false);

  // Fetch salon services and staff
  useEffect(() => {
    if (!salonId) return;

    async function fetchData() {
      try {
        setLoading(true);
        const salonRes = await fetch(`/api/v1/salons/${salonId}`);
        if (!salonRes.ok) {
          throw new Error("Impossible de charger les données du salon");
        }
        const salonData = await salonRes.json();

        const staffRes = await fetch(`/api/v1/salons/${salonId}/staff`);
        if (!staffRes.ok) {
          throw new Error("Impossible de charger l'équipe");
        }
        const staffData = await staffRes.json();

        setServices(salonData.salon?.services || []);
        setStaff(staffData.staff || []);
        setSalonName(salonData.salon?.name || "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [salonId]);

  // Fetch next 7 days availability when staff is selected (for quick-pick)
  const fetchNextDays = useCallback(async () => {
    if (!salonId) return;
    try {
      setNextDaysLoading(true);
      const staffParam = selectedStaff ? `&staffId=${selectedStaff}` : "";
      const serviceParam = selectedServices.length === 1 ? `&serviceId=${selectedServices[0]}` : "";

      const days: DayAvailability[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check next 14 days
      for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const dayLabel = i === 0
          ? "Aujourd'hui"
          : i === 1
            ? "Demain"
            : `${DAYS_FR[d.getDay() === 0 ? 6 : d.getDay() - 1]} ${d.getDate()}`;

        days.push({ date: dateStr, dayLabel, slotCount: -1 }); // -1 = unknown
      }

      // Batch fetch availability for next 7 days
      const results = await Promise.allSettled(
        days.slice(0, 7).map(async (day) => {
          const res = await fetch(
            `/api/v1/availability?salonId=${salonId}&date=${day.date}${staffParam}${serviceParam}`
          );
          if (!res.ok) return { ...day, slotCount: 0 };
          const data = await res.json();
          const totalSlots = (data.availability || []).reduce(
            (sum: number, s: AvailabilitySlot) => sum + s.slots.length,
            0
          );
          return { ...day, slotCount: totalSlots };
        })
      );

      const fetchedDays: DayAvailability[] = results.map((r, i) =>
        r.status === "fulfilled" ? r.value : { ...days[i], slotCount: 0 }
      );
      setNextDays(fetchedDays);
    } catch (err) {
      console.error("Next days fetch error:", err);
    } finally {
      setNextDaysLoading(false);
    }
  }, [salonId, selectedStaff, selectedServices]);

  // Fetch availability when date changes
  const fetchAvailability = useCallback(async (date: Date) => {
    if (!date || !salonId) return;

    try {
      setAvailabilityLoading(true);
      const dateStr = date.toISOString().split("T")[0];
      const serviceId = selectedServices.length === 1 ? selectedServices[0] : undefined;
      const staffId = selectedStaff || undefined;

      const queryParams = new URLSearchParams({
        salonId,
        date: dateStr,
        ...(serviceId && { serviceId }),
        ...(staffId && { staffId }),
      });

      const res = await fetch(`/api/v1/availability?${queryParams}`);
      if (!res.ok) throw new Error("Erreur chargement disponibilités");

      const data = await res.json();
      setAvailability(data);
    } catch (err) {
      console.error("Availability fetch error:", err);
    } finally {
      setAvailabilityLoading(false);
    }
  }, [salonId, selectedServices, selectedStaff]);

  useEffect(() => {
    if (selectedDate && step >= 2) {
      fetchAvailability(selectedDate);
    }
  }, [selectedDate, step, fetchAvailability]);

  // Format selectedDate for display
  const selectedDateStr = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : "";

  const totalPrice = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.price, 0);

  const totalDuration = services
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.duration, 0);

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
    setAvailability(null);
    setSelectedTime(null);
  }

  // Format date for display
  function formatDateDisplay(dateStr: string): string {
    const d = new Date(dateStr + "T00:00:00");
    const dayName = DAYS_FR[d.getDay() === 0 ? 6 : d.getDay() - 1];
    const month = MONTHS_FR[d.getMonth()];
    return `${dayName} ${d.getDate()} ${month}`;
  }

  async function submitBooking() {
    if (!user) {
      router.push(`/connexion?callbackUrl=/reservation/${salonId}`);
      return;
    }

    if (!selectedDate || !selectedTime || selectedServices.length === 0) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        salonId,
        services: selectedServices.map((serviceId) => ({
          serviceId,
          staffId: selectedStaff || undefined,
        })),
        date: selectedDateStr,
        time: selectedTime,
        notes: notes || undefined,
      };

      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Erreur lors de la réservation");
      }

      const { booking } = await res.json();
      toast.success(`Réservation confirmée ! Référence: ${booking.reference}`);
      router.push(`/mes-rendez-vous`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la réservation");
    } finally {
      setLoading(false);
    }
  }

  if (loading && step === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-4">
        <div className="h-8 w-48 bg-neutral-100 animate-pulse rounded" />
        <div className="h-4 w-32 bg-neutral-100 animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-neutral-100 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
            <Button variant="outline" className="mt-4" onClick={() => router.back()}>
              Retour
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8 pb-28 sm:pb-8">
      <h1 className="text-2xl font-bold text-black mb-2">
        Prendre rendez-vous
      </h1>
      {salonName && (
        <p className="text-sm text-neutral-500 mb-6">{salonName}</p>
      )}

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i <= step
                  ? "bg-black text-white"
                  : "bg-neutral-100 text-neutral-400"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden sm:block ml-2 text-sm ${
                i <= step ? "text-black font-medium" : "text-neutral-400"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 ${
                  i < step ? "bg-black" : "bg-neutral-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Service selection */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Choisissez vos services</CardTitle>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-neutral-500 text-center py-4">
                Aucun service disponible pour ce salon.
              </p>
            ) : (
              <div className="space-y-3">
                {services.filter((s) => !("isOnlineBookable" in s) || (s as any).isOnlineBookable !== false).map((service) => (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-md border transition-colors text-left ${
                      selectedServices.includes(service.id)
                        ? "border-black bg-neutral-50"
                        : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div>
                      <p className="font-medium text-black">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-neutral-500 mt-0.5">{service.description}</p>
                      )}
                      <p className="text-sm text-neutral-500 mt-1">
                        <Clock className="inline h-3.5 w-3.5 mr-1" />
                        {service.duration} min
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold tabular-nums">{service.price} DH</span>
                      {selectedServices.includes(service.id) && (
                        <Check className="h-5 w-5 text-black" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Staff selection + Next availabilities */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choisissez votre professionnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedStaff(null);
                  setAvailability(null);
                  setSelectedTime(null);
                }}
                className={`w-full flex items-center p-4 rounded-md border transition-colors ${
                  selectedStaff === null
                    ? "border-black bg-neutral-50"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <User className="h-10 w-10 text-neutral-400 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-black">Pas de préférence</p>
                  <p className="text-sm text-neutral-500">Premier disponible</p>
                </div>
              </button>
              {staff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => {
                    setSelectedStaff(member.id);
                    setAvailability(null);
                    setSelectedTime(null);
                  }}
                  className={`w-full flex items-center p-4 rounded-md border transition-colors ${
                    selectedStaff === member.id
                      ? "border-black bg-neutral-50"
                      : "border-neutral-200 hover:border-neutral-300"
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.displayName[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-black">{member.displayName}</p>
                    {member.title && (
                      <p className="text-sm text-neutral-500">{member.title}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Next availabilities quick-pick */}
            {selectedStaff !== null && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Prochaines disponibilités
                </h3>
                {nextDaysLoading ? (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex-1 h-20 bg-neutral-100 animate-pulse rounded-md" />
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {nextDays.map((day) => (
                      <button
                        key={day.date}
                        onClick={() => {
                          const d = new Date(day.date + "T00:00:00");
                          setSelectedDate(d);
                          setSelectedTime(null);
                          setSelectedEnd(null);
                        }}
                        disabled={day.slotCount === 0}
                        className={`flex-shrink-0 min-w-[72px] p-2 rounded-md border text-center transition-colors ${
                          selectedDateStr === day.date
                            ? "border-black bg-black text-white"
                            : day.slotCount === 0
                              ? "border-neutral-100 text-neutral-300 cursor-not-allowed"
                              : day.slotCount === -1
                                ? "border-neutral-200 text-neutral-500"
                                : "border-neutral-200 hover:border-neutral-300 text-black"
                        }`}
                      >
                        <p className="text-xs font-medium">{day.dayLabel.split(" ")[0]}</p>
                        <p className="text-lg font-semibold tabular-nums">{day.date.split("-")[2]}</p>
                        {day.slotCount > 0 && (
                          <p className={`text-[10px] mt-0.5 ${selectedDateStr === day.date ? "text-white" : "text-neutral-500"}`}>
                            {day.slotCount} créneau{day.slotCount > 1 ? "x" : ""}
                          </p>
                        )}
                        {day.slotCount === 0 && (
                          <p className="text-[10px] mt-0.5 text-neutral-300">Fermé</p>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Date & Time */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choisissez la date et l&apos;heure</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mini summary of selected services */}
            {selectedServices.length > 0 && (
              <div className="mb-6 p-3 rounded-md border border-neutral-200 bg-neutral-50">
                <h4 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-2">Résumé</h4>
                <div className="space-y-1">
                  {services
                    .filter((s) => selectedServices.includes(s.id))
                    .map((s) => (
                      <div key={s.id} className="flex justify-between text-sm">
                        <span className="text-black">{s.name}</span>
                        <span className="text-black tabular-nums">{s.price} DH</span>
                      </div>
                    ))}
                  <div className="pt-1 mt-1 border-t border-neutral-200 flex justify-between text-sm font-bold">
                    <span>Total</span>
                    <span className="tabular-nums">{totalPrice} DH</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Custom Calendar instead of native date input */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">
                  <CalendarDays className="inline h-4 w-4 mr-1" />
                  Sélectionnez une date
                </label>
                <Calendar
                  selectedDate={selectedDate || undefined}
                  onDateSelect={(d) => {
                    setSelectedDate(d);
                    setSelectedTime(null);
                    setSelectedEnd(null);
                  }}
                  minDate={new Date()}
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">
                    <Clock className="inline h-4 w-4 mr-1" />
                    Créneaux disponibles — {formatDateDisplay(selectedDateStr)}
                  </label>
                  {availabilityLoading ? (
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-10 bg-neutral-100 animate-pulse rounded-md" />
                      ))}
                    </div>
                  ) : availability?.availability && availability.availability.length > 0 ? (
                    <div className="space-y-4">
                      {availability.availability.map((staffAvail) => (
                        <div key={staffAvail.staffId}>
                          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-2">
                            {staffAvail.staffName}
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {staffAvail.slots.map((slot) => (
                              <button
                                key={slot.start}
                                onClick={() => {
                                  setSelectedTime(slot.start);
                                  setSelectedEnd(slot.end);
                                }}
                                className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                                  selectedTime === slot.start
                                    ? "bg-black text-white"
                                    : "bg-neutral-50 text-black hover:bg-neutral-100"
                                }`}
                              >
                                {slot.start}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-neutral-500">
                      <p>Aucun créneau disponible pour cette date.</p>
                      <p className="text-sm mt-1">Essayez une autre date ou un autre professionnel.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Confirmation */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Booking details */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Professionnel</span>
                  <span className="font-medium text-black">
                    {selectedStaff
                      ? staff.find((s) => s.id === selectedStaff)?.displayName
                      : "Premier disponible"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-200">
                  <span className="text-neutral-500">Date & Heure</span>
                  <span className="font-medium text-black">
                    {selectedDate ? formatDateDisplay(selectedDateStr) : selectedDateStr} à {selectedTime}
                  </span>
                </div>
              </div>

              {/* Price total section */}
              <div className="border border-neutral-200 rounded-md p-4 bg-neutral-50">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-3">
                  Détail des services
                </h3>
                <div className="space-y-2">
                  {services
                    .filter((s) => selectedServices.includes(s.id))
                    .map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="text-black">{s.name}</span>
                        <span className="text-black tabular-nums">{s.price} DH</span>
                      </div>
                    ))}
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-200 space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-neutral-500">
                      <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                      Durée totale
                    </span>
                    <span className="text-black tabular-nums">{totalDuration} min</span>
                  </div>
                  <div className="flex items-center justify-between text-base font-bold">
                    <span className="text-black">Total</span>
                    <span className="text-black tabular-nums">{totalPrice} DH</span>
                  </div>
                </div>
              </div>

              {/* Notes field */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Note / Commentaire (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Précisez vos attentes..."
                />
              </div>

              <Button
                className="w-full bg-black hover:bg-neutral-800 text-white rounded-md"
                size="lg"
                onClick={submitBooking}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CreditCard className="mr-2 h-5 w-5" />
                )}
                {loading ? "Confirmation en cours..." : "Confirmer la réservation"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => {
            setStep(Math.max(0, step - 1));
            if (step === 2) {
              setAvailability(null);
              setSelectedTime(null);
            }
          }}
          disabled={step === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
        {step < 3 && (
          <Button
            onClick={() => {
              const nextStep = step + 1;
              setStep(nextStep);
              // Fetch next days availability after staff selection
              if (nextStep === 2) {
                fetchNextDays();
              }
            }}
            disabled={
              (step === 0 && selectedServices.length === 0) ||
              (step === 2 && (!selectedDate || !selectedTime))
            }
            className="bg-black hover:bg-neutral-800 text-white"
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Running total — sticky bottom bar (mobile) + inline summary (desktop) */}
      {selectedServices.length > 0 && step < 3 && (
        <>
          {/* Desktop: inline sticky summary card */}
          <div className="hidden sm:block mt-4">
            <div className="sticky top-4 border border-neutral-200 rounded-md bg-neutral-50 p-4">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-neutral-500 mb-3">
                Résumé
              </h3>
              <div className="space-y-1.5">
                {services
                  .filter((s) => selectedServices.includes(s.id))
                  .map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-black">{s.name}</span>
                      <span className="text-black tabular-nums">{s.price} DH</span>
                    </div>
                  ))}
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>
                    <Clock className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                    {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} — {totalDuration} min
                  </span>
                </div>
                <div className="flex items-center justify-between text-base font-bold mt-1">
                  <span className="text-black">Total</span>
                  <span className="text-black tabular-nums">{totalPrice} DH</span>
                </div>
              </div>
              <Button
                className="w-full mt-4 bg-black hover:bg-neutral-800 text-white rounded-md"
                size="lg"
                onClick={() => {
                  const nextStep = step + 1;
                  setStep(nextStep);
                  if (nextStep === 2) {
                    fetchNextDays();
                  }
                }}
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Mobile: fixed bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)] p-4 sm:hidden z-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500 tracking-wide">
                  {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} · {totalDuration} min
                </p>
                <p className="text-lg font-bold text-black tabular-nums">{totalPrice} DH</p>
              </div>
              <Button
                className="bg-black hover:bg-neutral-800 text-white rounded-md px-6"
                onClick={() => {
                  const nextStep = step + 1;
                  setStep(nextStep);
                  if (nextStep === 2) {
                    fetchNextDays();
                  }
                }}
              >
                Continuer
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}