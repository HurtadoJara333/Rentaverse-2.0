// src/app/api/admin/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/mongodb";
import Reservation from "@/lib/models/Reservation";

// GET — list with filters
export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await connectDB();
  const { searchParams } = new URL(req.url);

  const status    = searchParams.get("status");    // confirmed|cancelled|all
  const vehicleId = searchParams.get("vehicleId");
  const search    = searchParams.get("search");    // name / email / code
  const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit     = 20;

  const filter: Record<string, unknown> = {};
  if (status && status !== "all") filter.status = status;
  if (vehicleId && vehicleId !== "all") filter.vehicleId = vehicleId;
  if (search) {
    const re = new RegExp(search, "i");
    filter.$or = [
      { customerName:     re },
      { customerEmail:    re },
      { confirmationCode: re },
      { vehicleName:      re },
    ];
  }

  const [total, reservations] = await Promise.all([
    Reservation.countDocuments(filter),
    Reservation.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return NextResponse.json({
    reservations,
    pagination: { total, page, pages: Math.ceil(total / limit), limit },
  });
}

// PATCH — cancel a reservation
export async function PATCH(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await connectDB();
  const { id, status } = await req.json();

  if (!id || !["confirmed", "cancelled"].includes(status)) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const updated = await Reservation.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).lean();

  if (!updated) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ ok: true, reservation: updated });
}
