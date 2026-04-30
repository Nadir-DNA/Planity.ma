
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RatingStars } from "@/components/ui/rating-stars";

describe("RatingStars", () => {
  it("renders 5 stars by default", () => {
    render(<RatingStars rating={3} />);
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(5);
  });

  it("renders custom max rating", () => {
    render(<RatingStars rating={3} maxRating={10} />);
    
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(10);
  });

  it("shows rating value when showValue is true", () => {
    render(<RatingStars rating={4.5} showValue />);
    
    expect(screen.getByText("4.5")).toBeInTheDocument();
  });

  it("calls onRatingChange when interactive", async () => {
    const onRatingChange = vi.fn();
    render(<RatingStars rating={0} interactive onRatingChange={onRatingChange} />);
    
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]); // Click 4th star
    
    expect(onRatingChange).toHaveBeenCalledWith(4);
  });

  it("does not call onRatingChange when not interactive", async () => {
    const onRatingChange = vi.fn();
    render(<RatingStars rating={3} interactive={false} onRatingChange={onRatingChange} />);
    
    const buttons = screen.getAllByRole("button");
    fireEvent.click(buttons[3]);
    
    expect(onRatingChange).not.toHaveBeenCalled();
  });
});
