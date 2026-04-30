"use server";

import { supabaseAdmin, findByUnique, insertRow, findFirst, deleteRow, updateRow } from "@/lib/supabase-helpers";
import { slugify } from "@/lib/utils";
import * as bcrypt from "bcryptjs";
import { z } from "zod";

// ============================================================
// SCHEMA
// ============================================================

const openingHourSchema = z.object({
  day: z.string(),
  isOpen: z.boolean(),
  openTime: z.string(),
  closeTime: z.string(),
});

const serviceDataSchema = z.object({
  name: z.string(),
  price: z.string(),
  duration: z.string(),
});

const staffDataSchema = z.object({
  name: z.string(),
  title: z.string(),
});

const completeOnboardingSchema = z.object({
  // User
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),

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

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;

// ============================================================
// ACTION
// ============================================================

export async function completeProOnboarding(data: CompleteOnboardingInput) {
  const parsed = completeOnboardingSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const d = parsed.data;

  // Check existing user
  const existingUser = await findByUnique("User", "email", d.email);
  if (existingUser) {
    return { error: "Un compte avec cet email existe déjà" };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(d.password, 12);

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

  // Create user
  const user = await insertRow("User", {
    firstName: d.firstName,
    lastName: d.lastName,
    name: `${d.firstName} ${d.lastName}`,
    email: d.email,
    phone: d.phone || null,
    passwordHash,
    role: "PRO_OWNER",
  });

  // Create salon
  const salon = await insertRow("Salon", {
    name: d.salonName,
    slug,
    category: d.salonCategory.toUpperCase().replace(/-/g, "_"),
    address: d.salonAddress,
    city: d.salonCity,
    postalCode: d.salonPostalCode || null,
    phone: d.salonPhone,
    email: d.salonEmail || null,
    description: d.salonDescription || null,
    ownerId: (user as Record<string, unknown>).id as string,
    isActive: false, // requires admin approval
  });

  const userId = (user as Record<string, unknown>).id as string;
  const salonId = (salon as Record<string, unknown>).id as string;

  // Create opening hours
  for (const h of d.openingHours) {
    if (h.isOpen) {
      const dayNum = dayMap[h.day];
      if (dayNum !== undefined) {
        await insertRow("OpeningHours", {
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
    if (!svc.name || !svc.price || !svc.duration) continue;

    const price = parseFloat(svc.price);
    const duration = parseInt(svc.duration);
    if (isNaN(price) || isNaN(duration) || price <= 0 || duration <= 0) continue;

    const service = await insertRow("Service", {
      salonId,
      name: svc.name,
      price,
      duration,
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

  return { success: true, userId, salonId, slug };
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