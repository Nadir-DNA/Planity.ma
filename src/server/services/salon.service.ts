import { supabaseAdmin, findByUnique, findMany, insertRow, updateRow, countRows } from "@/lib/supabase-helpers";
import { slugify } from "@/lib/utils";
import type { CreateSalonInput } from "@/server/validators/salon.schema";

export async function createSalon(input: CreateSalonInput, ownerId: string) {
  let slug = slugify(input.name + " " + input.city);

  // Ensure unique slug
  let existing = await findByUnique("Salon", "slug", slug);
  let counter = 1;
  while (existing) {
    slug = slugify(input.name + " " + input.city + " " + counter);
    existing = await findByUnique("Salon", "slug", slug);
    counter++;
  }

  const salon = await insertRow("Salon", {
    name: input.name,
    slug,
    category: input.category.toUpperCase().replace(/-/g, "_"),
    address: input.address,
    city: input.city,
    postalCode: input.postalCode || null,
    phone: input.phone,
    email: input.email || null,
    description: input.description || null,
    ownerId,
    isActive: false, // requires admin approval
  });

  return salon;
}

export async function getSalonBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("Salon")
    .select(`
      *,
      services:Service!salonId(*, category:ServiceCategory(*), assignedStaff:StaffService(*, staff:StaffMember(*))),
      staff:StaffMember!salonId(*),
      openingHours:OpeningHours(*),
      photos:SalonPhoto(*),
      reviews:Review!salonId(*, user:User!userId(id, name, avatar))
    `)
    .eq("slug", slug)
    .eq("services.isActive", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw new Error(`getSalonBySlug: ${error.message}`);
  }
  return data;
}

export async function searchSalons(params: {
  query?: string;
  city?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { query, city, category, page = 1, limit = 20 } = params;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let qb = supabaseAdmin
    .from("Salon")
    .select(`
      *,
      services:Service!salonId(*),
      _count:Review!salonId(count)
    `, { count: "exact" })
    .eq("isActive", true)
    .eq("isVerified", true);

  if (city) qb = qb.ilike("city", `%${city}%`);
  if (category) qb = qb.eq("category", category.toUpperCase().replace(/-/g, "_"));
  if (query) {
    qb = qb.or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`);
  }

  qb = qb.order("reviewCount", { ascending: false }).range(from, to);

  const { data, count, error } = await qb;
  if (error) throw new Error(`searchSalons: ${error.message}`);

  return {
    salons: data || [],
    total: count ?? 0,
    page,
    totalPages: Math.ceil((count ?? 0) / limit),
  };
}

export async function updateSalonRating(salonId: string) {
  // Aggregate reviews — Supabase doesn't have a direct .aggregate(), use an RPC or do it manually
  const { data: reviews, error } = await supabaseAdmin
    .from("Review")
    .select("overallRating")
    .eq("salonId", salonId)
    .eq("status", "APPROVED");

  if (error) throw new Error(`updateSalonRating: ${error.message}`);

  const count = reviews?.length ?? 0;
  const avg = count > 0
    ? reviews!.reduce((sum: number, r: { overallRating: number }) => sum + r.overallRating, 0) / count
    : 0;

  await updateRow("Salon", salonId, {
    averageRating: avg,
    reviewCount: count,
  });
}