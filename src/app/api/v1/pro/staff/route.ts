import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const salon = await db.salon.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const staff = await db.staffMember.findMany({
      where: { salonId: salon.id },
      orderBy: { order: "asc" },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        services: {
          select: {
            serviceId: true,
            service: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Staff fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement de l'équipe" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const salon = await db.salon.findFirst({
      where: { ownerId: session.user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, title, bio, color, isActive, schedules } = body;

    if (!displayName) {
      return NextResponse.json(
        { error: "Le nom est obligatoire" },
        { status: 400 }
      );
    }

    const maxOrder = await db.staffMember.findFirst({
      where: { salonId: salon.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const staffMember = await db.staffMember.create({
      data: {
        salonId: salon.id,
        displayName,
        title: title || null,
        bio: bio || null,
        color: color || "#3B82F6",
        isActive: isActive ?? true,
        order: (maxOrder?.order ?? -1) + 1,
        ...(schedules?.length && {
          schedules: {
            create: schedules.map(
              (s: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }) => ({
                dayOfWeek: s.dayOfWeek,
                startTime: s.startTime,
                endTime: s.endTime,
                isWorking: s.isWorking,
              })
            ),
          },
        }),
      },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        services: {
          select: {
            serviceId: true,
            service: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ staff: staffMember }, { status: 201 });
  } catch (error) {
    console.error("Staff creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du membre" },
      { status: 500 }
    );
  }
}