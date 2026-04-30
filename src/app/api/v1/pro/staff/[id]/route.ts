import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const salon = await db.salon.findFirst({
      where: { ownerId: user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const existing = await db.staffMember.findUnique({
      where: { id },
    });

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { displayName, title, bio, color, isActive, schedules } = body;

    // Update schedules if provided
    if (schedules !== undefined) {
      await db.staffSchedule.deleteMany({
        where: { staffId: id },
      });
      if (schedules.length > 0) {
        await db.staffSchedule.createMany({
          data: schedules.map(
            (s: { dayOfWeek: number; startTime: string; endTime: string; isWorking: boolean }) => ({
              staffId: id,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              isWorking: s.isWorking,
            })
          ),
        });
      }
    }

    const staffMember = await db.staffMember.update({
      where: { id },
      data: {
        ...(displayName !== undefined && { displayName }),
        ...(title !== undefined && { title }),
        ...(bio !== undefined && { bio }),
        ...(color !== undefined && { color }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json({ staff: staffMember });
  } catch (error) {
    console.error("Staff update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du membre" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const salon = await db.salon.findFirst({
      where: { ownerId: user.id },
    });

    if (!salon) {
      return NextResponse.json({ error: "Salon non trouvé" }, { status: 404 });
    }

    const existing = await db.staffMember.findUnique({
      where: { id },
    });

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Membre non trouvé" }, { status: 404 });
    }

    await db.staffMember.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Staff delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du membre" },
      { status: 500 }
    );
  }
}