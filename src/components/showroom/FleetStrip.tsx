// src/components/showroom/FleetStrip.tsx
"use client";
import { motion } from "framer-motion";
import { useShowroomStore } from "@/stores/showroomStore";
import { APEX_VEHICLES } from "@/lib/data";

export default function FleetStrip() {
  const { selectedVehicle, selectVehicle } = useShowroomStore((s) => ({
    selectedVehicle: s.selectedVehicle,
    selectVehicle: s.selectVehicle,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fleet-strip"
      style={{
        position: "absolute", bottom: "1rem",
        left: "50%", transform: "translateX(-50%)",
        zIndex: 30, display: "flex", gap: "0.45rem", alignItems: "center",
        background: "rgba(2,2,10,0.9)", border: "1px solid var(--border)",
        borderRadius: "100px", padding: "0.5rem 0.9rem",
        backdropFilter: "blur(18px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        maxWidth: "calc(100vw - 2rem)", overflowX: "auto",
      }}
    >
      {/* Hint text */}
      <span className="fleet-strip__hint" style={{ fontSize: "0.62rem", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase", paddingRight: "0.5rem", borderRight: "1px solid var(--border)", whiteSpace: "nowrap" }}>
        🖱 Drag · Scroll · Click
      </span>

      {APEX_VEHICLES.map((v) => {
        const isActive = selectedVehicle?.id === v.id;
        const isUnavail = !v.available;
        return (
          <button
            key={v.id}
            onClick={() => selectVehicle(isActive ? null : v)}
            disabled={isUnavail}
            className={`fleet-strip__vehicle-button ${isActive ? 'fleet-strip__vehicle-button--active' : ''} ${isUnavail ? 'fleet-strip__vehicle-button--unavailable' : ''}`}
            style={{
              display: "flex", alignItems: "center", gap: "0.45rem",
              padding: "0.38rem 0.85rem", borderRadius: "100px", cursor: isUnavail ? "not-allowed" : "pointer",
              border: `1px solid ${isActive ? v.accentColor + "55" : "transparent"}`,
              background: isActive ? v.accentColor + "15" : "transparent",
              opacity: isUnavail ? 0.32 : 1,
              transition: "all 0.18s", whiteSpace: "nowrap",
              fontFamily: "var(--font-dm-sans)",
            }}
            onMouseEnter={(e) => { if (!isUnavail && !isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "var(--border)"; } }}
            onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
          >
            <span className="fleet-strip__vehicle-color" style={{ width: 7, height: 7, borderRadius: "50%", background: v.accentColor, flexShrink: 0, boxShadow: isActive ? `0 0 8px ${v.accentColor}` : "none" }} />
            <span className="fleet-strip__vehicle-name" style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text)" }}>{v.name}</span>
            <span className="fleet-strip__vehicle-price" style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem", color: "var(--gold)" }}>
              ${v.pricePerDay}
            </span>
          </button>
        );
      })}
    </motion.div>
  );
}
