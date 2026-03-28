"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CreditCard,
} from "lucide-react";

const STEPS = ["Service", "Professionnel", "Date & Heure", "Confirmation"];

// Placeholder data
const services = [
  { id: "s1", name: "Coupe femme", price: 150, duration: 45 },
  { id: "s2", name: "Coupe homme", price: 80, duration: 30 },
  { id: "s3", name: "Coloration", price: 300, duration: 90 },
  { id: "s4", name: "Brushing", price: 100, duration: 30 },
];

const staff = [
  { id: "t1", name: "Sara M.", title: "Coiffeuse senior" },
  { id: "t2", name: "Karim B.", title: "Coloriste" },
  { id: "t3", name: "Nadia L.", title: "Coiffeuse" },
];

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00",
];

export default function BookingPage() {
  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

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
                onClick={() => setSelectedStaff(null)}
                className={`w-full flex items-center p-4 rounded-lg border-2 transition-colors ${
                  selectedStaff === null
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <User className="h-10 w-10 text-gray-400 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Pas de preference</p>
                  <p className="text-sm text-gray-500">Premier disponible</p>
                </div>
              </button>
              {staff.map((member) => (
                <button
                  key={member.id}
                  onClick={() => setSelectedStaff(member.id)}
                  className={`w-full flex items-center p-4 rounded-lg border-2 transition-colors ${
                    selectedStaff === member.id
                      ? "border-rose-500 bg-rose-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-rose-200 flex items-center justify-center text-rose-700 font-bold mr-3">
                    {member.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.title}</p>
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
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Creneaux disponibles
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === time
                            ? "bg-rose-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
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
            <CardTitle>Confirmation</CardTitle>
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
                        {s.name}
                      </p>
                    ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Professionnel</span>
                <span>
                  {selectedStaff
                    ? staff.find((s) => s.id === selectedStaff)?.name
                    : "Premier disponible"}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Date</span>
                <span>
                  {selectedDate} a {selectedTime}
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-gray-500">Duree</span>
                <span>{totalDuration} min</span>
              </div>
              <div className="flex items-center justify-between py-3 text-lg font-bold">
                <span>Total</span>
                <span>{totalPrice} DH</span>
              </div>

              <Button className="w-full" size="lg">
                <CreditCard className="mr-2 h-5 w-5" />
                Confirmer la reservation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
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
                {selectedServices.length} service(s) - {totalDuration} min
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
