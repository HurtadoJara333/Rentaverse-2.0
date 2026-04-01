// src/components/showroom/ShowroomHUD.tsx
"use client";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { APEX_VEHICLES } from "@/lib/data";

const MobileControls = dynamic(() => import("./MobileControls"), { ssr: false });

interface Props { onBack: () => void; }

export default function ShowroomHUD({ onBack }: Props) {
  const available = APEX_VEHICLES.length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="showroom-hud"
        style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 30,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", height: 56,
          background: "linear-gradient(to bottom, rgba(2,2,10,0.97) 0%, rgba(2,2,10,0.6) 70%, transparent)",
          backdropFilter: "blur(10px)",
          pointerEvents: "none",
        }}
      >
        <div className="showroom-hud__brand">
          <div className="showroom-hud__title" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.45rem", letterSpacing: "0.12em", color: "var(--gold)", lineHeight: 1 }}>
            APEX RENTALS
          </div>
          <div className="showroom-hud__subtitle" style={{ fontSize: "0.6rem", color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: 2 }}>
            Showroom 3D · Planta Principal
          </div>
        </div>

        <div className="showroom-hud__actions" style={{ display: "flex", alignItems: "center", gap: "0.6rem", pointerEvents: "all" }}>
          <Chip>🏛 Vista 3D</Chip>
          <Chip color="blue">{available} vehículos</Chip>
          <button
            onClick={onBack}
            className="showroom-hud__back-button"
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid var(--border)",
              color: "var(--muted2)", borderRadius: 4, padding: "0.38rem 0.9rem",
              fontSize: "0.78rem", cursor: "pointer", letterSpacing: "0.03em",
              fontFamily: "var(--font-dm-sans)", transition: "all 0.2s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--muted2)"; }}
          >
            ← Sitio principal
          </button>
        </div>
      </motion.div>

      {/* Mobile joystick — only renders on touch devices */}
      <MobileControls onDrag={() => {}} />
    </>
  );
}

function Chip({ children, color = "gold" }: { children: React.ReactNode; color?: "gold" | "blue" }) {
  const colors = {
    gold: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)", text: "var(--gold)" },
    blue: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", text: "#3B82F6" },
  };
  const c = colors[color];
  return (
    <span className={`showroom-hud__chip showroom-hud__chip--${color}`} style={{
      fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
      borderRadius: "100px", padding: "0.25rem 0.75rem",
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      {children}
    </span>
  );
}
