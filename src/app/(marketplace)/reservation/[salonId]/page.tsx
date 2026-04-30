"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CreditCard,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

const STEPS = ["Service", "Professionnel", "Date & Heure", "Confirmation"];

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

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const salonId = params?.salonId as string;

  const [step, setStep] = useState(0);
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [notes, setNotes] = useState("");

  // Availability state
  const [availability, setAvailability] = useState<AvailabilityResult | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Fetch salon services and staff
  useEffect(() => {
    if (!salonId) return;

    async function fetchData() {
      try {
        setLoading(true);
        // Fetch salon details (includes services)
        const salonRes = await fetch(`/api/v1/salons/${salonId}`);
        if (!salonRes.ok) {
          throw new Error("Impossible de charger les données du salon");
        }
        const salonData = await salonRes.json();

        // Fetch staff separately
        const staffRes = await fetch(`/api/v1/salons/${salonId}/staff`);
        if (!staffRes.ok) {
          throw new Error("Impossible de charger l'équipe");
        }
        const staffData = await staffRes.json();

        setServices(salonData.salon?.services || []);
        setStaff(staffData.staff || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [salonId]);

  // Fetch availability when date changes
  const fetchAvailability = useCallback(async (date: string) => {
    if (!date || !salonId) return;

    try {
      setAvailabilityLoading(true);
      const serviceId = selectedServices.length === 1 ? selectedServices[0] : undefined;
      const staffId = selectedStaff || undefined;

      const queryParams = new URLSearchParams({
        salonId,
        date,
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
    // Reset availability when services change
    setAvailability(null);
    setSelectedTime(null);
  }

  async function submitBooking() {
    if (!session?.user) {
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
        date: selectedDate,
        time: selectedTime,
        notes: notes || undefined,
      };

      const res = await fetch("/api/v1/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Erreur lors de la réservation");
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        Prendre rendez-vous
      </h1>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                i <= step
                  ? "bg-rose-600 text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden sm:block ml-2 text-sm ${
                i <= step ? "text-gray-900 font-medium" : "text-gray-400"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 ${
                  i < step ? "bg-rose-600" : "bg-gray-200"
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
              <p className="text-gray-500 text-center py-4">
                Aucun service disponible pour ce salon.
              </p>
            ) : (
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => toggleService(service.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-colors ${
                      selectedServices.includes(service.id)
                        ? "border-rose-500 bg-rose-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-medium text-gray-900">{service.name}</p>
                      {service.description && (
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        <Clock className="inline h-3.5 w-3.5 mr-1" />
                        {service.duration} min
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-semibold">{service.price} DH</span>
                      {selectedServices.includes(service.id) && (
                        <Check className="h-5 w-5 text-rose-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Staff selection */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Choisissez votre professionnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button
                onClick={() => { setSelectedStaff(null); setAvailability(null); setSelectedTime(null); }}
                className={`w-full flex items-center p-4 rounded-lg border-2 transition-colors ${
                  selectedStaff === null
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="h-10 w-10 text-gray-400 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Pas de préférence</p>
                  <p className="text-sm text-gray-500">Premier disponible</p>
                </div>
              </button>
              {staff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => { setSelectedStaff(member.id); setAvailability(null); setSelectedTime(null); }}
                  className={`w-full flex items-center p-4 rounded-lg border-2 transition-colors ${
                    selectedStaff === member.id
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold mr-3"
                    style={{ backgroundColor: member.color }}
                  >
                    {member.displayName[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{member.displayName}</p>
                    {member.title && (
                      <p className="text-sm text-gray-500">{member.title}</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
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
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime(null);
                    setSelectedEnd(null);
                  }}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Créneaux disponibles
                  </label>
                  {availabilityLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-rose-600" />
                    </div>
                  ) : availability?.availability && availability.availability.length > 0 ? (
                    <div className="space-y-4">
                      {availability.availability.map((staffAvail) => (
                        <div key={staffAvail.staffId}>
                          <p className="text-sm font-medium text-gray-700 mb-2">
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
                                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                                  selectedTime === slot.start
                                    ? "bg-rose-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                    <div className="text-center py-8 text-gray-500">
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
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Services</span>
                <div className="text-right">
                  {services
                    .filter((s) => selectedServices.includes(s.id))
                    .map((s) => (
                      <p key={s.id} className="text-sm">
                        {s.name} — {s.price} DH
                      </p>
                    ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Professionnel</span>
                <span>
                  {selectedStaff
                    ? staff.find((s) => s.id === selectedStaff)?.displayName
                    : "Premier disponible"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Date & Heure</span>
                <span>
                  {selectedDate} à {selectedTime}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Durée</span>
                <span>{totalDuration} min</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Notes</span>
                <span className="text-right max-w-xs">
                  {notes || "—"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 text-lg font-bold">
                <span>Total</span>
                <span>{totalPrice} DH</span>
              </div>

              {/* Notes field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note / Commentaire (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  placeholder="Précisez vos attentes..."
                />
              </div>

              <Button
                className="w-full"
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
            onClick={() => setStep(step + 1)}
            disabled={
              (step === 0 && selectedServices.length === 0) ||
              (step === 2 && (!selectedDate || !selectedTime))
            }
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>

      {/* Summary sidebar (mobile-bottom) */}
      {selectedServices.length > 0 && step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 sm:hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                {selectedServices.length} service(s) — {totalDuration} min
              </p>
              <p className="font-bold">{totalPrice} DH</p>
            </div>
            <Button onClick={() => setStep(step + 1)} size="sm">
              Continuer
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
