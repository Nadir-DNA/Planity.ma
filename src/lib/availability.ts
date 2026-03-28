/**
 * Availability computation engine.
 *
 * Computes available time slots for a given salon/staff/date by:
 * 1. Fetching staff schedules for the requested date
 * 2. Fetching existing bookings for that date
 * 3. Subtracting booked intervals and absences from schedule intervals
 * 4. Returning available slots
 */

export interface TimeSlot {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface AvailabilityRequest {
  salonId: string;
  serviceId?: string;
  staffId?: string;
  date: string; // "YYYY-MM-DD"
  duration: number; // minutes
}

export interface AvailabilityResult {
  date: string;
  staffId: string;
  staffName: string;
  slots: TimeSlot[];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

interface Interval {
  start: number; // minutes from midnight
  end: number;
}

/**
 * Subtract booked intervals from available intervals.
 */
function subtractIntervals(
  available: Interval[],
  booked: Interval[]
): Interval[] {
  let result = [...available];

  for (const booking of booked) {
    const next: Interval[] = [];
    for (const slot of result) {
      if (booking.end <= slot.start || booking.start >= slot.end) {
        // No overlap
        next.push(slot);
      } else {
        // Overlap - split the slot
        if (slot.start < booking.start) {
          next.push({ start: slot.start, end: booking.start });
        }
        if (slot.end > booking.end) {
          next.push({ start: booking.end, end: slot.end });
        }
      }
    }
    result = next;
  }

  return result;
}

/**
 * Generate discrete time slots from available intervals.
 */
export function generateSlots(
  availableIntervals: Interval[],
  duration: number,
  intervalMinutes: number = 15
): TimeSlot[] {
  const slots: TimeSlot[] = [];

  for (const interval of availableIntervals) {
    let current = interval.start;
    // Align to interval grid
    const remainder = current % intervalMinutes;
    if (remainder !== 0) {
      current += intervalMinutes - remainder;
    }

    while (current + duration <= interval.end) {
      slots.push({
        start: minutesToTime(current),
        end: minutesToTime(current + duration),
      });
      current += intervalMinutes;
    }
  }

  return slots;
}

/**
 * Compute available slots for a staff member on a given date.
 *
 * @param schedule - Staff working hours for that day of week
 * @param existingBookings - Already booked time ranges
 * @param absences - Staff absences for that date
 * @param duration - Required service duration in minutes
 * @param bufferTime - Buffer time between appointments in minutes
 */
export function computeAvailability(
  schedule: { startTime: string; endTime: string; isWorking: boolean } | null,
  existingBookings: { startTime: Date; endTime: Date }[],
  absences: { startDate: Date; endDate: Date; isFullDay: boolean }[],
  duration: number,
  bufferTime: number = 0
): TimeSlot[] {
  // Staff not working this day
  if (!schedule || !schedule.isWorking) {
    return [];
  }

  // Build available interval from schedule
  const availableIntervals: Interval[] = [
    {
      start: timeToMinutes(schedule.startTime),
      end: timeToMinutes(schedule.endTime),
    },
  ];

  // Check full-day absences
  if (absences.some((a) => a.isFullDay)) {
    return [];
  }

  // Convert existing bookings to intervals (with buffer)
  const bookedIntervals: Interval[] = existingBookings.map((b) => ({
    start: b.startTime.getHours() * 60 + b.startTime.getMinutes(),
    end:
      b.endTime.getHours() * 60 + b.endTime.getMinutes() + bufferTime,
  }));

  // Subtract booked intervals from available
  const freeIntervals = subtractIntervals(availableIntervals, bookedIntervals);

  // Generate discrete slots
  return generateSlots(freeIntervals, duration);
}
