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

    // Verify service belongs to this salon
    const existing = await db.service.findUnique({
      where: { id },
    });

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    const body = await request.json();
    const { name, price, duration, description, categoryId, isOnlineBookable, isActive, bufferTime, assignedStaffIds } = body;

    // Update staff assignments if provided
    if (assignedStaffIds !== undefined) {
      await db.staffService.deleteMany({
        where: { serviceId: id },
      });
      if (assignedStaffIds.length > 0) {
        await db.staffService.createMany({
          data: assignedStaffIds.map((staffId: string) => ({
            serviceId: id,
            staffId,
          })),
        });
      }
    }

    const service = await db.service.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
        ...(description !== undefined && { description }),
        ...(categoryId !== undefined && { categoryId }),
        ...(isOnlineBookable !== undefined && { isOnlineBookable }),
        ...(isActive !== undefined && { isActive }),
        ...(bufferTime !== undefined && { bufferTime: parseInt(bufferTime) }),
      },
      include: {
        category: { select: { name: true } },
        assignedStaff: {
          select: {
            staffId: true,
            staff: { select: { id: true, displayName: true, color: true } },
          },
        },
      },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error("Service update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification du service" },
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

    const existing = await db.service.findUnique({
      where: { id },
    });

    if (!existing || existing.salonId !== salon.id) {
      return NextResponse.json({ error: "Service non trouvé" }, { status: 404 });
    }

    await db.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Service delete error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du service" },
      { status: 500 }
    );
  }
}