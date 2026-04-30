import { z } from "zod";

// ==================== Common Schemas ====================

export const emailSchema = z
  .string()
  .min(1, "L'email est requis")
  .email("Email invalide")
  .max(255, "Email trop long");

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .max(100, "Mot de passe trop long")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre");

export const phoneSchema = z
  .string()
  .regex(/^(\+212|0)[5-7][0-9]{8}$/, "Numéro de téléphone marocain invalide")
  .optional()
  .or(z.literal(""));

export const nameSchema = z
  .string()
  .min(2, "Le nom doit contenir au moins 2 caractères")
  .max(100, "Nom trop long")
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, "Le nom contient des caractères invalides");

export const slugSchema = z
  .string()
  .min(2, "Le slug doit contenir au moins 2 caractères")
  .max(100, "Slug trop long")
  .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des minuscules, chiffres et tirets");

export const urlSchema = z
  .string()
  .url("URL invalide")
  .max(500, "URL trop longue")
  .optional()
  .or(z.literal(""));

export const idSchema = z.string().cuid("ID invalide");

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

// ==================== Auth Schemas ====================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  role: z.enum(["CLIENT", "PROFESSIONAL", "ADMIN"]).default("CLIENT"),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Mot de passe actuel requis"),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// ==================== Salon Schemas ====================

export const salonHoursSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"),
  closed: z.boolean().default(false),
});

export const salonScheduleSchema = z.object({
  monday: salonHoursSchema,
  tuesday: salonHoursSchema,
  wednesday: salonHoursSchema,
  thursday: salonHoursSchema,
  friday: salonHoursSchema,
  saturday: salonHoursSchema,
  sunday: salonHoursSchema,
});

export const createSalonSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  slug: slugSchema,
  description: z.string().max(1000).optional(),
  address: z.string().min(5, "Adresse trop courte").max(255),
  city: z.string().min(2).max(100),
  postalCode: z.string().regex(/^[0-9]{5}$/, "Code postal invalide"),
  phone: z.string().regex(/^(\+212|0)[5-7][0-9]{8}$/, "Téléphone invalide"),
  email: emailSchema.optional(),
  website: urlSchema,
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  schedule: salonScheduleSchema.optional(),
  categoryIds: z.array(z.string()).min(1, "Au moins une catégorie requise"),
});

export const updateSalonSchema = createSalonSchema.partial();

// ==================== Service Schemas ====================

export const createServiceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  duration: z.coerce.number().int().min(5).max(480), // 5min à 8h
  price: z.coerce.number().min(0).max(100000),
  salonId: idSchema,
  categoryId: idSchema.optional(),
});

export const updateServiceSchema = createServiceSchema.partial().omit({ salonId: true });

// ==================== Booking Schemas ====================

export const createBookingSchema = z.object({
  salonId: idSchema,
  serviceId: idSchema,
  staffId: idSchema.optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date invalide (YYYY-MM-DD)"),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Heure invalide (HH:MM)"),
  notes: z.string().max(500).optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"]),
  notes: z.string().max(500).optional(),
});

// ==================== Review Schemas ====================

export const createReviewSchema = z.object({
  salonId: idSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(10, "Commentaire trop court").max(1000),
  serviceId: idSchema.optional(),
  staffId: idSchema.optional(),
});

// ==================== Staff Schemas ====================

export const createStaffSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema.optional(),
  phone: z.string().regex(/^(\+212|0)[5-7][0-9]{8}$/).optional().or(z.literal("")),
  bio: z.string().max(500).optional(),
  salonId: idSchema,
  serviceIds: z.array(idSchema).optional(),
});

export const updateStaffSchema = createStaffSchema.partial().omit({ salonId: true });

// ==================== Helper Functions ====================

export function validateOrThrow<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new Error(`Validation error: ${errors}`);
  }
  return result.data;
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const err of error.issues) {
    const path = err.path.join(".");
    if (!formatted[path]) {
      formatted[path] = err.message;
    }
  }
  return formatted;
}

// ==================== API Response Helper ====================

export function apiValidation<T extends z.ZodSchema>(
  schema: T,
  data: unknown
):
  | { success: true; data: z.infer<T> }
  | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: formatZodErrors(result.error) };
}