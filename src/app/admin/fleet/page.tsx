// src/app/admin/fleet/page.tsx
"use client";
import { useEffect, useState } from "react";
import { PageHeader, SectionCard, Badge, ActionBtn } from "@/components/admin/AdminUI";

interface FleetVehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  slot: string;
  pricePerDay: number;
  available: boolean;
  features: string[];
}

export default function FleetPage() {
  const [fleet, setFleet]       = useState<FleetVehicle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/admin/fleet");
    const d   = await res.json();
    setFleet(d.fleet ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggle = async (vehicleId: string, current: boolean) => {
    setToggling(vehicleId);
    await fetch("/api/admin/fleet", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vehicleId, available: !current }),
    });
    setFleet((prev) =>
      prev.map((v) => v.id === vehicleId ? { ...v, available: !current } : v)
    );
    setToggling(null);
  };

  const available   = fleet.filter((v) => v.available).length;
  const unavailable = fleet.length - available;

  return (
    <div>
      <PageHeader
        title="Gestión de Flota"
        sub={`${available} disponibles · ${unavailable} no disponibles`}
      />

      {loading ? (
        <div style={{ color: "#4B5563", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Cargando flota…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {fleet.map((v) => (
            <SectionCard key={v.id}>
              <div style={{ padding: "1.2rem 1.3rem" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "0.25rem" }}>
                      {v.category} · Slot {v.slot}
                    </div>
                    <div style={{ fontFamily: "var(--font-bebas)", fontSize: "1.15rem", letterSpacing: "0.04em", color: "#E8E8F0", lineHeight: 1 }}>
                      {v.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "0.2rem" }}>
                      {v.brand} · {v.year}
                    </div>
                  </div>
                  <Badge variant={v.available ? "available" : "unavailable"} />
                </div>

                {/* Features */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "1.1rem" }}>
                  {v.features.slice(0, 3).map((f) => (
                    <span key={f} style={{
                      fontSize: "0.68rem", color: "#6B7280",
                      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 4, padding: "0.18rem 0.5rem",
                    }}>{f}</span>
                  ))}
                </div>

                {/* Price + Toggle */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <span style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", color: "#F59E0B", letterSpacing: "0.04em" }}>
                      ${v.pricePerDay}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "#4B5563", marginLeft: "0.3rem" }}>/día</span>
                  </div>

                  <ActionBtn
                    onClick={() => toggle(v.id, v.available)}
                    variant={v.available ? "danger" : "gold"}
                    disabled={toggling === v.id}
                  >
                    {toggling === v.id
                      ? "Guardando…"
                      : v.available
                        ? "Deshabilitar"
                        : "Habilitar"}
                  </ActionBtn>
                </div>
              </div>

              {/* Status bar at bottom */}
              <div style={{
                height: 3,
                background: v.available ? "#22C55E" : "#374151",
                transition: "background 0.3s",
              }} />
            </SectionCard>
          ))}
        </div>
      )}

      {/* Info note */}
      <div style={{
        marginTop: "1.5rem", padding: "0.85rem 1rem",
        background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
        borderRadius: 8, fontSize: "0.78rem", color: "#6B7280", lineHeight: 1.65,
      }}>
        <strong style={{ color: "#F59E0B" }}>Nota:</strong>{" "}
        Los cambios de disponibilidad se reflejan inmediatamente en el showroom.
        Para persistir los cambios entre reinicios del servidor, conecta los overrides a MongoDB.
      </div>
    </div>
  );
}
