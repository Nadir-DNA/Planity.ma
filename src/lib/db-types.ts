/**
 * Database entity types — replaces @prisma/client generated types.
 * These types mirror the Prisma schema models and are kept in sync manually.
 */

// ============================================================
// ENUMS
// ============================================================

export type UserRole = "CONSUMER" | "PRO_OWNER" | "PRO_STAFF" | "ADMIN";
export type AuthProvider = "EMAIL" | "GOOGLE" | "FACEBOOK" | "PHONE";
export type Locale = "FR" | "AR";
export type SalonCategory =
  | "COIFFEUR"
  | "BARBIER"
  | "INSTITUT_BEAUTE"
  | "SPA"
  | "ONGLES"
  | "MAQUILLAGE"
  | "EPILATION"
  | "MASSAGE"
  | "AUTRE";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
export type BookingSource = "ONLINE" | "IN_SALON" | "PHONE";
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type PaymentMethod = "CARD" | "CASH" | "CHECK" | "ONLINE" | "GIFT_CARD";
export type PaymentType =
  | "BOOKING_DEPOSIT"
  | "BOOKING_FULL"
  | "IN_SALON"
  | "REFUND"
  | "PRODUCT_SALE";
export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "REFUNDED";
export type AbsenceType = "VACATION" | "SICK" | "PERSONAL" | "TRAINING";
export type ClockEventType = "CLOCK_IN" | "CLOCK_OUT" | "BREAK_START" | "BREAK_END";
export type NotificationType =
  | "BOOKING_CONFIRMED"
  | "BOOKING_REMINDER"
  | "BOOKING_CANCELLED"
  | "REVIEW_REQUEST"
  | "NEW_REVIEW"
  | "MARKETING"
  | "SYSTEM";
export type NotificationChannel = "EMAIL" | "SMS" | "PUSH";
export type NotificationStatus = "PENDING" | "SENT" | "FAILED";
export type GiftCardStatus = "ACTIVE" | "USED" | "EXPIRED" | "CANCELLED";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "SENDING" | "SENT";
export type CampaignType = "SMS" | "EMAIL";

// ============================================================
// MODELS
// ============================================================

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  avatar: string | null;
  role: UserRole;
  provider: AuthProvider;
  locale: Locale;
  isActive: boolean;
  emailVerified: Date | null;
  phoneVerified: Date | null;
  verificationToken: string | null;
  verificationTokenExpires: Date | null;
  notifyBookingConfirmed: boolean;
  notifyBookingReminder: boolean;
  notifyMarketing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Account {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface VerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

export interface Salon {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: SalonCategory;
  address: string;
  city: string;
  postalCode: string | null;
  country: string;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  coverImage: string | null;
  logoImage: string | null;
  isActive: boolean;
  isVerified: boolean;
  isPremium: boolean;
  cancellationPolicy: string | null;
  depositPercentage: number | null;
  stripeAccountId: string | null;
  averageRating: number | null;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
}

export interface SalonPhoto {
  id: string;
  salonId: string;
  url: string;
  alt: string | null;
  order: number;
  createdAt: Date;
}

export interface OpeningHours {
  id: string;
  salonId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface ServiceCategory {
  id: string;
  name: string;
  nameAr: string | null;
  slug: string;
  icon: string | null;
  order: number;
  parentId: string | null;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
  bufferTime: number;
  isOnlineBookable: boolean;
  requiresDeposit: boolean;
  depositAmount: number | null;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string | null;
}

export interface StaffService {
  id: string;
  staffId: string;
  serviceId: string;
}

export interface StaffMember {
  id: string;
  salonId: string;
  userId: string | null;
  displayName: string;
  avatar: string | null;
  title: string | null;
  bio: string | null;
  color: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface StaffAbsence {
  id: string;
  staffId: string;
  type: AbsenceType;
  startDate: Date;
  endDate: Date;
  isFullDay: boolean;
  note: string | null;
  createdAt: Date;
}

export interface ClockEvent {
  id: string;
  staffId: string;
  type: ClockEventType;
  timestamp: Date;
  note: string | null;
}

export interface Booking {
  id: string;
  reference: string;
  userId: string;
  salonId: string;
  status: BookingStatus;
  startTime: Date;
  endTime: Date;
  totalPrice: number;
  depositAmount: number;
  depositPaid: boolean;
  notes: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  cancelledBy: string | null;
  reminder24hSent: boolean;
  reminder1hSent: boolean;
  source: BookingSource;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  serviceId: string;
  staffId: string;
  startTime: Date;
  endTime: Date;
  price: number;
}

export interface Review {
  id: string;
  bookingId: string;
  userId: string;
  salonId: string;
  overallRating: number;
  qualityRating: number | null;
  timingRating: number | null;
  receptionRating: number | null;
  hygieneRating: number | null;
  comment: string | null;
  reply: string | null;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  bookingId: string | null;
  salonId: string;
  userId: string | null;
  amount: number;
  tip: number;
  method: PaymentMethod;
  type: PaymentType;
  stripePaymentIntentId: string | null;
  status: PaymentStatus;
  receiptUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface GiftCard {
  id: string;
  code: string;
  salonId: string;
  purchasedById: string;
  recipientEmail: string | null;
  recipientName: string | null;
  initialAmount: number;
  remainingAmount: number;
  expiresAt: Date;
  status: GiftCardStatus;
  createdAt: Date;
}

export interface GiftCardUsage {
  id: string;
  giftCardId: string;
  amount: number;
  usedAt: Date;
}

export interface Product {
  id: string;
  salonId: string;
  name: string;
  description: string | null;
  barcode: string | null;
  sku: string | null;
  price: number;
  costPrice: number | null;
  taxRate: number;
  stockQuantity: number;
  lowStockThreshold: number;
  image: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  supplierId: string | null;
}

export interface Supplier {
  id: string;
  salonId: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface Favorite {
  id: string;
  userId: string;
  salonId: string;
  createdAt: Date;
}

export interface LoyaltyCard {
  id: string;
  userId: string;
  salonId: string;
  points: number;
  tier: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  loyaltyCardId: string;
  points: number;
  description: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  readAt: Date | null;
  sentAt: Date | null;
  status: NotificationStatus;
  createdAt: Date;
}

export interface MarketingCampaign {
  id: string;
  salonId: string;
  type: CampaignType;
  name: string;
  subject: string | null;
  body: string;
  targetSegment: Record<string, unknown> | null;
  scheduledAt: Date | null;
  sentAt: Date | null;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  status: CampaignStatus;
  createdAt: Date;
  updatedAt: Date;
}