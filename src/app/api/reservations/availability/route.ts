// src/app/api/reservations/availability/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Reservation from "@/lib/models/Reservation";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const startDate = searchParams.get("startDate");
    const endDate   = searchParams.get("endDate");

    if (!vehicleId || !startDate || !endDate) {
      return NextResponse.json({ error: "vehicleId, startDate y endDate son requeridos" }, { status: 400 });
    }

    await connectDB();

    const start = new Date(startDate);
    const end   = new Date(endDate);

    // Find any overlapping reservation for this vehicle
    const conflict = await Reservation.findOne({
      vehicleId,
      status: { $ne: "cancelled" },
      startDate: { $lt: end },
      endDate:   { $gt: start },
    }).lean();

    // Also return all booked ranges for this vehicle (for calendar display)
    const bookedRanges = await Reservation.find({
      vehicleId,
      status: { $ne: "cancelled" },
      endDate: { $gt: new Date() }, // only future
    })
      .select("startDate endDate")
      .lean();

    return NextResponse.json({
      available: !conflict,
      conflict: conflict
        ? { startDate: conflict.startDate, endDate: conflict.endDate }
        : null,
      bookedRanges: bookedRanges.map((r) => ({
        startDate: r.startDate,
        endDate:   r.endDate,
      })),
    });
  } catch (err) {
    console.error("[GET /api/reservations/availability]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
