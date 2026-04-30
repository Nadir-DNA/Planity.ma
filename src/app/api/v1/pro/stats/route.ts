import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Find salon owned by user
    const { data: salon, error: salonError } = await supabaseAdmin
      .from("Salon")
      .select("id")
      .eq("ownerId", user.id)
      .maybeSingle();

    if (salonError || !salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Monday of this week
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() + mondayOffset);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Month boundaries
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Query all stats in parallel
    const [
      bookingsTodayResult,
      bookingsThisWeekResult,
      completedThisMonthResult,
      newClientsThisMonthResult,
      pendingBookingsResult,
      totalRevenueResult,
    ] = await Promise.all([
      // Rendez-vous aujourd'hui (CONFIRMED)
      supabaseAdmin
        .from("Booking")
        .select("id", { count: "exact", head: true })
        .eq("salonId", salon.id)
        .eq("status", "CONFIRMED")
        .gte("startTime", todayStart.toISOString())
        .lte("startTime", todayEnd.toISOString()),

      // Rendez-vous cette semaine (CONFIRMED + PENDING)
      supabaseAdmin
        .from("Booking")
        .select("id", { count: "exact", head: true })
        .eq("salonId", salon.id)
        .in("status", ["CONFIRMED", "PENDING"])
        .gte("startTime", weekStart.toISOString())
        .lte("startTime", weekEnd.toISOString()),

      // Completed bookings this month (for revenue)
      supabaseAdmin
        .from("Booking")
        .select("totalPrice")
        .eq("salonId", salon.id)
        .eq("status", "COMPLETED")
        .gte("startTime", monthStart.toISOString())
        .lte("startTime", monthEnd.toISOString()),

      // New clients this month (distinct userIds)
      supabaseAdmin
        .from("Booking")
        .select("userId")
        .eq("salonId", salon.id)
        .gte("startTime", monthStart.toISOString())
        .lte("startTime", monthEnd.toISOString()),

      // Pending bookings
      supabaseAdmin
        .from("Booking")
        .select("id", { count: "exact", head: true })
        .eq("salonId", salon.id)
        .eq("status", "PENDING"),

      // Total revenue (all completed)
      supabaseAdmin
        .from("Booking")
        .select("totalPrice")
        .eq("salonId", salon.id)
        .eq("status", "COMPLETED"),
    ]);

    const bookingsToday = bookingsTodayResult.count || 0;
    const bookingsThisWeek = bookingsThisWeekResult.count || 0;
    const monthlyRevenue = (completedThisMonthResult.data || []).reduce(
      (sum: number, b: { totalPrice: number }) => sum + (b.totalPrice || 0),
      0
    );
    const newClientsThisMonth = new Set(
      (newClientsThisMonthResult.data || []).map((b: { userId: string }) => b.userId)
    ).size;
    const pendingBookings = pendingBookingsResult.count || 0;
    const totalRevenue = (totalRevenueResult.data || []).reduce(
      (sum: number, b: { totalPrice: number }) => sum + (b.totalPrice || 0),
      0
    );

    return NextResponse.json({
      bookingsToday,
      bookingsThisWeek,
      monthlyRevenue,
      newClientsThisMonth,
      pendingBookings,
      totalRevenue,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}