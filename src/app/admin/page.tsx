// src/app/admin/page.tsx
"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { StatCard, PageHeader, SectionCard, Table, TR, TD, Badge } from "@/components/admin/AdminUI";

interface Stats {
  summary: {
    totalReservations: number;
    activeReservations: number;
    monthReservations: number;
    totalRevenue: number;
    monthRevenue: number;
  };
  chartData: { month: string; revenue: number; count: number }[];
  vehicleStats: {
    id: string; name: string; brand: string; slot: string;
    available: boolean; count: number; revenue: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0c1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "0.7rem 1rem", fontSize: "0.8rem" }}>
      <div style={{ color: "#9CA3AF", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#F59E0B", fontWeight: 600 }}>${payload[0]?.value?.toLocaleString()}</div>
      <div style={{ color: "#6B7280", fontSize: "0.72rem" }}>{payload[1]?.value} reservas</div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
      <div style={{ color: "#4B5563", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Cargando métricas…</div>
    </div>
  );

  const s = stats?.summary;

  return (
    <div>
      <PageHeader
        title="Métricas"
        sub={`Resumen general · ${new Date().toLocaleDateString("es-CO", { month: "long", year: "numeric" })}`}
      />

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Ingresos totales"   value={`$${(s?.totalRevenue ?? 0).toLocaleString()}`} icon="💰" accent="#F59E0B" />
        <StatCard label="Este mes"           value={`$${(s?.monthRevenue ?? 0).toLocaleString()}`} sub="Ingresos del mes" icon="📅" accent="#22C55E" />
        <StatCard label="Reservas activas"   value={s?.activeReservations ?? 0} sub="En curso ahora" icon="🟢" accent="#3B82F6" />
        <StatCard label="Reservas este mes"  value={s?.monthReservations ?? 0} icon="📋" accent="#8B5CF6" />
        <StatCard label="Total histórico"    value={s?.totalReservations ?? 0} sub="Todas las reservas" icon="🗂" accent="#6B7280" />
      </div>

      {/* Revenue chart */}
      <SectionCard style={{ marginBottom: "2rem" }}>
        <div style={{ padding: "1.2rem 1.4rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.06em", color: "#E8E8F0" }}>
            Ingresos — Últimos 6 meses
          </div>
        </div>
        <div style={{ padding: "1.4rem", height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.chartData ?? []} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#4B5563", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                {(stats?.chartData ?? []).map((_, i) => (
                  <Cell key={i} fill={i === (stats?.chartData.length ?? 0) - 1 ? "#F59E0B" : "rgba(245,158,11,0.35)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* Vehicle performance */}
      <SectionCard>
        <div style={{ padding: "1.2rem 1.4rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.06em", color: "#E8E8F0" }}>
            Rendimiento por vehículo
          </div>
        </div>
        <Table headers={["Vehículo", "Slot", "Estado", "Reservas", "Ingresos generados"]}>
          {(stats?.vehicleStats ?? []).map((v) => (
            <TR key={v.id}>
              <TD>
                <div style={{ fontWeight: 500 }}>{v.name}</div>
                <div style={{ fontSize: "0.72rem", color: "#6B7280", marginTop: 2 }}>{v.brand}</div>
              </TD>
              <TD muted>{v.slot}</TD>
              <TD><Badge variant={v.available ? "available" : "unavailable"} /></TD>
              <TD>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{
                    height: 5, borderRadius: 3, width: 80,
                    background: "rgba(255,255,255,0.06)",
                  }}>
                    <div style={{
                      height: "100%", borderRadius: 3,
                      width: `${Math.min(100, (v.count / Math.max(1, Math.max(...(stats?.vehicleStats.map(x => x.count) ?? [1])))) * 100)}%`,
                      background: "#F59E0B",
                    }} />
                  </div>
                  <span style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>{v.count}</span>
                </div>
              </TD>
              <TD style={{ color: "#F59E0B", fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.04em" }}>
                ${v.revenue.toLocaleString()}
              </TD>
            </TR>
          ))}
          {!stats?.vehicleStats?.length && (
            <TR><TD colSpan={5} muted style={{ textAlign: "center", padding: "2rem" }}>Sin datos aún</TD></TR>
          )}
        </Table>
      </SectionCard>
    </div>
  );
}
