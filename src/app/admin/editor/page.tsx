// src/app/admin/editor/page.tsx
"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { DEFAULT_SHOWROOM, type PanoramaShowroom } from "@/lib/panoramaData"

const PanoramaCanvas = dynamic(
  () => import("@/components/panorama/PanoramaCanvas"),
  {
    ssr: false,
    loading: () => (
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#02020a" }}>
        <div style={{ color: "#6B7280", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
          Cargando editor 3D…
        </div>
      </div>
    ),
  }
)

export default function EditorPage() {
  const [showroom, setShowroom] = useState<PanoramaShowroom>(DEFAULT_SHOWROOM)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/showroom/placements")
      .then((r) => r.json())
      .then((data) => {
        setShowroom({
          id:          data.showroomId,
          name:        DEFAULT_SHOWROOM.name,
          panoramaUrl: data.panoramaUrl,
          floorY:      data.floorY,
          placements:  data.placements,
        })
        setLoading(false)
      })
      .catch(() => { setShowroom(DEFAULT_SHOWROOM); setLoading(false) })
  }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 4rem)", gap: "1rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "#E8E8F0", lineHeight: 1 }}>
            Editor de Showroom
          </h1>
          <p style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "0.3rem" }}>
            Posiciona los vehículos sobre el panorama 360° · Haz clic en <strong style={{ color: "#F59E0B" }}>Modo Editor</strong> para empezar
          </p>
        </div>
        <div style={{
          background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: 8, padding: "0.55rem 1rem", fontSize: "0.75rem", color: "#F59E0B",
        }}>
          📸 Panorama: <code style={{ fontFamily: "monospace" }}>{showroom.panoramaUrl}</code>
        </div>
      </div>

      {/* Info */}
      <div style={{
        background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)",
        borderRadius: 8, padding: "0.85rem 1rem", fontSize: "0.82rem", color: "#93c5fd", lineHeight: 1.7,
      }}>
        <strong>Instrucciones:</strong> Activa el Modo Editor → selecciona un vehículo en el panel izquierdo → haz clic en el piso del panorama para posicionarlo → usa el scroll del mouse sobre un carro para rotarlo → ajusta la altura del piso si los carros flotan → guarda los cambios.
        <br />
        <strong>Panorama:</strong> Sube tu foto 360° equirectangular (JPG/PNG) como <code style={{ fontFamily: "monospace", fontSize: "0.78rem" }}>/public/panoramas/showroom.jpg</code> y reinicia el servidor.
      </div>

      {/* Canvas editor */}
      <div style={{
        flex: 1, borderRadius: 10, overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        position: "relative",
      }}>
        {!loading && (
          <PanoramaCanvas showroom={showroom} editorMode={true} />
        )}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", background: "#02020a" }}>
            <div style={{ color: "#6B7280", fontSize: "0.8rem" }}>Cargando configuración…</div>
          </div>
        )}
      </div>
    </div>
  )
}
