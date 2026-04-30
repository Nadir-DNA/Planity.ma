
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "@/components/ui/avatar";

describe("Avatar", () => {
  it("renders image when src provided", () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="User avatar" />);
    
    const img = screen.getByAltText("User avatar");
    expect(img).toBeInTheDocument();
  });

  it("shows initials when fallback provided", () => {
    render(<Avatar fallback="John Doe" />);
    
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("shows ? when no fallback", () => {
    render(<Avatar />);
    
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("applies size classes", () => {
    const { container } = render(<Avatar size="lg" />);
    
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("h-12");
  });
});
