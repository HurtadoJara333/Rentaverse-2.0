// src/components/panorama/PanoramaEditor.tsx
"use client"
import { motion, AnimatePresence } from "framer-motion"
import type { usePanoramaEditor } from "./usePanoramaEditor"

type EditorProps = ReturnType<typeof usePanoramaEditor> & {
  panoramaUrl: string
  floorY:      number
  onFloorYChange: (v: number) => void
}

export default function PanoramaEditor({
  isActive, placedVehicles, unplacedVehicles,
  selectedId, isDirty, isSaving,
  selectVehicle, removePlacement, save,
  panoramaUrl, floorY, onFloorYChange,
}: EditorProps) {

  if (!isActive) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.25 }}
        className="panorama-editor"
        style={{
          position: "absolute", left: "1rem", top: "4.5rem", bottom: "1rem",
          width: 260, zIndex: 40,
          display: "flex", flexDirection: "column", gap: "0.75rem",
          pointerEvents: "all",
        }}
      >
        {/* Header */}
        <div className="panorama-editor__header" style={{
          background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)",
          borderRadius: 10, padding: "0.85rem 1rem",
        }}>
          <div className="panorama-editor__header-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.1em", color: "#F59E0B" }}>
            ✥ MODO EDITOR
          </div>
          <div className="panorama-editor__header-subtitle" style={{ fontSize: "0.72rem", color: "rgba(245,158,11,0.7)", marginTop: 2 }}>
            Clic en el piso del panorama para posicionar
          </div>
        </div>

        {/* Instructions */}
        <div className="panorama-editor__instructions" style={{
          background: "rgba(2,2,10,0.88)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "0.75rem", fontSize: "0.72rem",
          color: "var(--muted)", lineHeight: 1.7, backdropFilter: "blur(10px)",
        }}>
          <div className="panorama-editor__instruction">① Selecciona un vehículo abajo</div>
          <div className="panorama-editor__instruction">② Haz clic en el piso del panorama</div>
          <div className="panorama-editor__instruction">③ Scroll sobre el carro para rotarlo</div>
          <div className="panorama-editor__instruction">④ Guarda cuando estés listo</div>
        </div>

        {/* Floor Y adjustment */}
        <div className="panorama-editor__floor-control" style={{
          background: "rgba(2,2,10,0.88)", border: "1px solid var(--border)",
          borderRadius: 8, padding: "0.8rem", backdropFilter: "blur(10px)",
        }}>
          <div className="panorama-editor__floor-label" style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.5rem" }}>
            Altura del piso
          </div>
          <div className="panorama-editor__floor-adjuster" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => onFloorYChange(Math.round((floorY - 0.1) * 10) / 10)}
              className="panorama-editor__floor-button panorama-editor__floor-button--down"
              style={btnStyle}
            >▼</button>
            <span className="panorama-editor__floor-value" style={{ flex: 1, textAlign: "center", fontFamily: "monospace", fontSize: "0.85rem", color: "var(--text)" }}>
              {floorY.toFixed(1)} m
            </span>
            <button
              onClick={() => onFloorYChange(Math.round((floorY + 0.1) * 10) / 10)}
              className="panorama-editor__floor-button panorama-editor__floor-button--up"
              style={btnStyle}
            >▲</button>
          </div>
        </div>

        {/* Vehicle list */}
        <div className="panorama-editor__vehicle-list" style={{
          background: "rgba(2,2,10,0.88)", border: "1px solid var(--border)",
          borderRadius: 8, flex: 1, overflow: "hidden",
          display: "flex", flexDirection: "column", backdropFilter: "blur(10px)",
        }}>
          <div className="panorama-editor__vehicle-list-header" style={{ padding: "0.75rem", borderBottom: "1px solid var(--border)" }}>
            <div className="panorama-editor__vehicle-list-title" style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
              Vehículos
            </div>
          </div>
          <div className="panorama-editor__vehicle-list-content" style={{ overflowY: "auto", flex: 1, padding: "0.5rem" }}>

            {/* Placed vehicles */}
            {placedVehicles.length > 0 && (
              <>
                <div className="panorama-editor__section-label panorama-editor__section-label--placed" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#22C55E", padding: "0.3rem 0.4rem", marginBottom: "0.25rem" }}>
                  Posicionados ✓
                </div>
                {placedVehicles.map(({ vehicle: v, placement: p }) => (
                  <div
                    key={v.id}
                    onClick={() => selectVehicle(selectedId === v.id ? null : v.id)}
                    className={`panorama-editor__vehicle-item panorama-editor__vehicle-item--placed ${selectedId === v.id ? 'panorama-editor__vehicle-item--selected' : ''}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.5rem 0.6rem", borderRadius: 6, marginBottom: "0.3rem",
                      cursor: "pointer", transition: "all 0.15s",
                      background: selectedId === v.id
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(255,255,255,0.03)",
                      border: `1px solid ${selectedId === v.id ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <div className="panorama-editor__vehicle-color" style={{ width: 7, height: 7, borderRadius: "50%", background: v.accentColor, flexShrink: 0 }} />
                    <div className="panorama-editor__vehicle-info">
                      <div className="panorama-editor__vehicle-name" style={{ fontSize: "0.75rem", fontWeight: 500, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {v.name}
                      </div>
                      <div className="panorama-editor__vehicle-position" style={{ fontSize: "0.62rem", color: "var(--muted)" }}>
                        {p.yaw.toFixed(0)}° · {p.distance.toFixed(1)}m
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removePlacement(v.id) }}
                      className="panorama-editor__vehicle-remove"
                      style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "0.8rem", padding: "0.1rem 0.3rem", borderRadius: 3, transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </>
            )}

            {/* Unplaced vehicles */}
            {unplacedVehicles.length > 0 && (
              <>
                <div className="panorama-editor__section-label panorama-editor__section-label--unplaced" style={{ fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", padding: "0.5rem 0.4rem 0.25rem", marginTop: "0.25rem" }}>
                  Sin posicionar
                </div>
                {unplacedVehicles.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => selectVehicle(selectedId === v.id ? null : v.id)}
                    className={`panorama-editor__vehicle-item panorama-editor__vehicle-item--unplaced ${selectedId === v.id ? 'panorama-editor__vehicle-item--selected' : ''}`}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      padding: "0.5rem 0.6rem", borderRadius: 6, marginBottom: "0.3rem",
                      cursor: "pointer", transition: "all 0.15s",
                      background: selectedId === v.id
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(255,255,255,0.02)",
                      border: `1px solid ${selectedId === v.id ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.04)"}`,
                      opacity: 0.7,
                    }}
                  >
                    <div className="panorama-editor__vehicle-color panorama-editor__vehicle-color--unplaced" style={{ width: 7, height: 7, borderRadius: "50%", background: v.accentColor, flexShrink: 0, opacity: 0.5 }} />
                    <div className="panorama-editor__vehicle-name panorama-editor__vehicle-name--unplaced" style={{ fontSize: "0.75rem", color: "var(--muted2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {v.name}
                    </div>
                    {selectedId === v.id && (
                      <div className="panorama-editor__vehicle-hint" style={{ fontSize: "0.6rem", color: "#F59E0B", marginLeft: "auto", whiteSpace: "nowrap" }}>
                        ← clic en piso
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={() => save(panoramaUrl, floorY)}
          disabled={!isDirty || isSaving}
          className={`panorama-editor__save-button ${isDirty && !isSaving ? 'panorama-editor__save-button--enabled' : 'panorama-editor__save-button--disabled'}`}
          style={{
            width: "100%", padding: "0.85rem",
            background: isDirty && !isSaving ? "#F59E0B" : "rgba(255,255,255,0.05)",
            color: isDirty && !isSaving ? "#000" : "var(--muted)",
            border: "none", borderRadius: 8,
            fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.08em",
            cursor: isDirty && !isSaving ? "pointer" : "not-allowed",
            boxShadow: isDirty ? "0 4px 20px rgba(245,158,11,0.3)" : "none",
            transition: "all 0.2s",
          }}
        >
          {isSaving ? "GUARDANDO…" : isDirty ? "💾 GUARDAR POSICIONES" : "✓ GUARDADO"}
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

const btnStyle: React.CSSProperties = {
  width: 28, height: 28, border: "1px solid var(--border)",
  background: "rgba(255,255,255,0.05)", color: "var(--text)",
  borderRadius: 5, cursor: "pointer", fontSize: "0.8rem",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background 0.15s",
}
