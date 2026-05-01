"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  /** Dates that have available slots (shown with a dot indicator) */
  availableDates?: string[]; // format: "YYYY-MM-DD"
  /** Dates that are fully booked / closed (shown as disabled) */
  unavailableDates?: Date[];
  className?: string;
}

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

export function Calendar({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  availableDates,
  unavailableDates = [],
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const minDateClamped = useMemo(() => {
    if (minDate) return minDate;
    return today;
  }, [minDate, today]);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;

    const days: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  // Precompute a set of available date strings for O(1) lookup
  const availableDateSet = useMemo(() => {
    if (!availableDates) return null;
    return new Set(availableDates);
  }, [availableDates]);

  const isUnavailable = (date: Date) => {
    if (date < minDateClamped) return true;
    if (maxDate && date > maxDate) return true;
    if (date < today) return true;

    return unavailableDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const isAvailable = (date: Date) => {
    if (!availableDateSet) return undefined; // No data = don't show indicator
    const dateStr = date.toISOString().split("T")[0];
    return availableDateSet.has(dateStr);
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const canGoPrev = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    return prev >= new Date(today.getFullYear(), today.getMonth(), 1);
  };

  const canGoNext = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (maxDate) return next <= maxDate;
    return true;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => canGoPrev() && setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          disabled={!canGoPrev()}
          className="p-2 rounded-md hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-base font-semibold text-black">
          {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>

        <button
          onClick={() => canGoNext() && setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          disabled={!canGoNext()}
          className="p-2 rounded-md hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-400 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) return <div key={index} className="h-10" />;

          const unavailable = isUnavailable(date);
          const selected = isSelected(date);
          const isToday = date.toDateString() === today.toDateString();
          const hasAvail = isAvailable(date);

          return (
            <button
              key={index}
              disabled={unavailable}
              onClick={() => !unavailable && onDateSelect(date)}
              className={cn(
                "relative h-10 w-full rounded-md text-sm font-medium transition-all flex flex-col items-center justify-center",
                selected && "bg-black text-white",
                !selected && !unavailable && "text-black hover:bg-neutral-100",
                !selected && !unavailable && isToday && "ring-1 ring-neutral-300",
                unavailable && "text-neutral-300 cursor-not-allowed line-through",
              )}
            >
              {date.getDate()}
              {/* Availability dot indicator */}
              {hasAvail === true && !selected && !unavailable && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-black" />
              )}
              {hasAvail === false && !unavailable && !selected && availableDateSet && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-neutral-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      {availableDateSet && (
        <div className="flex items-center gap-4 mt-3 text-[11px] text-neutral-500">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-black" /> Disponible
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" /> Complet
          </span>
        </div>
      )}
    </div>
  );
}