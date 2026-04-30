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

    const services = await db.service.findMany({
      where: { salonId: salon.id },
      orderBy: { order: "asc" },
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

    return NextResponse.json({ services });
  } catch (error) {
    console.error("Services fetch error:", error);
    return NextResponse.json(
      { error: "Erreur lors du chargement des services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();
    const { name, price, duration, description, categoryId, isOnlineBookable, isActive, bufferTime, assignedStaffIds } = body;

    if (!name || price === undefined || !duration) {
      return NextResponse.json(
        { error: "Nom, prix et durée sont obligatoires" },
        { status: 400 }
      );
    }

    const maxOrder = await db.service.findFirst({
      where: { salonId: salon.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const service = await db.service.create({
      data: {
        salonId: salon.id,
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        description: description || null,
        categoryId: categoryId || null,
        isOnlineBookable: isOnlineBookable ?? true,
        isActive: isActive ?? true,
        bufferTime: bufferTime ? parseInt(bufferTime) : 0,
        order: (maxOrder?.order ?? -1) + 1,
        ...(assignedStaffIds?.length && {
          assignedStaff: {
            create: assignedStaffIds.map((staffId: string) => ({
              staffId,
            })),
          },
        }),
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

    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("Service creation error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du service" },
      { status: 500 }
    );
  }
}