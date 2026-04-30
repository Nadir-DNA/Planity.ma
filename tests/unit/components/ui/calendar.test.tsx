
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Calendar } from "@/components/ui/calendar";

describe("Calendar", () => {
  it("renders current month", () => {
    const onDateSelect = vi.fn();
    render(<Calendar onDateSelect={onDateSelect} />);
    
    // Check that month name appears
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", 
                    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const currentMonth = months[new Date().getMonth()];
    
    expect(screen.getByText(currentMonth)).toBeInTheDocument();
  });

  it("disables past dates", () => {
    const onDateSelect = vi.fn();
    render(<Calendar onDateSelect={onDateSelect} minDate={new Date()} />);
    
    // Find buttons that should be disabled (past dates)
    const buttons = screen.getAllByRole("button");
    const disabledButtons = buttons.filter(b => b.hasAttribute("disabled"));
    
    expect(disabledButtons.length).toBeGreaterThan(0);
  });

  it("calls onDateSelect when clicking available date", async () => {
    const onDateSelect = vi.fn();
    render(<Calendar onDateSelect={onDateSelect} />);
    
    // Find an enabled date button and click it
    const buttons = screen.getAllByRole("button");
    const enabledButton = buttons.find(b => !b.hasAttribute("disabled") && !b.textContent?.includes("Jan"));
    
    if (enabledButton) {
      enabledButton.click();
      expect(onDateSelect).toHaveBeenCalled();
    }
  });
});
