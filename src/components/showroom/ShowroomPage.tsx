// src/components/showroom/ShowroomPage.tsx
"use client"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Toaster } from "react-hot-toast"
import { useShowroomStore } from "@/stores/showroomStore"
import { useReservationStore } from "@/stores/reservationStore"
import { fetchFleetStatus } from "@/lib/data"
import { DEFAULT_SHOWROOM, type PanoramaShowroom } from "@/lib/panoramaData"
import ShowroomHUD from "./ShowroomHUD"
import FleetStrip from "./FleetStrip"
import ReservationModal from "@/components/reservation/ReservationModal"

// PanoramaCanvas — client-only (uses Three.js)
const PanoramaCanvas = dynamic(
  () => import("@/components/panorama/PanoramaCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="showroom-page__loading" style={{ position: "fixed", inset: 0, background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="showroom-page__loading-content" style={{ textAlign: "center" }}>
          <div className="showroom-page__loading-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "2.5rem", color: "var(--gold)", letterSpacing: "0.15em" }}>
            APEX RENTALS
          </div>
          <div className="showroom-page__loading-subtitle" style={{ color: "var(--muted)", fontSize: "0.75rem", letterSpacing: "0.14em", textTransform: "uppercase", marginTop: "1rem" }}>
            Cargando showroom…
          </div>
        </div>
      </div>
    ),
  }
)

// VehicleViewer for the detail/reservation flow
const VehicleViewer = dynamic(() => import("./VehicleViewer"), { ssr: false })

export default function ShowroomPage() {
  const { selectedVehicle, setView, setFleetStatus } = useShowroomStore((s) => ({
    selectedVehicle: s.selectedVehicle,
    setView:         s.setView,
    setFleetStatus:  s.setFleetStatus,
  }))

  const [showroom, setShowroom] = useState<PanoramaShowroom>(DEFAULT_SHOWROOM)
  const [loadingShowroom, setLoadingShowroom] = useState(true)

  // Load panorama config + placements from API
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
        setLoadingShowroom(false)
      })
      .catch(() => {
        // Fallback to defaults
        setShowroom(DEFAULT_SHOWROOM)
        setLoadingShowroom(false)
      })
  }, [])

  // Fleet availability
  useEffect(() => {
    fetchFleetStatus().then(setFleetStatus)
    const interval = setInterval(() => fetchFleetStatus().then(setFleetStatus), 30_000)
    return () => clearInterval(interval)
  }, [setFleetStatus])

  return (
    <div className="showroom-page" style={{ position: "fixed", inset: 0, background: "var(--bg)" }}>
      {/* Panorama canvas — always mounted */}
      {!loadingShowroom && (
        <PanoramaCanvas showroom={showroom} editorMode={false} />
      )}

      {/* HUD overlay */}
      <ShowroomHUD onBack={() => setView("landing")} />

      {/* Fleet strip — hide when viewer open */}
      {!selectedVehicle && <FleetStrip />}

      {/* Vehicle detail viewer */}
      <VehicleViewer />

      {/* Reservation modal */}
      <ReservationModal />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: "rgba(10,10,20,0.95)", color: "#E8E8F0",
            border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px",
            fontSize: "0.85rem", backdropFilter: "blur(12px)",
          },
          success: { iconTheme: { primary: "#F59E0B", secondary: "#000" } },
        }}
      />
    </div>
  )
}
