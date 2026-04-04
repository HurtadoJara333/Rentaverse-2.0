// src/app/api/reservations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Reservation from "@/lib/models/Reservation";
import { reservationSchema } from "@/lib/validations";
import { APEX_VEHICLES } from "@/lib/data";
import { sendConfirmationEmail } from "@/lib/email";
import { differenceInCalendarDays } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    // 1 — Parse body
    const body = await req.json();
    console.log("[POST /api/reservations] body:", JSON.stringify(body, null, 2));

    // 2 — Validate schema
    const parsed = reservationSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      console.error("[POST /api/reservations] validation errors:", errors);
      return NextResponse.json({ error: "Datos inválidos", details: errors }, { status: 400 });
    }

    const {
      vehicleId, startDate, endDate,
      customerName, customerEmail, customerPhone, customerIdDoc,
      businessId,
    } = parsed.data;

    // 3 — Find vehicle
    const vehicle = APEX_VEHICLES.find((v) => v.id === vehicleId);
    if (!vehicle) {
      console.error("[POST /api/reservations] vehicle not found:", vehicleId);
      return NextResponse.json({ error: "Vehículo no encontrado" }, { status: 404 });
    }
    if (!vehicle.available) {
      return NextResponse.json({ error: "Vehículo no disponible" }, { status: 409 });
    }

    // 4 — Date math
    const start     = new Date(startDate);
    const end       = new Date(endDate);
    const totalDays = differenceInCalendarDays(end, start);
    console.log("[POST /api/reservations] dates:", { start, end, totalDays });

    if (totalDays < 1) {
      return NextResponse.json({ error: "Mínimo 1 día de reserva" }, { status: 400 });
    }

    // 5 — Connect DB
    console.log("[POST /api/reservations] connecting to DB...");
    await connectDB();
    console.log("[POST /api/reservations] DB connected");

    // 6 — Conflict check
    const conflict = await Reservation.findOne({
      vehicleId,
      status:    { $ne: "cancelled" },
      startDate: { $lt: end },
      endDate:   { $gt: start },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "El vehículo no está disponible para las fechas seleccionadas" },
        { status: 409 }
      );
    }

    // 7 — Create reservation
    const totalPrice = totalDays * vehicle.pricePerDay;
    console.log("[POST /api/reservations] creating reservation...");

    const reservation = await Reservation.create({
      vehicleId,
      vehicleName:  vehicle.name,
      vehicleBrand: vehicle.brand,
      vehicleModel: vehicle.model,
      vehicleSlot:  vehicle.slot,
      pricePerDay:  vehicle.pricePerDay,
      startDate: start,
      endDate:   end,
      totalDays,
      totalPrice,
      customerName,
      customerEmail,
      customerPhone,
      customerIdDoc,
      businessId,
      status: "confirmed",
    });

    console.log("[POST /api/reservations] created:", reservation.confirmationCode);

    // 8 — Send email (non-blocking)
    sendConfirmationEmail({
      to:               customerEmail,
      customerName,
      confirmationCode: reservation.confirmationCode,
      vehicleName:      reservation.vehicleName,
      vehicleBrand:     reservation.vehicleBrand,
      vehicleSlot:      reservation.vehicleSlot,
      startDate:        reservation.startDate,
      endDate:          reservation.endDate,
      totalDays:        reservation.totalDays,
      totalPrice:       reservation.totalPrice,
      pricePerDay:      vehicle.pricePerDay,
    }).catch((e) => console.error("[reservations] email error:", e));

    return NextResponse.json(
      {
        success: true,
        reservation: {
          id:               String(reservation._id),
          confirmationCode: reservation.confirmationCode,
          vehicleName:      reservation.vehicleName,
          vehicleSlot:      reservation.vehicleSlot,
          startDate:        reservation.startDate,
          endDate:          reservation.endDate,
          totalDays:        reservation.totalDays,
          totalPrice:       reservation.totalPrice,
          customerName:     reservation.customerName,
          customerEmail:    reservation.customerEmail,
          status:           reservation.status,
        },
      },
      { status: 201 }
    );

  } catch (err: unknown) {
    // Log the full error with stack trace in dev
    if (err instanceof Error) {
      console.error("[POST /api/reservations] ERROR:", err.message);
      console.error("[POST /api/reservations] STACK:", err.stack);
      // Surface Mongoose validation errors to the client in dev
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json(
          { error: err.message },
          { status: 500 }
        );
      }
    }
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get("vehicleId");
    const filter: Record<string, unknown> = { status: { $ne: "cancelled" } };
    if (vehicleId) filter.vehicleId = vehicleId;
    const reservations = await Reservation.find(filter)
      .select("vehicleId vehicleName startDate endDate totalDays totalPrice confirmationCode status customerName")
      .sort({ startDate: 1 })
      .limit(100)
      .lean();
    return NextResponse.json({ reservations });
  } catch (err) {
    console.error("[GET /api/reservations]", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
