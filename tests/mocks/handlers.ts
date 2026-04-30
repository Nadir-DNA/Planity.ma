/**
 * MSW Handlers - Mock API responses
 */

import { http, HttpResponse, delay } from "msw";
import { createMockSalon, createMockBooking } from "../factories";

const API_BASE = "/api/v1";

export const handlers = [
  // GET /api/v1/salons
  http.get(`${API_BASE}/salons`, async () => {
    await delay(50);
    const salons = Array.from({ length: 5 }, () => createMockSalon());
    return HttpResponse.json({ salons });
  }),

  // GET /api/v1/salons/:slug
  http.get(`${API_BASE}/salons/:slug`, async ({ params }) => {
    await delay(50);
    const salon = createMockSalon({ slug: params.slug as string });
    return HttpResponse.json({ salon });
  }),

  // GET /api/v1/availability
  http.get(`${API_BASE}/availability`, async () => {
    await delay(50);
    return HttpResponse.json({
      date: "2024-03-20",
      salonId: "salon-123",
      availability: [
        {
          staffId: "staff-1",
          staffName: "Amal",
          staffColor: "#3B82F6",
          slots: [{ start: "09:00", end: "10:00" }, { start: "14:00", end: "15:00" }],
        },
        {
          staffId: "staff-2",
          staffName: "Sara",
          staffColor: "#10B981",
          slots: [{ start: "09:30", end: "10:30" }],
        },
      ],
    });
  }),

  // GET /api/v1/search
  http.get(`${API_BASE}/search`, async () => {
    await delay(50);
    const salons = Array.from({ length: 5 }, () => createMockSalon());
    return HttpResponse.json({ salons, total: 5, page: 1, limit: 20 });
  }),

  // GET /api/v1/bookings
  http.get(`${API_BASE}/bookings`, async () => {
    await delay(50);
    const bookings = Array.from({ length: 3 }, () => createMockBooking());
    return HttpResponse.json({ bookings, total: 3 });
  }),

  // POST /api/v1/bookings
  http.post(`${API_BASE}/bookings`, async ({ request }) => {
    await delay(100);
    const body = await request.json();
    const booking = createMockBooking({ ...body as any, status: "PENDING" as any });
    return HttpResponse.json({ booking }, { status: 201 });
  }),
];
