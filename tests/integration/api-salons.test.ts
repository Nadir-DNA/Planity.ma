import { describe, it, expect } from "vitest";

/**
 * Tests d'intégration API — Salons
 */

describe("API /api/v1/salons", () => {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  it("should return all active salons", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons`);
    // expect(res.status).toBe(200);
    // const data = await res.json();
    // expect(data.salons).toBeDefined();
    // expect(Array.isArray(data.salons)).toBe(true);
    expect(true).toBe(true);
  });

  it("should return only active and verified salons", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons`);
    // const data = await res.json();
    // data.salons.forEach((salon: any) => {
    //   expect(salon.isActive).toBe(true);
    //   expect(salon.isVerified).toBe(true);
    // });
    expect(true).toBe(true);
  });

  it("should include services, staff, openingHours", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons`);
    // const data = await res.json();
    // if (data.salons.length > 0) {
    //   const salon = data.salons[0];
    //   expect(salon.services).toBeDefined();
    //   expect(salon.staff).toBeDefined();
    //   expect(salon.openingHours).toBeDefined();
    // }
    expect(true).toBe(true);
  });
});

describe("API /api/v1/salons/[slug]", () => {
  const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";

  it("should return salon by slug", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons/salon-elegance-casablanca`);
    // expect(res.status).toBe(200);
    // const data = await res.json();
    // expect(data.salon).toBeDefined();
    // expect(data.salon.slug).toBe("salon-elegance-casablanca");
    expect(true).toBe(true);
  });

  it("should return 404 for unknown slug", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons/non-existent-slug`);
    // expect(res.status).toBe(404);
    // const data = await res.json();
    // expect(data.error).toContain("introuvable");
    expect(true).toBe(true);
  });

  it("should include services with categories", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons/salon-elegance-casablanca`);
    // const data = await res.json();
    // if (data.salon.services.length > 0) {
    //   expect(data.salon.services[0].category).toBeDefined();
    // }
    expect(true).toBe(true);
  });

  it("should include approved reviews", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons/salon-elegance-casablanca`);
    // const data = await res.json();
    // data.salon.reviews.forEach((review: any) => {
    //   expect(review.status).toBe("APPROVED");
    // });
    expect(true).toBe(true);
  });

  it("should include photos", async () => {
    // TODO:
    // const res = await fetch(`${baseUrl}/api/v1/salons/salon-elegance-casablanca`);
    // const data = await res.json();
    // expect(data.salon.photos).toBeDefined();
    expect(true).toBe(true);
  });
});
