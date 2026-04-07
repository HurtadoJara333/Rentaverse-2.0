// src/app/api/admin/fleet/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { APEX_VEHICLES } from "@/lib/data";

// In-memory toggle store — in production replace with DB
// This persists for the Node.js process lifetime (survives hot-reloads in dev)
declare global { var _fleetOverrides: Record<string, boolean> | undefined }
const overrides: Record<string, boolean> = global._fleetOverrides ?? {};
global._fleetOverrides = overrides;

export async function GET() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const fleet = APEX_VEHICLES.map((v) => ({
    ...v,
    available: v.id in overrides ? overrides[v.id] : v.available,
  }));
  return NextResponse.json({ fleet });
}

export async function PATCH(req: NextRequest) {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { vehicleId, available } = await req.json();
  if (!vehicleId || typeof available !== "boolean") {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  overrides[vehicleId] = available;
  return NextResponse.json({ ok: true, vehicleId, available });
}
