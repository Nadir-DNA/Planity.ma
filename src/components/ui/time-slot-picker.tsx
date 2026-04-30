
"use client";

import { cn } from "@/lib/utils";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  onSelect: (slot: TimeSlot) => void;
  selectedSlot?: TimeSlot;
  loading?: boolean;
  className?: string;
}

export function TimeSlotPicker({
  slots,
  onSelect,
  selectedSlot,
  loading = false,
  className,
}: TimeSlotPickerProps) {
  if (loading) {
    return (
      <div className={cn("grid grid-cols-4 gap-2", className)}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={cn("text-center py-8 text-neutral-500", className)}>
        Aucun créneau disponible
      </div>
    );
  }

  const groupedSlots = slots.reduce((acc, slot) => {
    const hour = slot.time.split(":")[0];
    if (!acc[hour]) acc[hour] = [];
    acc[hour].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  return (
    <div className={cn("space-y-4", className)}>
      {Object.entries(groupedSlots).map(([hour, hourSlots]) => (
        <div key={hour}>
          <p className="text-xs font-medium text-neutral-500 mb-2">{hour}h</p>
          <div className="grid grid-cols-4 gap-2">
            {hourSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                className={cn(
                  "h-10 rounded-lg text-sm font-medium transition-all",
                  selectedSlot?.time === slot.time && slot.available && "bg-mint text-black",
                  selectedSlot?.time !== slot.time && slot.available && "bg-neutral-100 text-neutral-700 hover:bg-neutral-200",
                  !slot.available && "bg-neutral-50 text-neutral-400 cursor-not-allowed"
                )}
                onClick={() => slot.available && onSelect(slot)}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function generateMockSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 19; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
      slots.push({ time, available: Math.random() > 0.3 });
    }
  }
  return slots;
}
