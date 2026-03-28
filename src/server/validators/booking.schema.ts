import { z } from "zod";

export const createBookingSchema = z.object({
  salonId: z.string().min(1),
  services: z
    .array(
      z.object({
        serviceId: z.string().min(1),
        staffId: z.string().optional(),
      })
    )
    .min(1, "Selectionnez au moins un service"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format de date invalide"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Format d'heure invalide"),
  notes: z.string().max(500).optional(),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
