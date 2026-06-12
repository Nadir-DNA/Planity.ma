"use server";

import { supabaseAdmin, findByUnique, insertRow, findFirst, deleteRow, updateRow } from "@/lib/supabase-helpers";
import { slugify } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { initSalonSubscription } from "@/server/services/dodo-payment.service";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

// ============================================================
// SCHEMA
// ============================================================

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

const openingHourSchema = z
  .object({
    day: z.string(),
    isOpen: z.boolean(),
    openTime: z.string().regex(TIME_REGEX, "Heure invalide (HH:MM)"),
    closeTime: z.string().regex(TIME_REGEX, "Heure invalide (HH:MM)"),
  })
  .refine((h) => !h.isOpen || h.openTime < h.closeTime, {
    message: "L'heure d'ouverture doit précéder l'heure de fermeture",
  });

const serviceDataSchema = z.object({
  name: z.string().min(1),
  price: z.coerce.number().positive("Prix invalide").max(100000),
  duration: z.coerce.number().int().positive("Durée invalide").max(600),
});

const staffDataSchema = z.object({
  name: z.string().min(1),
  title: z.string(),
});

// Slugs valides (cf. SALON_CATEGORIES dans lib/constants) → stockés en DB en MAJUSCULES_UNDERSCORE
const SALON_CATEGORY_SLUGS = new Set([
  "coiffeur",
  "barbier",
  "institut-beaute",
  "spa",
  "ongles",
  "maquillage",
  "epilation",
  "massage",
]);

const completeOnboardingSchema = z.object({
  // Compte (utilisé uniquement si aucune session active)
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(8).optional(),

  // Salon
  salonName: z.string().min(2),
  salonCategory: z.string(),
  salonAddress: z.string().min(5),
  salonCity: z.string().min(2),
  salonPostalCode: z.string().optional(),
  salonPhone: z.string().min(10),
  salonEmail: z.string().email().optional(),
  salonDescription: z.string().optional(),

  // Opening hours
  openingHours: z.array(openingHourSchema),

  // Services
  services: z.array(serviceDataSchema),

  // Staff
  staff: z.array(staffDataSchema),
});

export type CompleteOnboardingInput = z.input<typeof completeOnboardingSchema>;

// ============================================================
// ACTION
// ============================================================

export async function completeProOnboarding(data: CompleteOnboardingInput) {
  const parsed = completeOnboardingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const d = parsed.data;

  if (!SALON_CATEGORY_SLUGS.has(d.salonCategory)) {
    return { error: "Catégorie de salon invalide" };
  }
  const category = d.salonCategory.toUpperCase().replace(/-/g, "_");

  // ── 1. Résoudre l'utilisateur : session active, sinon création de compte ──
  const sessionUser = await getUser();
  let userId: string;

  if (sessionUser) {
    userId = sessionUser.id;

    // Promote to PRO_OWNER (table + metadata Auth pour le middleware)
    if (sessionUser.role !== "PRO_OWNER") {
      await updateRow("User", userId, { role: "PRO_OWNER", updatedAt: new Date().toISOString() });
    }
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { role: "PRO_OWNER" },
    });
  } else {
    // Pas de session : le formulaire doit fournir les infos de compte
    if (!d.email || !d.password || !d.firstName || !d.lastName) {
      return { error: "Veuillez renseigner vos informations de compte (nom, email, mot de passe)" };
    }

    const normalizedEmail = d.email.toLowerCase().trim();

    // Jamais de prise de contrôle silencieuse d'un compte existant
    const existingUser = await findByUnique("User", "email", normalizedEmail);
    if (existingUser) {
      return {
        error: "Un compte existe déjà avec cet email. Connectez-vous d'abord, puis reprenez l'inscription de votre salon.",
      };
    }

    // Créer le compte dans Supabase Auth (source de vérité du login)
    const { data: authData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: d.password,
      email_confirm: true,
      user_metadata: {
        firstName: d.firstName,
        lastName: d.lastName,
        role: "PRO_OWNER",
        locale: "FR",
        phone: d.phone || null,
      },
    });

    if (signUpError || !authData.user) {
      return { error: signUpError?.message || "Erreur lors de la création du compte" };
    }

    userId = authData.user.id;

    const passwordHash = await bcrypt.hash(d.password, 12);
    const { error: insertUserError } = await supabaseAdmin.from("User").insert({
      id: userId,
      firstName: d.firstName,
      lastName: d.lastName,
      name: `${d.firstName} ${d.lastName}`,
      email: normalizedEmail,
      phone: d.phone || null,
      passwordHash,
      role: "PRO_OWNER",
      locale: "FR",
      isActive: true,
      updatedAt: new Date().toISOString(),
    });

    if (insertUserError) {
      // Rollback du compte Auth pour éviter les orphelins
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return { error: "Erreur technique lors de la création du compte" };
    }

    // Ouvrir la session (cookies) pour enchaîner sur le paiement et le dashboard
    try {
      const supabase = await createClient();
      await supabase.auth.signInWithPassword({ email: normalizedEmail, password: d.password });
    } catch {
      // Si la pose de cookies échoue, l'utilisateur pourra se connecter manuellement
    }
  }

  // ── 2. Idempotence : un seul salon par propriétaire ──
  const existingSalon = await findFirst<{ id: string; slug: string; isActive: boolean }>("Salon", {
    filters: { ownerId: userId },
  });
  if (existingSalon) {
    if (existingSalon.isActive) {
      return { error: "Vous avez déjà un salon actif sur Planity.ma" };
    }
    // Salon créé mais paiement non finalisé → relancer le checkout
    const checkout = await initSalonSubscription(existingSalon.id);
    return {
      success: true as const,
      userId,
      salonId: existingSalon.id,
      slug: existingSalon.slug,
      checkoutUrl: checkout.success ? checkout.redirectUrl : undefined,
    };
  }

  // Generate unique slug
  let slug = slugify(d.salonName + " " + d.salonCity);
  let existing = await findByUnique("Salon", "slug", slug);
  let counter = 1;
  while (existing) {
    slug = slugify(d.salonName + " " + d.salonCity + " " + counter);
    existing = await findByUnique("Salon", "slug", slug);
    counter++;
  }

  // Map French day names to dayOfWeek numbers (0=Monday)
  const dayMap: Record<string, number> = {
    Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5, Dimanche: 6,
  };

  // Create salon — activé après paiement de l'abonnement (webhook Dodo)
  const salon = await insertRow("Salon", {
    name: d.salonName,
    slug,
    category,
    address: d.salonAddress,
    city: d.salonCity,
    postalCode: d.salonPostalCode || null,
    phone: d.salonPhone,
    email: d.salonEmail || null,
    description: d.salonDescription || null,
    ownerId: userId,
    isActive: false,
    subscriptionStatus: "PENDING",
  });

  const salonId = (salon as Record<string, unknown>).id as string;

  // Create opening hours
  for (const h of d.openingHours) {
    if (h.isOpen) {
      const dayNum = dayMap[h.day];
      if (dayNum !== undefined) {
        await insertRow("SalonSchedule", {
          salonId,
          dayOfWeek: dayNum,
          openTime: h.openTime,
          closeTime: h.closeTime,
          isClosed: false,
        });
      }
    }
  }

  // Create staff members
  const staffColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
  const createdStaff: { id: string; name: string; title?: string }[] = [];

  for (let i = 0; i < d.staff.length; i++) {
    const s = d.staff[i];
    if (!s.name) continue;

    const staffMember = await insertRow("StaffMember", {
      salonId,
      displayName: s.name,
      title: s.title || null,
      color: staffColors[i % staffColors.length],
      isActive: true,
      order: i,
    });

    const staffId = (staffMember as Record<string, unknown>).id as string;

    // Create default schedule for each day (same as salon hours)
    for (const h of d.openingHours) {
      if (h.isOpen) {
        const dayNum = dayMap[h.day];
        if (dayNum !== undefined) {
          await insertRow("StaffSchedule", {
            staffId,
            dayOfWeek: dayNum,
            startTime: h.openTime,
            endTime: h.closeTime,
            isWorking: true,
          });
        }
      }
    }

    createdStaff.push({ id: staffId, name: s.name, title: s.title });
  }

  // Create services
  for (let i = 0; i < d.services.length; i++) {
    const svc = d.services[i];

    const service = await insertRow("Service", {
      salonId,
      name: svc.name,
      price: svc.price,
      duration: svc.duration,
      isActive: true,
      isOnlineBookable: true,
      order: i,
    });

    const serviceId = (service as Record<string, unknown>).id as string;

    // Assign all staff to this service
    for (const sm of createdStaff) {
      await insertRow("StaffService", {
        staffId: sm.id,
        serviceId,
      });
    }
  }

  // ── 3. Abonnement Dodo : le salon sera activé par le webhook payment.success ──
  const checkout = await initSalonSubscription(salonId);

  return {
    success: true as const,
    userId,
    salonId,
    slug,
    // Si la création du checkout échoue, le dashboard proposera de relancer le paiement
    checkoutUrl: checkout.success ? checkout.redirectUrl : undefined,
  };
}

// ============================================================
// CRUD ACTIONS
// ============================================================

export async function createService(salonId: string, data: {
  name: string;
  price: number;
  duration: number;
  description?: string;
  categoryId?: string;
  isOnlineBookable?: boolean;
  staffIds?: string[];
}) {
  const service = await insertRow("Service", {
    salonId,
    name: data.name,
    price: data.price,
    duration: data.duration,
    description: data.description || null,
    categoryId: data.categoryId || null,
    isOnlineBookable: data.isOnlineBookable ?? true,
    isActive: true,
  });

  const serviceId = (service as Record<string, unknown>).id as string;

  // Assign staff
  if (data.staffIds?.length) {
    const rows = data.staffIds.map((staffId) => ({
      staffId,
      serviceId,
    }));
    await supabaseAdmin.from("StaffService").insert(rows);
  }

  return service;
}

export async function updateService(serviceId: string, data: {
  name?: string;
  price?: number;
  duration?: number;
  description?: string;
  categoryId?: string;
  isOnlineBookable?: boolean;
  isActive?: boolean;
  staffIds?: string[];
}) {
  const { staffIds, ...updateData } = data;

  await updateRow("Service", serviceId, updateData);

  // Update staff assignments
  if (staffIds !== undefined) {
    // Delete existing staff assignments
    await supabaseAdmin
      .from("StaffService")
      .delete()
      .eq("serviceId", serviceId);

    // Insert new ones
    if (staffIds.length > 0) {
      const rows = staffIds.map((staffId) => ({
        staffId,
        serviceId,
      }));
      await supabaseAdmin.from("StaffService").insert(rows);
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from("Service")
    .select("*, assignedStaff:StaffService(*, staff:StaffMember!staffId(*))")
    .eq("id", serviceId)
    .single();

  if (error) throw new Error(`updateService: ${error.message}`);
  return updated;
}

export async function deleteService(serviceId: string) {
  return deleteRow("Service", serviceId);
}

export async function createStaffMember(salonId: string, data: {
  displayName: string;
  title?: string;
  bio?: string;
  color?: string;
  userId?: string;
  schedules?: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  const staff = await insertRow("StaffMember", {
    salonId,
    displayName: data.displayName,
    title: data.title || null,
    bio: data.bio || null,
    color: data.color || "#3B82F6",
    userId: data.userId || null,
    isActive: true,
  });

  const staffId = (staff as Record<string, unknown>).id as string;

  // Create schedules
  if (data.schedules?.length) {
    const rows = data.schedules.map((s) => ({
      staffId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      isWorking: true,
    }));
    await supabaseAdmin.from("StaffSchedule").insert(rows);
  }

  return staff;
}

export async function updateStaffMember(staffId: string, data: {
  displayName?: string;
  title?: string;
  bio?: string;
  color?: string;
  isActive?: boolean;
  schedules?: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  const { schedules, ...updateData } = data;

  await updateRow("StaffMember", staffId, updateData);

  // Update schedules
  if (schedules !== undefined) {
    // Delete existing schedules
    await supabaseAdmin
      .from("StaffSchedule")
      .delete()
      .eq("staffId", staffId);

    // Insert new ones
    if (schedules.length > 0) {
      const rows = schedules.map((s) => ({
        staffId,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        isWorking: true,
      }));
      await supabaseAdmin.from("StaffSchedule").insert(rows);
    }
  }

  const { data: updated, error } = await supabaseAdmin
    .from("StaffMember")
    .select("*, schedules:StaffSchedule(*)")
    .eq("id", staffId)
    .single();

  if (error) throw new Error(`updateStaffMember: ${error.message}`);
  return updated;
}

export async function deleteStaffMember(staffId: string) {
  return deleteRow("StaffMember", staffId);
}