"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { verifyTurnstile } from "@/lib/turnstile";

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  turnstileToken: z.string().optional(),
});

export async function registerUser(formData: FormData) {
  const data = registerSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    turnstileToken: formData.get("turnstileToken") as string | undefined,
  });

  // Verify Cloudflare Turnstile CAPTCHA
  const turnstileResult = await verifyTurnstile(data.turnstileToken || "");
  if (!turnstileResult.success) {
    return { error: turnstileResult.error || "Vérification CAPTCHA échouée" };
  }

  // Check existing user
  const existingUser = await db.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return { error: "Un compte avec cet email existe deja" };
  }

  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await db.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone || null,
      passwordHash,
      role: "CONSUMER",
    },
  });

  return { success: true, userId: user.id };
}
