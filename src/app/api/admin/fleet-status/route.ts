// src/app/api/admin/fleet-status/route.ts
// Public endpoint — no auth required — used by the showroom canvas
import { NextResponse } from "next/server";
import { APEX_VEHICLES } from "@/lib/data";

export async function GET() {
  // Merge static vehicle data with in-memory admin overrides
  const overrides: Record<string, boolean> =
    (global as { _fleetOverrides?: Record<string, boolean> })._fleetOverrides ?? {};

  const fleet = APEX_VEHICLES.map((v) => ({
    id:        v.id,
    available: v.id in overrides ? overrides[v.id] : v.available,
  }));

  return NextResponse.json({ fleet }, {
    headers: { "Cache-Control": "no-store" },
  });
}
