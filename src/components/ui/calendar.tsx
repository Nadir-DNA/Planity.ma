
"use client";

import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
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
  unavailableDates = [],
  className,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let startDayOfWeek = firstDay.getDay() - 1;
    if (startDayOfWeek < 0) startDayOfWeek = 6;
    
    const days = [];
    
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    
    return days;
  }, [currentMonth]);

  const isUnavailable = (date: Date) => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (date < today) return true;
    
    return unavailableDates.some(
      (d) => d.toDateString() === date.toDateString()
    );
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  return (
    <div className={cn("w-full max-w-sm", className)}>
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} className="p-2 rounded-lg hover:bg-neutral-100">
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-lg font-semibold">{MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
        
        <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} className="p-2 rounded-lg hover:bg-neutral-100">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-neutral-500 py-2">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((date, index) => {
          if (!date) return <div key={index} className="h-10" />;

          const unavailable = isUnavailable(date);
          const selected = isSelected(date);
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={index}
              disabled={unavailable}
              onClick={() => !unavailable && onDateSelect(date)}
              className={cn(
                "h-10 w-full rounded-lg text-sm font-medium transition-all",
                selected && "bg-mint text-black",
                !selected && !unavailable && "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                unavailable && "text-neutral-400 cursor-not-allowed",
                isToday && !selected && "ring-1 ring-neutral-300"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
