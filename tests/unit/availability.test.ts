import { describe, it, expect } from "vitest";
import {
  computeAvailability,
  generateSlots,
} from "@/lib/availability";

describe("Availability Engine", () => {
  describe("computeAvailability", () => {
    it("should return empty array when staff is not working", () => {
      const result = computeAvailability(
        { startTime: "09:00", endTime: "19:00", isWorking: false },
        [],
        [],
        30
      );
      expect(result).toEqual([]);
    });

    it("should return empty array when schedule is null", () => {
      const result = computeAvailability(null, [], [], 30);
      expect(result).toEqual([]);
    });

    it("should return empty array when staff has full-day absence", () => {
      const result = computeAvailability(
        { startTime: "09:00", endTime: "19:00", isWorking: true },
        [],
        [{ startDate: new Date("2024-03-20"), endDate: new Date("2024-03-20"), isFullDay: true }],
        30
      );
      expect(result).toEqual([]);
    });

    it("should return available slots when no bookings (3 slots for 60min with 15min intervals)", () => {
      const result = computeAvailability(
        { startTime: "09:00", endTime: "10:00", isWorking: true },
        [],
        [],
        30
      );
      // 09:00, 09:15, 09:30 (3 slots at 15-min intervals)
      expect(result).toEqual([
        { start: "09:00", end: "09:30" },
        { start: "09:15", end: "09:45" },
        { start: "09:30", end: "10:00" },
      ]);
    });

    it("should subtract booked intervals from available slots", () => {
      const result = computeAvailability(
        { startTime: "09:00", endTime: "12:00", isWorking: true },
        [
          { startTime: new Date("2024-03-20T10:00:00"), endTime: new Date("2024-03-20T11:00:00") },
        ],
        [],
        30
      );
      // 09:00-10:00: 3 slots (09:00, 09:15, 09:30)
      // 11:00-12:00: 3 slots (11:00, 11:15, 11:30)
      expect(result).toEqual([
        { start: "09:00", end: "09:30" },
        { start: "09:15", end: "09:45" },
        { start: "09:30", end: "10:00" },
        { start: "11:00", end: "11:30" },
        { start: "11:15", end: "11:45" },
        { start: "11:30", end: "12:00" },
      ]);
    });

    it("should handle multiple bookings", () => {
      const result = computeAvailability(
        { startTime: "09:00", endTime: "17:00", isWorking: true },
        [
          { startTime: new Date("2024-03-20T09:00:00"), endTime: new Date("2024-03-20T10:00:00") },
          { startTime: new Date("2024-03-20T13:00:00"), endTime: new Date("2024-03-20T14:00:00") },
        ],
        [],
        30
      );
      // Should have slots before 09:00 (none), between 10:00-13:00, and after 14:00-17:00
      const starts = result.map((s) => s.start);
      expect(starts).toContain("10:00");
      expect(starts).toContain("14:00");
      expect(result.length).toBeGreaterThan(0);
    });

    it("should respect buffer time between appointments", () => {
      const result = computeAvailability(
        { startTime: "09:00", endTime: "10:00", isWorking: true },
        [
          { startTime: new Date("2024-03-20T09:00:00"), endTime: new Date("2024-03-20T09:30:00") },
        ],
        [],
        30,
        15 // buffer time
      );
      // With 15 min buffer, the booking ends at 09:45, so next slot starts at 10:00
      // But 10:00 + 30 = 10:30 > 10:00 (end of schedule), so no slots
      expect(result).toEqual([]);
    });

    it("should handle overlapping bookings", () => {
      const result = computeAvailability(
        { startTime: "09:00", endTime: "12:00", isWorking: true },
        [
          { startTime: new Date("2024-03-20T09:00:00"), endTime: new Date("2024-03-20T10:30:00") },
          { startTime: new Date("2024-03-20T10:00:00"), endTime: new Date("2024-03-20T11:00:00") },
        ],
        [],
        30
      );
      // Should have slots from 11:00 to 12:00
      // 11:00, 11:15, 11:30 (3 slots)
      expect(result).toEqual([
        { start: "11:00", end: "11:30" },
        { start: "11:15", end: "11:45" },
        { start: "11:30", end: "12:00" },
      ]);
    });
  });

  describe("generateSlots", () => {
    it("should generate discrete slots from intervals (3 slots for 60min with 15min intervals)", () => {
      const intervals = [{ start: 540, end: 600 }]; // 09:00 - 10:00
      const result = generateSlots(intervals, 30);
      expect(result).toEqual([
        { start: "09:00", end: "09:30" },
        { start: "09:15", end: "09:45" },
        { start: "09:30", end: "10:00" },
      ]);
    });

    it("should align to interval grid", () => {
      const intervals = [{ start: 545, end: 600 }]; // 09:05 - 10:00
      const result = generateSlots(intervals, 30, 15);
      // Should start at 09:15 (aligned to 15-min grid)
      expect(result[0].start).toBe("09:15");
    });

    it("should handle multiple intervals", () => {
      const intervals = [
        { start: 540, end: 600 },  // 09:00 - 10:00
        { start: 720, end: 780 },  // 12:00 - 13:00
      ];
      const result = generateSlots(intervals, 30);
      expect(result).toEqual([
        { start: "09:00", end: "09:30" },
        { start: "09:15", end: "09:45" },
        { start: "09:30", end: "10:00" },
        { start: "12:00", end: "12:30" },
        { start: "12:15", end: "12:45" },
        { start: "12:30", end: "13:00" },
      ]);
    });

    it("should not generate partial slots", () => {
      const intervals = [{ start: 540, end: 570 }]; // 09:00 - 09:30
      const result = generateSlots(intervals, 45);
      expect(result).toEqual([]); // 45 min doesn't fit in 30 min
    });
  });
});
