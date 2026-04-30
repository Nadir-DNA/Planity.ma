
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimeSlotPicker, generateMockSlots } from "@/components/ui/time-slot-picker";

describe("TimeSlotPicker", () => {
  it("shows loading skeletons when loading", () => {
    render(<TimeSlotPicker slots={[]} onSelect={vi.fn()} loading />);
    
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("shows message when no slots", () => {
    render(<TimeSlotPicker slots={[]} onSelect={vi.fn()} />);
    
    expect(screen.getByText(/Aucun créneau disponible/)).toBeInTheDocument();
  });

  it("renders slots grouped by hour", () => {
    const slots = [
      { time: "09:00", available: true },
      { time: "09:30", available: true },
      { time: "10:00", available: false },
    ];
    render(<TimeSlotPicker slots={slots} onSelect={vi.fn()} />);
    
    expect(screen.getByText("09h")).toBeInTheDocument();
    expect(screen.getByText("10h")).toBeInTheDocument();
  });

  it("calls onSelect when clicking available slot", async () => {
    const onSelect = vi.fn();
    const slots = [{ time: "09:00", available: true }];
    render(<TimeSlotPicker slots={slots} onSelect={onSelect} />);
    
    screen.getByText("09:00").click();
    expect(onSelect).toHaveBeenCalledWith(slots[0]);
  });

  it("generates mock slots correctly", () => {
    const slots = generateMockSlots();
    
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0].time).toMatch(/^\d{2}:\d{2}$/);
  });
});
