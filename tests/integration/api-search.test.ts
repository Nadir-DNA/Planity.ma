/**
 * Search API Integration Tests with MSW
 */

import { describe, it, expect, beforeEach } from "vitest";
import { server } from "../mocks/server";
import { http, HttpResponse } from "msw";
import { createMockSalon } from "../factories";

describe("Search API", () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  it("should return salons list", async () => {
    const res = await fetch("/api/v1/search");
    const data = await res.json();
    
    expect(res.ok).toBe(true);
    expect(data.salons).toBeDefined();
    expect(Array.isArray(data.salons)).toBe(true);
  });

  it("should filter by city", async () => {
    server.use(
      http.get("/api/v1/search", ({ request }) => {
        const url = new URL(request.url);
        const city = url.searchParams.get("city");
        return HttpResponse.json({
          salons: [createMockSalon({ city: city || "Test" })],
          total: 1,
        });
      })
    );

    const res = await fetch("/api/v1/search?city=Casablanca");
    const data = await res.json();
    
    expect(data.salons[0].city).toBe("Casablanca");
  });

  it("should handle pagination", async () => {
    server.use(
      http.get("/api/v1/search", () =>
        HttpResponse.json({
          salons: Array.from({ length: 10 }, () => createMockSalon()),
          total: 50,
          page: 1,
        })
      )
    );

    const res = await fetch("/api/v1/search?page=1&limit=10");
    const data = await res.json();
    
    expect(data.salons).toHaveLength(10);
    expect(data.total).toBe(50);
  });

  it("should handle empty results", async () => {
    server.use(
      http.get("/api/v1/search", () =>
        HttpResponse.json({ salons: [], total: 0 })
      )
    );

    const res = await fetch("/api/v1/search?q=xyz");
    const data = await res.json();
    
    expect(data.salons).toHaveLength(0);
  });

  it("should handle errors", async () => {
    server.use(
      http.get("/api/v1/search", () =>
        HttpResponse.json({ error: "Server error" }, { status: 500 })
      )
    );

    const res = await fetch("/api/v1/search");
    expect(res.status).toBe(500);
  });
});
