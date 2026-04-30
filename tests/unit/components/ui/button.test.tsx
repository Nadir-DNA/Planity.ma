
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders with children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("shows loading spinner when loading", () => {
    render(<Button loading>Loading</Button>);
    
    const svg = document.querySelector("svg.animate-spin");
    expect(svg).toBeInTheDocument();
  });

  it("is disabled when loading", () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
  });

  it("applies variant classes", () => {
    render(<Button variant="primary">Primary</Button>);
    
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-mint");
  });
});
