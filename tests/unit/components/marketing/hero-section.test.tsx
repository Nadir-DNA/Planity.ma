/**
 * HeroSection Component Tests
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { HeroSection } from "@/components/marketing/hero-section";

// Mock Next.js router
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock constants
vi.mock("@/lib/constants", () => ({
  MOROCCAN_CITIES: ["Casablanca", "Rabat", "Marrakech", "Fes", "Tanger"],
  SALON_CATEGORIES: [
    { slug: "coiffeur", name: "Coiffeur" },
    { slug: "barbier", name: "Barbier" },
  ],
}));

describe("HeroSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render hero title", () => {
    render(React.createElement(HeroSection));
    expect(screen.getByText(/Reservez votre prochain/i)).toBeInTheDocument();
  });

  it("should render search input", () => {
    render(React.createElement(HeroSection));
    expect(screen.getByPlaceholderText(/Coiffeur, barbier, spa/i)).toBeInTheDocument();
  });

  it("should render city dropdown", () => {
    render(React.createElement(HeroSection));
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should render stats", () => {
    render(React.createElement(HeroSection));
    expect(screen.getByText("500+")).toBeInTheDocument();
    expect(screen.getByText("10 000+")).toBeInTheDocument();
  });

  it("should navigate on search submit", async () => {
    const user = userEvent.setup();
    render(React.createElement(HeroSection));
    
    const searchInput = screen.getByPlaceholderText(/Coiffeur/i);
    await user.type(searchInput, "spa");
    
    const submitBtn = screen.getByRole("button", { name: /Rechercher/i });
    await user.click(submitBtn);
    
    expect(mockPush).toHaveBeenCalled();
  });
});
