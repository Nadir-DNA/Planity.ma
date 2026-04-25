"use server";

import { db } from "../../lib/db";
import { SalonCategory } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { z } from "zod";
import { createSalonSchema } from "../validators/salon.schema";
import { slugify } from "../../lib/utils";

const proRegisterSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  salon: createSalonSchema,
});

export async function registerProUser(formData: FormData) {
  const data = proRegisterSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    salon: {
      name: formData.get("salonName"),
      category: formData.get("salonCategory"),
      address: formData.get("salonAddress"),
      city: formData.get("salonCity"),
      postalCode: formData.get("salonPostalCode") || undefined,
      phone: formData.get("salonPhone"),
      email: formData.get("salonEmail") || undefined,
      description: formData.get("salonDescription") || undefined,
    },
  });

  // Check existing user
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return { error: "Un compte avec cet email existe deja" };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  // Create user with PRO_OWNER role
  const user = await db.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone || null,
      passwordHash,
      role: "PRO_OWNER",
    },
  });

  // Generate unique slug
  let slug = slugify(data.salon.name + " " + data.salon.city);
  let existing = await db.salon.findUnique({ where: { slug } });
  let counter = 1;
  while (existing) {
    slug = slugify(data.salon.name + " " + data.salon.city + " " + counter);
    existing = await db.salon.findUnique({ where: { slug } });
    counter++;
  }

  // Create salon
  const salon = await db.salon.create({
    data: {
      name: data.salon.name,
      slug,
      category: data.salon.category as SalonCategory,
      address: data.salon.address,
      city: data.salon.city,
      postalCode: data.salon.postalCode,
      phone: data.salon.phone,
      email: data.salon.email,
      description: data.salon.description,
      ownerId: user.id,
      isActive: false,
    },
  });

  return { success: true, userId: user.id, salonId: salon.id };
}
