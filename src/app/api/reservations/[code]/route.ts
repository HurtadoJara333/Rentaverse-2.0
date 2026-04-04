// src/app/api/reservations/[code]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Reservation from "@/lib/models/Reservation";

export async function GET(
  _req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    await connectDB();
    const reservation = await Reservation.findOne({
      confirmationCode: params.code.toUpperCase(),
    })
      .select("-customerPhone -customerIdDoc -businessId -__v") // hide sensitive fields
      .lean();

    if (!reservation) {
      return NextResponse.json({ error: "Reserva no encontrada" }, { status: 404 });
    }

    return NextResponse.json({ reservation });
  } catch (err) {
    console.error("[GET /api/reservations/[code]]", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
