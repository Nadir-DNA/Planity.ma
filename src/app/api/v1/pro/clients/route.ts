import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser, getProSalonId } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface BookingRow {
  userId: string;
  totalPrice: number;
  startTime: string;
  status: string;
  user: { id: string; name: string | null; email: string | null; phone: string | null } | { id: string; name: string | null; email: string | null; phone: string | null }[] | null;
}

// GET /api/v1/pro/clients — clients du salon, agrégés depuis les réservations
export async function GET(request: Request) {
  try {
    const user = await getUser(request);
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    if (!["PRO_OWNER", "PRO_STAFF", "ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Accès réservé aux professionnels" }, { status: 403 });
    }

    const salonId = await getProSalonId(user);
    if (!salonId) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const { data: bookings, error } = await supabaseAdmin
      .from("Booking")
      .select("userId, totalPrice, startTime, status, user:User!userId(id, name, email, phone)")
      .eq("salonId", salonId)
      .order("startTime", { ascending: false })
      .limit(2000);

    if (error) {
      console.error("Pro clients fetch error:", error.message);
      return NextResponse.json({ error: "Erreur lors du chargement des clients" }, { status: 500 });
    }

    // Agrégat par client (dépenses = réservations terminées/en cours uniquement)
    const byUser = new Map<string, {
      id: string;
      name: string;
      email: string;
      phone: string | null;
      totalBookings: number;
      totalSpent: number;
      lastBooking: string;
      cancelledCount: number;
    }>();

    for (const b of (bookings || []) as BookingRow[]) {
      const u = Array.isArray(b.user) ? b.user[0] : b.user;
      if (!u) continue;

      let entry = byUser.get(u.id);
      if (!entry) {
        entry = {
          id: u.id,
          name: u.name || u.email || "Client",
          email: u.email || "",
          phone: u.phone,
          totalBookings: 0,
          totalSpent: 0,
          lastBooking: b.startTime,
          cancelledCount: 0,
        };
        byUser.set(u.id, entry);
      }

      if (["CANCELLED", "NO_SHOW"].includes(b.status)) {
        entry.cancelledCount += 1;
      } else {
        entry.totalBookings += 1;
        entry.totalSpent += b.totalPrice || 0;
        if (b.startTime > entry.lastBooking) entry.lastBooking = b.startTime;
      }
    }

    const clients = Array.from(byUser.values())
      .filter((c) => c.totalBookings > 0 || c.cancelledCount > 0)
      .sort((a, b) => (a.lastBooking < b.lastBooking ? 1 : -1));

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("Pro clients error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
