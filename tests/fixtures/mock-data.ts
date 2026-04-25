/**
 * Données mock pour les tests
 */

export const mockSalons = [
  {
    id: "salon-1",
    name: "Salon Elegance",
    slug: "salon-elegance-casablanca",
    category: "COIFFEUR",
    city: "Casablanca",
    address: "123 Bd Mohammed V",
    phone: "+212 5XX-XXXXXX",
    email: "contact@salon-elegance.ma",
    rating: 4.8,
    reviewCount: 124,
    isActive: true,
    isVerified: true,
  },
  {
    id: "salon-2",
    name: "Barber House",
    slug: "barber-house-rabat",
    category: "BARBIER",
    city: "Rabat",
    address: "45 Rue Hassan II",
    phone: "+212 5XX-XXXXXX",
    rating: 4.9,
    reviewCount: 89,
    isActive: true,
    isVerified: true,
  },
  {
    id: "salon-3",
    name: "Spa Zenith",
    slug: "spa-zenith-marrakech",
    category: "SPA",
    city: "Marrakech",
    address: "Gueliz, Av. Mohammed VI",
    phone: "+212 5XX-XXXXXX",
    rating: 4.7,
    reviewCount: 201,
    isActive: true,
    isVerified: true,
  },
];

export const mockServices = [
  {
    id: "svc-1",
    salonId: "salon-1",
    name: "Coupe femme",
    price: 150,
    duration: 45,
    bufferTime: 15,
    isOnlineBookable: true,
    isActive: true,
  },
  {
    id: "svc-2",
    salonId: "salon-1",
    name: "Coupe homme",
    price: 80,
    duration: 30,
    bufferTime: 10,
    isOnlineBookable: true,
    isActive: true,
  },
  {
    id: "svc-3",
    salonId: "salon-1",
    name: "Coloration complète",
    price: 300,
    duration: 90,
    bufferTime: 30,
    isOnlineBookable: true,
    isActive: true,
  },
  {
    id: "svc-4",
    salonId: "salon-1",
    name: "Brushing",
    price: 100,
    duration: 30,
    bufferTime: 10,
    isOnlineBookable: true,
    isActive: true,
  },
];

export const mockStaff = [
  {
    id: "staff-1",
    salonId: "salon-1",
    displayName: "Sara M.",
    title: "Coiffeuse senior",
    color: "#EC4899",
    isActive: true,
  },
  {
    id: "staff-2",
    salonId: "salon-1",
    displayName: "Karim B.",
    title: "Coloriste",
    color: "#3B82F6",
    isActive: true,
  },
  {
    id: "staff-3",
    salonId: "salon-1",
    displayName: "Nadia L.",
    title: "Coiffeuse",
    color: "#10B981",
    isActive: true,
  },
];

export const mockBookings = [
  {
    id: "booking-1",
    reference: "PLM-A3K7N",
    userId: "user-1",
    salonId: "salon-1",
    status: "CONFIRMED",
    startTime: new Date("2024-03-20T14:00:00"),
    endTime: new Date("2024-03-20T15:15:00"),
    totalPrice: 250,
    source: "ONLINE",
  },
  {
    id: "booking-2",
    reference: "PLM-B8M2P",
    userId: "user-2",
    salonId: "salon-3",
    status: "COMPLETED",
    startTime: new Date("2024-03-15T10:00:00"),
    endTime: new Date("2024-03-15T12:00:00"),
    totalPrice: 500,
    source: "ONLINE",
  },
];

export const mockUsers = [
  {
    id: "user-1",
    email: "fatima@email.com",
    name: "Fatima Zahri",
    firstName: "Fatima",
    lastName: "Zahri",
    phone: "+212 661-123456",
    role: "CONSUMER",
  },
  {
    id: "user-2",
    email: "sara@salon-elegance.ma",
    name: "Sara Mansouri",
    firstName: "Sara",
    lastName: "Mansouri",
    phone: "+212 662-234567",
    role: "PRO_OWNER",
  },
  {
    id: "admin-1",
    email: "admin@planity.ma",
    name: "Admin Planity",
    firstName: "Admin",
    lastName: "Planity",
    role: "ADMIN",
  },
];

export const mockReviews = [
  {
    id: "review-1",
    bookingId: "booking-1",
    userId: "user-1",
    salonId: "salon-1",
    overallRating: 5,
    qualityRating: 5,
    timingRating: 4,
    receptionRating: 5,
    hygieneRating: 5,
    comment: "Excellent service, équipe très professionnelle !",
    status: "APPROVED",
  },
  {
    id: "review-2",
    bookingId: "booking-2",
    userId: "user-2",
    salonId: "salon-3",
    overallRating: 4,
    qualityRating: 4,
    timingRating: 5,
    receptionRating: 4,
    hygieneRating: 5,
    comment: "Très bon spa, je recommande.",
    status: "APPROVED",
  },
];

export const mockSchedules = [
  { staffId: "staff-1", dayOfWeek: 0, startTime: "09:00", endTime: "19:00", isWorking: true },
  { staffId: "staff-1", dayOfWeek: 1, startTime: "09:00", endTime: "19:00", isWorking: true },
  { staffId: "staff-1", dayOfWeek: 2, startTime: "09:00", endTime: "19:00", isWorking: true },
  { staffId: "staff-1", dayOfWeek: 3, startTime: "09:00", endTime: "19:00", isWorking: true },
  { staffId: "staff-1", dayOfWeek: 4, startTime: "09:00", endTime: "19:00", isWorking: true },
  { staffId: "staff-1", dayOfWeek: 5, startTime: "09:00", endTime: "20:00", isWorking: true },
  { staffId: "staff-1", dayOfWeek: 6, startTime: "09:00", endTime: "19:00", isWorking: false },
];
