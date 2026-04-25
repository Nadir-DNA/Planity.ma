import { describe, it, expect } from "vitest";
import { formatPrice, formatDuration, generateBookingReference, slugify, getInitials } from "@/lib/utils";

describe("Utils", () => {
  describe("formatPrice", () => {
    it("should format price in MAD", () => {
      expect(formatPrice(150)).toContain("150");
      expect(formatPrice(150)).toContain("MAD");
    });

    it("should handle decimals", () => {
      expect(formatPrice(123.45)).toContain("123");
      expect(formatPrice(123.45)).toContain("MAD");
    });

    it("should handle zero", () => {
      expect(formatPrice(0)).toContain("0");
      expect(formatPrice(0)).toContain("MAD");
    });

    it("should handle large numbers", () => {
      expect(formatPrice(1234567)).toContain("1");
      expect(formatPrice(1234567)).toContain("234");
      expect(formatPrice(1234567)).toContain("567");
      expect(formatPrice(1234567)).toContain("MAD");
    });
  });

  describe("formatDuration", () => {
    it("should format minutes under 60", () => {
      expect(formatDuration(30)).toBe("30 min");
    });

    it("should format exactly 60 minutes", () => {
      expect(formatDuration(60)).toBe("1h");
    });

    it("should format hours and minutes", () => {
      expect(formatDuration(90)).toBe("1h30");
    });

    it("should format multiple hours", () => {
      expect(formatDuration(150)).toBe("2h30");
    });

    it("should handle zero", () => {
      expect(formatDuration(0)).toBe("0 min");
    });
  });

  describe("generateBookingReference", () => {
    it("should generate reference starting with PLM-", () => {
      const ref = generateBookingReference();
      expect(ref).toMatch(/^PLM-[A-Z0-9]{5}$/);
    });

    it("should generate unique references", () => {
      const refs = new Set();
      for (let i = 0; i < 100; i++) {
        refs.add(generateBookingReference());
      }
      expect(refs.size).toBe(100);
    });
  });

  describe("slugify", () => {
    it("should convert to lowercase", () => {
      expect(slugify("Hello World")).toBe("hello-world");
    });

    it("should remove accents", () => {
      expect(slugify("Salon de beauté")).toBe("salon-de-beaute");
    });

    it("should handle special characters", () => {
      expect(slugify("Hello! World?")).toBe("hello-world");
    });

    it("should trim leading/trailing dashes", () => {
      expect(slugify("-hello-world-")).toBe("hello-world");
    });

    it("should handle Arabic text", () => {
      expect(slugify("حلاق")).toBe("");
    });
  });

  describe("getInitials", () => {
    it("should return first two initials", () => {
      expect(getInitials("Fatima Zahri")).toBe("FZ");
    });

    it("should handle single name", () => {
      expect(getInitials("Fatima")).toBe("F");
    });

    it("should handle multiple names", () => {
      expect(getInitials("Fatima Zahri Mansouri")).toBe("FZ");
    });

    it("should uppercase", () => {
      expect(getInitials("fatima zahri")).toBe("FZ");
    });
  });
});
