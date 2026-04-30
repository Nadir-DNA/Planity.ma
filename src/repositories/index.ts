/**
 * Repository Factory - Central export for DI
 */

export * from "./interfaces";
export { SalonRepository, createSalonRepository } from "./salon.repository";
export { BookingRepository, createBookingRepository } from "./booking.repository";

// Default factory exports for convenience
import { createSalonRepository } from "./salon.repository";
import { createBookingRepository } from "./booking.repository";

export const repositories = {
  salon: createSalonRepository,
  booking: createBookingRepository,
};
