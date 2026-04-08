// src/app/api/showroom/placements/route.ts
import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Showroom from "@/lib/models/Showroom"
import { DEFAULT_SHOWROOM } from "@/lib/panoramaData"

// GET — load placements (falls back to defaults if not yet saved)
export async function GET() {
  try {
    await connectDB()
    const doc = await Showroom.findOne({ showroomId: "apex-main" }).lean()

    if (!doc) {
      // Return defaults — not yet configured
      return NextResponse.json({
        showroomId:  DEFAULT_SHOWROOM.id,
        panoramaUrl: DEFAULT_SHOWROOM.panoramaUrl,
        floorY:      DEFAULT_SHOWROOM.floorY,
        placements:  DEFAULT_SHOWROOM.placements,
        isDefault:   true,
      })
    }

    return NextResponse.json({
      showroomId:  doc.showroomId,
      panoramaUrl: doc.panoramaUrl,
      floorY:      doc.floorY,
      placements:  doc.placements,
      isDefault:   false,
    })
  } catch (err) {
    console.error("[GET /api/showroom/placements]", err)
    // Always return defaults on error so showroom doesn't break
    return NextResponse.json({
      ...DEFAULT_SHOWROOM,
      showroomId: DEFAULT_SHOWROOM.id,
      isDefault: true,
    })
  }
}

// POST — save placements (admin only in production — add requireAdmin() here)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { placements, panoramaUrl, floorY } = body

    if (!Array.isArray(placements)) {
      return NextResponse.json({ error: "placements must be an array" }, { status: 400 })
    }

    await connectDB()

    const doc = await Showroom.findOneAndUpdate(
      { showroomId: "apex-main" },
      {
        showroomId:  "apex-main",
        panoramaUrl: panoramaUrl ?? DEFAULT_SHOWROOM.panoramaUrl,
        floorY:      floorY ?? DEFAULT_SHOWROOM.floorY,
        placements,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ ok: true, placements: doc.placements })
  } catch (err) {
    console.error("[POST /api/showroom/placements]", err)
    return NextResponse.json({ error: "Error saving placements" }, { status: 500 })
  }
}
