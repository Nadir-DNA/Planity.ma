import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { salonId: string } }
) {
  try {
    const salonId = params.salonId;

    const staff = await db.staffMember.findMany({
      where: { salonId, isActive: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        displayName: true,
        title: true,
        color: true,
        avatar: true,
        bio: true,
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
