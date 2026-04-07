// src/app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/mongodb";
import Reservation from "@/lib/models/Reservation";
import { APEX_VEHICLES } from "@/lib/data";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  await connectDB();

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd   = endOfMonth(now);

  // ── Aggregate stats ──────────────────────────────────────────────────────
  const [
    totalReservations,
    activeReservations,
    monthReservations,
    revenueAgg,
    monthRevenueAgg,
    byVehicleAgg,
    last6MonthsAgg,
  ] = await Promise.all([
    // Total reservations ever
    Reservation.countDocuments({ status: { $ne: "cancelled" } }),

    // Currently active (today between start and end)
    Reservation.countDocuments({
      status: { $ne: "cancelled" },
      startDate: { $lte: now },
      endDate:   { $gte: now },
    }),

    // This month
    Reservation.countDocuments({
      status: { $ne: "cancelled" },
      createdAt: { $gte: monthStart, $lte: monthEnd },
    }),

    // Total revenue
    Reservation.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),

    // This month revenue
    Reservation.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]),

    // By vehicle
    Reservation.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: "$vehicleId", count: { $sum: 1 }, revenue: { $sum: "$totalPrice" }, name: { $first: "$vehicleName" } } },
      { $sort: { count: -1 } },
    ]),

    // Last 6 months revenue
    Reservation.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: subMonths(now, 5) },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          count:   { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Build 6-month chart data (fill missing months with 0)
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d   = subMonths(now, 5 - i);
    const key = format(d, "yyyy-MM");
    const found = last6MonthsAgg.find((m: { _id: string }) => m._id === key);
    return {
      month:   format(d, "MMM"),
      revenue: found?.revenue ?? 0,
      count:   found?.count   ?? 0,
    };
  });

  // Vehicle occupation %
  const vehicleStats = APEX_VEHICLES.map((v) => {
    const agg = byVehicleAgg.find((a: { _id: string }) => a._id === v.id);
    return {
      id:       v.id,
      name:     v.name,
      brand:    v.brand,
      slot:     v.slot,
      available:v.available,
      count:    agg?.count   ?? 0,
      revenue:  agg?.revenue ?? 0,
    };
  }).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    summary: {
      totalReservations,
      activeReservations,
      monthReservations,
      totalRevenue:  revenueAgg[0]?.total  ?? 0,
      monthRevenue:  monthRevenueAgg[0]?.total ?? 0,
    },
    chartData,
    vehicleStats,
  });
}
