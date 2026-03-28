"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 9); // 9:00 to 19:00
const STAFF_MEMBERS = [
  { id: "1", name: "Sara M.", color: "#EC4899" },
  { id: "2", name: "Karim B.", color: "#3B82F6" },
  { id: "3", name: "Nadia L.", color: "#10B981" },
];

// Placeholder bookings
const bookings = [
  {
    id: "b1",
    staffId: "1",
    clientName: "Fatima Z.",
    service: "Coupe femme",
    startHour: 9,
    startMin: 0,
    duration: 45,
    color: "#EC4899",
  },
  {
    id: "b2",
    staffId: "1",
    clientName: "Amina K.",
    service: "Coloration",
    startHour: 10,
    startMin: 0,
    duration: 90,
    color: "#EC4899",
  },
  {
    id: "b3",
    staffId: "2",
    clientName: "Ahmed M.",
    service: "Coupe homme",
    startHour: 9,
    startMin: 30,
    duration: 30,
    color: "#3B82F6",
  },
  {
    id: "b4",
    staffId: "3",
    clientName: "Leila B.",
    service: "Brushing",
    startHour: 11,
    startMin: 0,
    duration: 30,
    color: "#10B981",
  },
];

export default function AgendaPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"day" | "week">("day");

  const dateStr = currentDate.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function navigate(direction: number) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{dateStr}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center border rounded-lg">
            <button
              onClick={() => setView("day")}
              className={`px-3 py-1.5 text-sm font-medium rounded-l-lg ${
                view === "day"
                  ? "bg-rose-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Jour
            </button>
            <button
              onClick={() => setView("week")}
              className={`px-3 py-1.5 text-sm font-medium rounded-r-lg ${
                view === "week"
                  ? "bg-rose-600 text-white"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Semaine
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
            >
              Aujourd&apos;hui
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nouveau RDV
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Staff columns header */}
        <div className="grid border-b" style={{ gridTemplateColumns: `60px repeat(${STAFF_MEMBERS.length}, 1fr)` }}>
          <div className="p-3 border-r bg-gray-50" />
          {STAFF_MEMBERS.map((staff) => (
            <div
              key={staff.id}
              className="p-3 text-center border-r last:border-r-0"
            >
              <div
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold"
                style={{ backgroundColor: staff.color }}
              >
                {staff.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <p className="text-sm font-medium mt-1">{staff.name}</p>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="relative">
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid border-b"
              style={{
                gridTemplateColumns: `60px repeat(${STAFF_MEMBERS.length}, 1fr)`,
                height: "80px",
              }}
            >
              <div className="p-2 text-xs text-gray-500 border-r bg-gray-50 text-right pr-3">
                {hour}:00
              </div>
              {STAFF_MEMBERS.map((staff) => {
                const staffBookings = bookings.filter(
                  (b) => b.staffId === staff.id && b.startHour === hour
                );
                return (
                  <div
                    key={staff.id}
                    className="relative border-r last:border-r-0 hover:bg-gray-50 cursor-pointer"
                  >
                    {staffBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="absolute left-1 right-1 rounded-md px-2 py-1 text-xs text-white overflow-hidden"
                        style={{
                          backgroundColor: booking.color,
                          top: `${(booking.startMin / 60) * 100}%`,
                          height: `${(booking.duration / 60) * 80}px`,
                          opacity: 0.9,
                        }}
                      >
                        <p className="font-medium truncate">
                          {booking.clientName}
                        </p>
                        <p className="truncate opacity-80">
                          {booking.service}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Today's summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Rendez-vous aujourd&apos;hui</p>
          <p className="text-2xl font-bold mt-1">{bookings.length}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Taux d&apos;occupation</p>
          <p className="text-2xl font-bold mt-1">68%</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-sm text-gray-500">Chiffre d&apos;affaires prevu</p>
          <p className="text-2xl font-bold mt-1">2 450 DH</p>
        </div>
      </div>
    </div>
  );
}
