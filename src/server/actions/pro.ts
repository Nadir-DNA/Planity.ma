"use server";

import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { SalonCategory } from "@prisma/client";
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
  const existingUser = await db.user.findUnique({ where: { email: d.email } });
  if (existingUser) {
    return { error: "Un compte avec cet email existe déjà" };
  }

  // Hash password
  const passwordHash = await bcrypt.hash(d.password, 12);

  // Generate unique slug
  let slug = slugify(d.salonName + " " + d.salonCity);
  let existing = await db.salon.findUnique({ where: { slug } });
  let counter = 1;
  while (existing) {
    slug = slugify(d.salonName + " " + d.salonCity + " " + counter);
    existing = await db.salon.findUnique({ where: { slug } });
    counter++;
  }

  // Map French day names to dayOfWeek numbers (0=Monday)
  const dayMap: Record<string, number> = {
    Lundi: 0, Mardi: 1, Mercredi: 2, Jeudi: 3, Vendredi: 4, Samedi: 5, Dimanche: 6,
  };

  // Create everything in a transaction
  const result = await db.$transaction(async (tx) => {
    // 1. Create user
    const user = await tx.user.create({
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        name: `${d.firstName} ${d.lastName}`,
        email: d.email,
        phone: d.phone || null,
        passwordHash,
        role: "PRO_OWNER",
      },
    });

    // 2. Create salon
    const salon = await tx.salon.create({
      data: {
        name: d.salonName,
        slug,
        category: d.salonCategory.toUpperCase().replace(/-/g, "_") as SalonCategory,
        address: d.salonAddress,
        city: d.salonCity,
        postalCode: d.salonPostalCode,
        phone: d.salonPhone,
        email: d.salonEmail,
        description: d.salonDescription,
        ownerId: user.id,
        isActive: false, // requires admin approval
      },
    });

    // 3. Create opening hours
    for (const h of d.openingHours) {
      if (h.isOpen) {
        const dayNum = dayMap[h.day];
        if (dayNum !== undefined) {
          await tx.openingHours.create({
            data: {
              salonId: salon.id,
              dayOfWeek: dayNum,
              openTime: h.openTime,
              closeTime: h.closeTime,
              isClosed: false,
            },
          });
        }
      }
    }

    // 4. Create staff members
    const staffColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4"];
    const createdStaff: { id: string; name: string; title?: string }[] = [];

    for (let i = 0; i < d.staff.length; i++) {
      const s = d.staff[i];
      if (!s.name) continue;

      const staffMember = await tx.staffMember.create({
        data: {
          salonId: salon.id,
          displayName: s.name,
          title: s.title || undefined,
          color: staffColors[i % staffColors.length],
          isActive: true,
          order: i,
        },
      });

      // Create default schedule for each day (same as salon hours)
      for (const h of d.openingHours) {
        if (h.isOpen) {
          const dayNum = dayMap[h.day];
          if (dayNum !== undefined) {
            await tx.staffSchedule.create({
              data: {
                staffId: staffMember.id,
                dayOfWeek: dayNum,
                startTime: h.openTime,
                endTime: h.closeTime,
                isWorking: true,
              },
            });
          }
        }
      }

      createdStaff.push({ id: staffMember.id, name: s.name, title: s.title });
    }

    // 5. Create services
    for (let i = 0; i < d.services.length; i++) {
      const svc = d.services[i];
      if (!svc.name || !svc.price || !svc.duration) continue;

      const price = parseFloat(svc.price);
      const duration = parseInt(svc.duration);
      if (isNaN(price) || isNaN(duration) || price <= 0 || duration <= 0) continue;

      const service = await tx.service.create({
        data: {
          salonId: salon.id,
          name: svc.name,
          price,
          duration,
          isActive: true,
          isOnlineBookable: true,
          order: i,
        },
      });

      // Assign all staff to this service
      for (const sm of createdStaff) {
        await tx.staffService.create({
          data: {
            staffId: sm.id,
            serviceId: service.id,
          },
        });
      }
    }

    return { success: true, userId: user.id, salonId: salon.id, slug };
  });

  return result;
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
  return db.$transaction(async (tx) => {
    const service = await tx.service.create({
      data: {
        salonId,
        name: data.name,
        price: data.price,
        duration: data.duration,
        description: data.description,
        categoryId: data.categoryId,
        isOnlineBookable: data.isOnlineBookable ?? true,
        isActive: true,
      },
    });

    // Assign staff
    if (data.staffIds?.length) {
      await Promise.all(
        data.staffIds.map((staffId) =>
          tx.staffService.create({
            data: { staffId, serviceId: service.id },
          })
        )
      );
    }

    return service;
  });
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
  return db.$transaction(async (tx) => {
    const { staffIds, ...updateData } = data;
    await tx.service.update({
      where: { id: serviceId },
      data: updateData,
    });

    // Update staff assignments
    if (staffIds !== undefined) {
      await tx.staffService.deleteMany({ where: { serviceId } });
      await Promise.all(
        staffIds.map((staffId) =>
          tx.staffService.create({
            data: { staffId, serviceId },
          })
        )
      );
    }

    return tx.service.findUnique({
      where: { id: serviceId },
      include: { assignedStaff: { include: { staff: true } } },
    });
  });
}

export async function deleteService(serviceId: string) {
  return db.service.delete({ where: { id: serviceId } });
}

export async function createStaffMember(salonId: string, data: {
  displayName: string;
  title?: string;
  bio?: string;
  color?: string;
  userId?: string;
  schedules?: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  return db.$transaction(async (tx) => {
    const staff = await tx.staffMember.create({
      data: {
        salonId,
        displayName: data.displayName,
        title: data.title,
        bio: data.bio,
        color: data.color || "#3B82F6",
        userId: data.userId,
        isActive: true,
      },
    });

    // Create schedules
    if (data.schedules?.length) {
      await Promise.all(
        data.schedules.map((s) =>
          tx.staffSchedule.create({
            data: {
              staffId: staff.id,
              ...s,
              isWorking: true,
            },
          })
        )
      );
    }

    return staff;
  });
}

export async function updateStaffMember(staffId: string, data: {
  displayName?: string;
  title?: string;
  bio?: string;
  color?: string;
  isActive?: boolean;
  schedules?: { dayOfWeek: number; startTime: string; endTime: string }[];
}) {
  return db.$transaction(async (tx) => {
    const { schedules, ...updateData } = data;
    await tx.staffMember.update({
      where: { id: staffId },
      data: updateData,
    });

    // Update schedules
    if (schedules !== undefined) {
      await tx.staffSchedule.deleteMany({ where: { staffId } });
      await Promise.all(
        schedules.map((s) =>
          tx.staffSchedule.create({
            data: {
              staffId,
              ...s,
              isWorking: true,
            },
          })
        )
      );
    }

    return tx.staffMember.findUnique({
      where: { id: staffId },
      include: { schedules: true },
    });
  });
}

export async function deleteStaffMember(staffId: string) {
  return db.staffMember.delete({ where: { id: staffId } });
}
