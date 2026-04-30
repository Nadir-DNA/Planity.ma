"use server";

import { findByUnique, insertRow } from "@/lib/supabase-helpers";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

export async function registerUser(formData: FormData) {
  const data = registerSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });

  // Check existing user
  const existingUser = await findByUnique("User", "email", data.email);

  if (existingUser) {
    return { error: "Un compte avec cet email existe deja" };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await insertRow("User", {
    firstName: data.firstName,
    lastName: data.lastName,
    name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phone: data.phone || null,
    passwordHash,
    role: "CONSUMER",
  });

  return { success: true, userId: (user as Record<string, unknown>).id };
}