/**
 * Booking Store Tests - Zustand state management
 */

import { describe, it, expect, beforeEach } from "vitest";
import { act } from "@testing-library/react";
import { useBookingStore } from "@/stores/booking-store";

describe("useBookingStore", () => {
  beforeEach(() => {
    // Reset store to initial state
    act(() => {
      useBookingStore.getState().reset();
    });
  });

  describe("initial state", () => {
    it("should have correct initial values", () => {
      const state = useBookingStore.getState();
      
      expect(state.salonId).toBeNull();
      expect(state.selectedServices).toEqual([]);
      expect(state.selectedStaffId).toBeNull();
      expect(state.selectedDate).toBe("");
      expect(state.selectedTime).toBeNull();
      expect(state.notes).toBe("");
    });
  });

  describe("setSalonId", () => {
    it("should set salon ID", () => {
      act(() => {
        useBookingStore.getState().setSalonId("salon-123");
      });
      
      expect(useBookingStore.getState().salonId).toBe("salon-123");
    });
  });

  describe("toggleService", () => {
    it("should add service when not selected", () => {
      act(() => {
        useBookingStore.getState().toggleService("service-1");
      });
      
      expect(useBookingStore.getState().selectedServices).toContain("service-1");
    });

    it("should remove service when already selected", () => {
      act(() => {
        useBookingStore.getState().toggleService("service-1");
        useBookingStore.getState().toggleService("service-1");
      });
      
      expect(useBookingStore.getState().selectedServices).not.toContain("service-1");
    });

    it("should allow multiple services", () => {
      act(() => {
        useBookingStore.getState().toggleService("service-1");
        useBookingStore.getState().toggleService("service-2");
      });
      
      const services = useBookingStore.getState().selectedServices;
      expect(services).toHaveLength(2);
      expect(services).toContain("service-1");
      expect(services).toContain("service-2");
    });
  });

  describe("setSelectedStaff", () => {
    it("should set staff ID", () => {
      act(() => {
        useBookingStore.getState().setSelectedStaff("staff-1");
      });
      
      expect(useBookingStore.getState().selectedStaffId).toBe("staff-1");
    });

    it("should allow null to deselect", () => {
      act(() => {
        useBookingStore.getState().setSelectedStaff("staff-1");
        useBookingStore.getState().setSelectedStaff(null);
      });
      
      expect(useBookingStore.getState().selectedStaffId).toBeNull();
    });
  });

  describe("setSelectedDate", () => {
    it("should set date and clear time", () => {
      act(() => {
        useBookingStore.getState().setSelectedTime("10:00");
        useBookingStore.getState().setSelectedDate("2024-03-20");
      });
      
      expect(useBookingStore.getState().selectedDate).toBe("2024-03-20");
      expect(useBookingStore.getState().selectedTime).toBeNull(); // Time cleared
    });
  });

  describe("setSelectedTime", () => {
    it("should set time", () => {
      act(() => {
        useBookingStore.getState().setSelectedTime("14:30");
      });
      
      expect(useBookingStore.getState().selectedTime).toBe("14:30");
    });
  });

  describe("setNotes", () => {
    it("should set notes", () => {
      act(() => {
        useBookingStore.getState().setNotes("Special request: quiet room");
      });
      
      expect(useBookingStore.getState().notes).toBe("Special request: quiet room");
    });
  });

  describe("reset", () => {
    it("should reset all state to initial values", () => {
      act(() => {
        useBookingStore.getState().setSalonId("salon-1");
        useBookingStore.getState().toggleService("service-1");
        useBookingStore.getState().setSelectedStaff("staff-1");
        useBookingStore.getState().setSelectedDate("2024-03-20");
        useBookingStore.getState().setSelectedTime("10:00");
        useBookingStore.getState().setNotes("Test notes");
      });
      
      act(() => {
        useBookingStore.getState().reset();
      });
      
      const state = useBookingStore.getState();
      expect(state.salonId).toBeNull();
      expect(state.selectedServices).toEqual([]);
      expect(state.selectedStaffId).toBeNull();
      expect(state.selectedDate).toBe("");
      expect(state.selectedTime).toBeNull();
      expect(state.notes).toBe("");
    });
  });
});
