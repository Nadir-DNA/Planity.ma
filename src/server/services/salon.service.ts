import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";
import type { CreateSalonInput } from "@/server/validators/salon.schema";

export async function createSalon(input: CreateSalonInput, ownerId: string) {
  let slug = slugify(input.name + " " + input.city);

  // Ensure unique slug
  let existing = await db.salon.findUnique({ where: { slug } });
  let counter = 1;
  while (existing) {
    slug = slugify(input.name + " " + input.city + " " + counter);
    existing = await db.salon.findUnique({ where: { slug } });
    counter++;
  }

  const salon = await db.salon.create({
    data: {
      name: input.name,
      slug,
      category: input.category as Parameters<typeof db.salon.create>[0]["data"]["category"],
      address: input.address,
      city: input.city,
      postalCode: input.postalCode,
      phone: input.phone,
      email: input.email,
      description: input.description,
      ownerId,
      isActive: false, // requires admin approval
    },
  });

  return salon;
}

export async function getSalonBySlug(slug: string) {
  return db.salon.findUnique({
    where: { slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          category: true,
          assignedStaff: { include: { staff: true } },
        },
      },
      staff: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
      openingHours: { orderBy: { dayOfWeek: "asc" } },
      photos: { orderBy: { order: "asc" } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, avatar: true } } },
      },
      _count: { select: { reviews: true, bookings: true } },
    },
  });
}

export async function searchSalons(params: {
  query?: string;
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { query, city, category, page = 1, limit = 20 } = params;

  const where: Record<string, unknown> = {
    isActive: true,
    isVerified: true,
  };

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (category) where.category = category.toUpperCase().replace(/-/g, "_");
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
    ];
  }

  const [salons, total] = await Promise.all([
    db.salon.findMany({
      where,
      orderBy: { reviewCount: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        services: { where: { isActive: true }, take: 3 },
        _count: { select: { reviews: true } },
      },
    }),
    db.salon.count({ where }),
  ]);

  return { salons, total, page, totalPages: Math.ceil(total / limit) };
}

export async function updateSalonRating(salonId: string) {
  const stats = await db.review.aggregate({
    where: { salonId, status: "APPROVED" },
    _avg: { overallRating: true },
    _count: true,
  });

  await db.salon.update({
    where: { id: salonId },
    data: {
      averageRating: stats._avg.overallRating || 0,
      reviewCount: stats._count,
    },
  });
}
