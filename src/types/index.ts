import type {
  User,
  Salon,
  Service,
  StaffMember,
  Booking,
  BookingItem,
  Review,
  Payment,
} from "@prisma/client";

// Extended types with relations
export type SalonWithDetails = Salon & {
  services: Service[];
  staff: StaffMember[];
  reviews: Review[];
  _count: {
    reviews: number;
    bookings: number;
  };
};

export type BookingWithDetails = Booking & {
  items: (BookingItem & {
    service: Service;
    staff: StaffMember;
  })[];
  salon: Salon;
  user: User;
  payment?: Payment | null;
  review?: Review | null;
};

export type StaffWithSchedule = StaffMember & {
  schedules: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isWorking: boolean;
  }[];
};

// Search types
export interface SearchFilters {
  query?: string;
  city?: string;
  category?: string;
  minRating?: number;
  maxPrice?: number;
  availableToday?: boolean;
  sortBy?: "relevance" | "rating" | "distance" | "price";
  latitude?: number;
  longitude?: number;
  radius?: number; // km
  page?: number;
  limit?: number;
}

export interface SearchResult {
  salons: SalonWithDetails[];
  total: number;
  page: number;
  totalPages: number;
}

// Availability types
export interface TimeSlot {
  start: string;
  end: string;
}

export interface StaffAvailability {
  staffId: string;
  staffName: string;
  slots: TimeSlot[];
}

// Re-export Prisma types
export type {
  User,
  Salon,
  Service,
  StaffMember,
  Booking,
  BookingItem,
  Review,
  Payment,
};
