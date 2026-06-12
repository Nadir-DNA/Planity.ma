import { describe, it, expect, vi } from "vitest";
import { createMoroccoDate, formatDateMorocco, getHoursMinutesMorocco } from "@/lib/timezone";

vi.mock("@/lib/supabase", () => ({
  supabase: {},
  supabaseAdmin: {},
}));

const { schemaDayOfWeek, timeToMinutes } = await import("@/lib/booking-window");

describe("createMoroccoDate", () => {
  it("convertit une heure locale Maroc en UTC (UTC+1 hors Ramadan)", () => {
    // 15 janvier : Maroc en UTC+1 → 10:00 local = 09:00 UTC
    const d = createMoroccoDate("2026-01-15", "10:00");
    expect(d.toISOString()).toBe("2026-01-15T09:00:00.000Z");
  });

  it("fait un aller-retour cohérent (heure stockée == heure relue)", () => {
    const d = createMoroccoDate("2026-07-20", "14:30");
    const { hours, minutes } = getHoursMinutesMorocco(d);
    expect(hours * 60 + minutes).toBe(14 * 60 + 30);
    expect(formatDateMorocco(d)).toBe("2026-07-20");
  });

  it("gère minuit", () => {
    const d = createMoroccoDate("2026-03-01", "00:00");
    const { hours, minutes } = getHoursMinutesMorocco(d);
    expect(hours).toBe(0);
    expect(minutes).toBe(0);
  });
});

describe("schemaDayOfWeek", () => {
  it("mappe lundi → 0 et dimanche → 6", () => {
    expect(schemaDayOfWeek("2026-06-08")).toBe(0); // lundi
    expect(schemaDayOfWeek("2026-06-12")).toBe(4); // vendredi
    expect(schemaDayOfWeek("2026-06-14")).toBe(6); // dimanche
  });
});

describe("timeToMinutes", () => {
  it("convertit HH:MM en minutes", () => {
    expect(timeToMinutes("09:00")).toBe(540);
    expect(timeToMinutes("19:30")).toBe(1170);
    expect(timeToMinutes("00:00")).toBe(0);
  });
});
