/**
 * Timezone utilities for Planity.ma
 * 
 * Morocco uses Africa/Casablanca (UTC+1, with DST variations).
 * All dates/times in the app should be interpreted in this timezone.
 */

export const TIMEZONE = "Africa/Casablanca";

/**
 * Get current date/time in Morocco timezone
 */
export function nowInMorocco(): Date {
  // Create a Date that represents "now" but with Morocco's offset applied
  const now = new Date();
  const moroccoOffset = getMoroccoOffsetMinutes(now);
  const utcOffset = now.getTimezoneOffset(); // negative in UTC+zones
  return new Date(now.getTime() + (utcOffset + moroccoOffset) * 60000);
}

/**
 * Format a date as "YYYY-MM-DD" in Morocco timezone
 */
export function formatDateMorocco(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TIMEZONE });
}

/**
 * Format a date as "HH:mm" in Morocco timezone
 */
export function formatTimeMorocco(date: Date): string {
  return date.toLocaleTimeString("en-GB", { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit" });
}

/**
 * Get hours and minutes in Morocco timezone
 */
export function getHoursMinutesMorocco(date: Date): { hours: number; minutes: number } {
  const timeStr = formatTimeMorocco(date);
  const [h, m] = timeStr.split(":").map(Number);
  return { hours: h, minutes: m };
}

/**
 * Get the Morocco timezone offset in minutes for a given date
 * Morocco is UTC+1 standard, UTC+0 during DST (usually starts March, ends October)
 */
function getMoroccoOffsetMinutes(date: Date): number {
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: TIMEZONE,
    timeZoneName: "shortOffset",
  });
  
  const parts = formatter.formatToParts(date);
  const tzPart = parts.find(p => p.type === "timeZoneName");
  if (!tzPart) return 60; // Default UTC+1
  
  const match = tzPart.value.match(/GMT([+-]?)(\d+)(?::(\d+))?/);
  if (!match) return 60;
  
  const sign = match[1] === "-" ? -1 : 1;
  const hours = parseInt(match[2] || "0");
  const minutes = parseInt(match[3] || "0");
  return sign * (hours * 60 + minutes);
}

/**
 * Create a Date object representing a Morocco local time on a given date
 * This is used to create "YYYY-MM-DDTHH:mm" strings that should be interpreted as Morocco time
 */
export function createMoroccoDate(dateStr: string, timeStr: string): Date {
  // Parse the date/time as if it were in Morocco
  // We create an ISO string and let the Date constructor handle it
  // But since there's no timezone info, we need to calculate the offset
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  
  // Create a UTC date and adjust for Morocco offset
  const utcDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const moroccoOffset = getMoroccoOffsetMinutes(utcDate);
  
  return new Date(utcDate.getTime() - moroccoOffset * 60000);
}

/**
 * Check if a date string (YYYY-MM-DD) is today in Morocco timezone
 */
export function isTodayInMorocco(dateStr: string): boolean {
  return dateStr === formatDateMorocco(new Date());
}

/**
 * Get the current time in Morocco as minutes since midnight
 */
export function currentTimeMinutesInMorocco(): number {
  const { hours, minutes } = getHoursMinutesMorocco(new Date());
  return hours * 60 + minutes;
}