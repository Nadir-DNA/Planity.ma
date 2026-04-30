import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const salon = await db.salon.findFirst({
      where: { ownerId: user.id },
    });

    if (!salon) {
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

    const [
      bookingsToday,
      bookingsThisWeek,
      completedThisMonth,
      newClientsThisMonth,
      pendingBookings,
      totalRevenue,
    ] = await Promise.all([
      // Rendez-vous aujourd'hui (CONFIRMED)
      db.booking.count({
        where: {
          salonId: salon.id,
          status: "CONFIRMED",
          startTime: { gte: todayStart, lte: todayEnd },
        },
      }),
      // Rendez-vous cette semaine (CONFIRMED + PENDING)
      db.booking.count({
        where: {
          salonId: salon.id,
          status: { in: ["CONFIRMED", "PENDING"] },
          startTime: { gte: weekStart, lte: weekEnd },
        },
      }),
      // Completed bookings this month (for revenue)
      db.booking.findMany({
        where: {
          salonId: salon.id,
          status: "COMPLETED",
          startTime: { gte: monthStart, lte: monthEnd },
        },
        select: { totalPrice: true },
      }),
      // New clients this month
      db.booking.findMany({
        where: {
          salonId: salon.id,
          startTime: { gte: monthStart, lte: monthEnd },
        },
        select: { userId: true },
        distinct: ["userId"],
      }),
      // Pending bookings
      db.booking.count({
        where: {
          salonId: salon.id,
          status: "PENDING",
        },
      }),
      // Total revenue (all completed)
      db.booking.aggregate({
        where: {
          salonId: salon.id,
          status: "COMPLETED",
        },
        _sum: { totalPrice: true },
      }),
    ]);

    const monthlyRevenue = completedThisMonth.reduce((sum, b) => sum + b.totalPrice, 0);
    const newClientsCount = newClientsThisMonth.length;

    return NextResponse.json({
      bookingsToday,
      bookingsThisWeek,
      monthlyRevenue,
      newClientsThisMonth: newClientsCount,
      pendingBookings,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des statistiques" },
      { status: 500 }
    );
  }
}