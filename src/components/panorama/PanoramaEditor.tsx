// src/components/panorama/PanoramaEditor.tsx
"use client"
import { useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { usePanoramaEditor } from "./usePanoramaEditor"

type EditorProps = ReturnType<typeof usePanoramaEditor> & {
  panoramaUrl:    string
  floorY:         number
  onFloorYChange: (v: number) => void
}

// ── Repeating press button (hold to keep firing) ──────────────────────────────
function HoldButton({
  label, onAction, title, color = "#F59E0B", size = 36,
}: {
  label: string; onAction: () => void; title?: string
  color?: string; size?: number
}) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = () => {
    onAction()
    intervalRef.current = setInterval(onAction, 120)
  }
  const stop = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  return (
    <button
      title={title}
      onMouseDown={start}
      onMouseUp={stop}
      onMouseLeave={stop}
      onTouchStart={(e) => { e.preventDefault(); start() }}
      onTouchEnd={stop}
      style={{
        width: size, height: size,
        background: "rgba(245,158,11,0.1)",
        border: `1px solid rgba(245,158,11,0.3)`,
        borderRadius: 7, color,
        fontSize: size > 32 ? "1.1rem" : "0.85rem",
        cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        userSelect: "none", touchAction: "none",
        transition: "background 0.1s",
        flexShrink: 0,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(245,158,11,0.22)")}
    >
      {label}
    </button>
  )
}

// ── Control row with label ────────────────────────────────────────────────────
function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)" }}>
        {label}
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {children}
      </div>
    </div>
  )
}

// ── Per-vehicle controls panel ────────────────────────────────────────────────
function VehicleControls({
  vehicleId, name, accentColor, placement,
  onMove, onRotate, onElevate, onScale, onReplace, onDeselect,
}: {
  vehicleId:   string
  name:        string
  accentColor: string
  placement:   { yaw: number; distance: number; rotation: number; elevation: number; scale?: number }
  onMove:      (dir: "left" | "right" | "forward" | "backward") => void
  onRotate:    (delta: number) => void
  onElevate:   (delta: number) => void
  onScale:     (delta: number) => void
  onReplace:   () => void
  onDeselect:  () => void
}) {
  return (
    <motion.div
      key={vehicleId}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.18 }}
      style={{
        background: "rgba(2,2,10,0.95)",
        border: `1px solid ${accentColor}55`,
        borderRadius: 10, padding: "0.85rem",
        backdropFilter: "blur(14px)",
        boxShadow: `0 0 20px ${accentColor}18`,
        display: "flex", flexDirection: "column", gap: "0.7rem",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ width: 9, height: 9, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#F59E0B", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name}
          </div>
          <div style={{ fontSize: "0.58rem", color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
            {placement.yaw.toFixed(1)}° · {placement.distance.toFixed(2)}m · ↕{placement.elevation.toFixed(2)}m · ↻{placement.rotation.toFixed(0)}° · ×{(placement.scale??1).toFixed(2)}
          </div>
        </div>
        <button onClick={onDeselect} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: "0.9rem", padding: "0 0.2rem" }}>✕</button>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* ── YAW: pan in panorama (izq / der) */}
      <ControlRow label="Ángulo en panorama (izquierda / derecha)">
        <HoldButton label="◀" onAction={() => onMove("left")}  title="Mover izquierda" />
        <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {placement.yaw.toFixed(1)}°
        </div>
        <HoldButton label="▶" onAction={() => onMove("right")} title="Mover derecha" />
      </ControlRow>

      {/* ── DISTANCE: depth in scene (cerca / lejos) */}
      <ControlRow label="Profundidad (acercar / alejar)">
        <HoldButton label="+" onAction={() => onMove("forward")}  title="Acercar" />
        <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {placement.distance.toFixed(2)} m
        </div>
        <HoldButton label="−" onAction={() => onMove("backward")} title="Alejar" />
      </ControlRow>

      {/* ── ROTATION: spin around own Y axis */}
      <ControlRow label="Rotación del vehículo">
        <HoldButton label="↺" onAction={() => onRotate(-5)}  title="Girar izquierda" />
        <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {placement.rotation.toFixed(0)}°
        </div>
        <HoldButton label="↻" onAction={() => onRotate(5)}   title="Girar derecha" />
      </ControlRow>

      {/* ── ELEVATION: up / down */}
      <ControlRow label="Altura (subir / bajar)">
        <HoldButton label="↑" onAction={() => onElevate(0.05)}  title="Subir" />
        <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          {placement.elevation >= 0 ? "+" : ""}{placement.elevation.toFixed(2)} m
        </div>
        <HoldButton label="↓" onAction={() => onElevate(-0.05)} title="Bajar" />
      </ControlRow>


      {/* ── SCALE: make bigger / smaller */}
      <ControlRow label="Tamaño del modelo (escala)">
        <HoldButton label="−" onAction={() => onScale(-0.05)} title="Más pequeño" />
        <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: "0.72rem", color: "rgba(255,255,255,0.5)" }}>
          ×{placement.scale?.toFixed(2) ?? "1.00"}
        </div>
        <HoldButton label="+" onAction={() => onScale(0.05)}  title="Más grande" />
      </ControlRow>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)" }} />

      {/* Reposition button */}
      <button
        onClick={onReplace}
        style={{
          width: "100%", padding: "0.4rem",
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: 6, color: "rgba(245,158,11,0.8)",
          fontSize: "0.65rem", fontFamily: "var(--font-bebas)",
          letterSpacing: "0.08em", cursor: "pointer",
        }}
      >
        📍 REPOSICIONAR CON CLIC EN PISO
      </button>
    </motion.div>
  )
}

// ── Main panel ────────────────────────────────────────────────────────────────
export default function PanoramaEditor({
  isActive, placedVehicles, unplacedVehicles,
  selectedId, activeStep, isDirty, isSaving,
  selectVehicle, removePlacement,
  moveVehicle, rotateVehicle, adjustElevation, adjustScale, save,
  panoramaUrl, floorY, onFloorYChange,
}: EditorProps) {
  if (!isActive) return null

  const selected = placedVehicles.find((x) => x.vehicle.id === selectedId)

  return (
    <div
      style={{
        // Full-height scrollable column, fixed to left side
        position: "absolute",
        left: "1rem", top: "4.5rem", bottom: "1rem",
        width: 272,
        zIndex: 40,
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        // KEY FIX: allow the outer div to scroll
        overflowY: "auto",
        overflowX: "hidden",
        pointerEvents: "all",
        // scrollbar styling
        scrollbarWidth: "thin",
        scrollbarColor: "rgba(245,158,11,0.3) transparent",
        paddingRight: 2, // avoid clipping scrollbar
        paddingBottom: 8,
      }}
    >
      {/* ── Header ── */}
      <div style={{
        background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)",
        borderRadius: 10, padding: "0.7rem 1rem", flexShrink: 0,
      }}>
        <div style={{ fontFamily: "var(--font-bebas)", fontSize: "0.95rem", letterSpacing: "0.1em", color: "#F59E0B" }}>
          ✥ EDITOR DE PARQUEADERO
        </div>
        <div style={{ fontSize: "0.62rem", color: "rgba(245,158,11,0.6)", marginTop: 2 }}>
          Selecciona un vehículo · ajusta su posición · guarda
        </div>
      </div>

      {/* ── Step pills ── */}
      <div style={{
        display: "flex", gap: 4, flexShrink: 0,
      }}>
        {(["select", "place", "fine"] as const).map((step, i) => {
          const labels = ["① Seleccionar", "② Posicionar", "③ Ajustar"]
          const isNow  = activeStep === step
          const isDone =
            (activeStep === "place" && i === 0) ||
            (activeStep === "fine"  && i <= 1)
          return (
            <div key={step} style={{
              flex: 1, textAlign: "center",
              padding: "0.3rem 0.2rem",
              borderRadius: 6,
              background: isNow ? "rgba(245,158,11,0.18)" : isDone ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${isNow ? "rgba(245,158,11,0.5)" : isDone ? "rgba(34,197,94,0.3)" : "rgba(255,255,255,0.07)"}`,
              fontSize: "0.58rem", fontFamily: "var(--font-bebas)", letterSpacing: "0.06em",
              color: isNow ? "#F59E0B" : isDone ? "#22C55E" : "rgba(255,255,255,0.25)",
              transition: "all 0.25s",
            }}>
              {labels[i]}{isDone ? " ✓" : ""}
            </div>
          )
        })}
      </div>

      {/* ── Per-vehicle controls (shown when a placed vehicle is selected) ── */}
      <AnimatePresence mode="wait">
        {selected && activeStep === "fine" && (
          <VehicleControls
            key={selected.vehicle.id}
            vehicleId={selected.vehicle.id}
            name={selected.vehicle.name}
            accentColor={selected.vehicle.accentColor}
            placement={selected.placement}
            onMove={(dir)     => moveVehicle(selected.vehicle.id, dir)}
            onRotate={(delta) => rotateVehicle(selected.vehicle.id, delta)}
            onElevate={(d)    => adjustElevation(selected.vehicle.id, d)}
            onScale={(d)      => adjustScale(selected.vehicle.id, d)}
            onReplace={() => selectVehicle(selected.vehicle.id)}
            onDeselect={() => selectVehicle(null)}
          />
        )}
        {activeStep === "place" && selectedId && (
          <motion.div
            key="place-hint"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 8, padding: "0.75rem", textAlign: "center",
              fontSize: "0.7rem", color: "rgba(245,158,11,0.85)",
              fontFamily: "var(--font-bebas)", letterSpacing: "0.08em",
              flexShrink: 0,
            }}
          >
            📍 HAZ CLIC EN EL PISO DEL PANORAMA
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floor Y global ── */}
      <div style={{
        background: "rgba(2,2,10,0.88)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8, padding: "0.65rem 0.75rem",
        backdropFilter: "blur(10px)", flexShrink: 0,
      }}>
        <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "0.45rem" }}>
          Altura del piso (global)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <HoldButton label="▼" onAction={() => onFloorYChange(Math.round((floorY - 0.05) * 100) / 100)} size={30} />
          <div style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>
            {floorY.toFixed(2)} m
          </div>
          <HoldButton label="▲" onAction={() => onFloorYChange(Math.round((floorY + 0.05) * 100) / 100)} size={30} />
        </div>
      </div>

      {/* ── Vehicle list ── */}
      <div style={{
        background: "rgba(2,2,10,0.88)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 8, backdropFilter: "blur(10px)", flexShrink: 0,
        overflow: "hidden",
      }}>
        <div style={{ padding: "0.55rem 0.75rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: "0.58rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
            Flota · {placedVehicles.length} posicionados · {unplacedVehicles.length} sin colocar
          </div>
        </div>
        <div style={{ padding: "0.4rem" }}>

          {placedVehicles.length > 0 && (
            <>
              <SectionLabel color="#22C55E">Posicionados ✓</SectionLabel>
              {placedVehicles.map(({ vehicle: v, placement: p }) => (
                <VehicleRow
                  key={v.id}
                  name={v.name}
                  slot={v.slot}
                  accentColor={v.accentColor}
                  isSelected={selectedId === v.id}
                  sub={`${p.yaw.toFixed(0)}° · ${p.distance.toFixed(1)}m · ↻${p.rotation.toFixed(0)}°`}
                  onClick={() => selectVehicle(selectedId === v.id ? null : v.id)}
                  onRemove={() => removePlacement(v.id)}
                />
              ))}
            </>
          )}

          {unplacedVehicles.length > 0 && (
            <>
              <SectionLabel color="rgba(255,255,255,0.25)">Sin posicionar</SectionLabel>
              {unplacedVehicles.map((v) => (
                <VehicleRow
                  key={v.id}
                  name={v.name}
                  slot={v.slot}
                  accentColor={v.accentColor}
                  isSelected={selectedId === v.id}
                  sub={selectedId === v.id ? "← clic en el piso" : "—"}
                  onClick={() => selectVehicle(selectedId === v.id ? null : v.id)}
                  dimmed
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── Save ── */}
      <button
        onClick={() => save(panoramaUrl, floorY)}
        disabled={!isDirty || isSaving}
        style={{
          width: "100%", padding: "0.75rem",
          background: isDirty && !isSaving ? "#F59E0B" : "rgba(255,255,255,0.05)",
          color: isDirty && !isSaving ? "#000" : "rgba(255,255,255,0.25)",
          border: "none", borderRadius: 8,
          fontFamily: "var(--font-bebas)", fontSize: "0.95rem", letterSpacing: "0.08em",
          cursor: isDirty && !isSaving ? "pointer" : "not-allowed",
          boxShadow: isDirty ? "0 4px 20px rgba(245,158,11,0.3)" : "none",
          transition: "all 0.2s", flexShrink: 0,
        }}
      >
        {isSaving ? "GUARDANDO…" : isDirty ? "💾 GUARDAR POSICIONES" : "✓ GUARDADO"}
      </button>
    </div>
  )
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function SectionLabel({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.57rem", letterSpacing: "0.1em", textTransform: "uppercase", color, padding: "0.3rem 0.3rem 0.2rem" }}>
      {children}
    </div>
  )
}

function VehicleRow({
  name, slot, accentColor, isSelected, sub, onClick, onRemove, dimmed,
}: {
  name: string; slot: string; accentColor: string; isSelected: boolean
  sub: string; onClick: () => void; onRemove?: () => void; dimmed?: boolean
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "0.4rem",
        padding: "0.4rem 0.5rem", borderRadius: 6, marginBottom: 3,
        cursor: "pointer", transition: "all 0.15s",
        background: isSelected ? "rgba(245,158,11,0.12)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${isSelected ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.05)"}`,
        opacity: dimmed && !isSelected ? 0.55 : 1,
      }}
    >
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: accentColor, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "0.71rem", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {slot} · {name}
        </div>
        <div style={{ fontSize: "0.58rem", color: isSelected ? "rgba(245,158,11,0.7)" : "rgba(255,255,255,0.3)" }}>
          {sub}
        </div>
      </div>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "0.8rem", padding: "0.1rem 0.2rem", borderRadius: 3, flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >✕</button>
      )}
    </div>
  )
}