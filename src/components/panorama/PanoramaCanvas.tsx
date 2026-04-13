// src/components/panorama/PanoramaCanvas.tsx
"use client"
import { Suspense, useRef, useState, useCallback, useEffect } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import {
  OrbitControls, Environment, Preload,
  PerspectiveCamera, useProgress, Html,
} from "@react-three/drei"
import {
  EffectComposer, Bloom, ToneMapping, Vignette,
} from "@react-three/postprocessing"
import { ToneMappingMode, BlendFunction } from "postprocessing"
import * as THREE from "three"

import PanoramaSphere from "./PanoramaSphere"
import VehicleOnFloor from "./VehicleOnFloor"
import PanoramaEditor from "./PanoramaEditor"
import { usePanoramaEditor } from "./usePanoramaEditor"
import { placementToPosition, type PanoramaShowroom } from "@/lib/panoramaData"
import { APEX_VEHICLES } from "@/lib/data"
import { useShowroomStore } from "@/stores/showroomStore"
import { useReservationStore } from "@/stores/reservationStore"

// ── Canvas loading indicator ──────────────────────────────────────────────────
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="panorama-canvas__loader" style={{ textAlign: "center", color: "#e8e8f0", userSelect: "none", minWidth: 220 }}>
        <div className="panorama-canvas__loader-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem", color: "#F59E0B", letterSpacing: "0.15em" }}>
          APEX RENTALS
        </div>
        <div className="panorama-canvas__loader-progress-bar" style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.1)", borderRadius: 1, margin: "1rem 0", overflow: "hidden" }}>
          <div className="panorama-canvas__loader-progress-fill" style={{ height: "100%", width: `${progress}%`, background: "#F59E0B", transition: "width 0.1s" }} />
        </div>
        <div className="panorama-canvas__loader-status" style={{ fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280" }}>
          {progress < 40 ? "Cargando panorama…" : progress < 75 ? "Posicionando vehículos…" : "¡Listo!"}
        </div>
      </div>
    </Html>
  )
}

// ── Invisible floor plane for click-to-place ──────────────────────────────────
function FloorClickPlane({
  floorY, isActive, onFloorClick,
}: {
  floorY: number
  isActive: boolean
  onFloorClick: (point: THREE.Vector3) => void
}) {
  if (!isActive) return null
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, floorY, 0]}
      onClick={(e) => { e.stopPropagation(); onFloorClick(e.point) }}
    >
      <planeGeometry args={[200, 200]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

// ── Scroll-to-rotate handler (sits inside Canvas) ─────────────────────────────
function ScrollRotateHandler({
  isEditorMode, hoveredId, onRotate,
}: {
  isEditorMode: boolean
  hoveredId: string | null
  onRotate: (id: string, delta: number) => void
}) {
  const { gl } = useThree()
  useEffect(() => {
    if (!isEditorMode || !hoveredId) return
    const el = gl.domElement
    const handler = (e: WheelEvent) => {
      if (!hoveredId) return
      e.preventDefault()
      onRotate(hoveredId, e.deltaY > 0 ? 15 : -15)
    }
    el.addEventListener("wheel", handler, { passive: false })
    return () => el.removeEventListener("wheel", handler)
  }, [isEditorMode, hoveredId, gl, onRotate])
  return null
}

// ── Main exported component ───────────────────────────────────────────────────
interface Props {
  showroom:    PanoramaShowroom
  editorMode?: boolean
}

export default function PanoramaCanvas({ showroom, editorMode = false }: Props) {
  const orbitRef          = useRef<any>(null)
  const [hoveredVehicle, setHoveredVehicle] = useState<string | null>(null)
  const [floorY, setFloorY] = useState(showroom.floorY)

  const selectVehicle = useShowroomStore((s) => s.selectVehicle)
  const openModal     = useReservationStore((s) => s.openModal)

  // Editor state
  const editor = usePanoramaEditor(showroom.placements)

  const handleFloorClick = useCallback((point: THREE.Vector3) => {
    editor.handleFloorClick(point, floorY)
  }, [editor, floorY])

  // Restore orbit on editor toggle
  useEffect(() => {
    if (orbitRef.current) {
      orbitRef.current.enableZoom = !editor.isActive
    }
  }, [editor.isActive])

  return (
    <div className="panorama-canvas" style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* ── 3D Canvas ── */}
      <Canvas
        className="panorama-canvas__canvas"
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.0,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <PerspectiveCamera makeDefault fov={75} near={0.1} far={1000} position={[0, 0, 0.01]} />

        {/* Scroll-to-rotate handler */}
        <ScrollRotateHandler
          isEditorMode={editor.isActive}
          hoveredId={hoveredVehicle}
          onRotate={editor.rotateVehicle}
        />

        <Suspense fallback={<Loader />}>
          {/* ── 360° panorama sphere ── */}
          <PanoramaSphere url={showroom.panoramaUrl} radius={500} />

          {/* ── Invisible floor for click-to-place ── */}
          <FloorClickPlane
            floorY={floorY}
            isActive={editor.isActive && editor.selectedId !== null}
            onFloorClick={handleFloorClick}
          />

          {/* ── Placed vehicles ── */}
          {editor.placedVehicles.map(({ vehicle: v, placement: p }) => {
            const position = placementToPosition(p.yaw, p.distance, p.elevation, floorY)
            return (
              <VehicleOnFloor
                key={v.id}
                vehicle={v}
                position={position}
                rotation={p.rotation}
                scale={p.scale ?? 1}
                isHovered={hoveredVehicle === v.id}
                isSelected={false}
                isEditorMode={editor.isActive}
                isDragging={false}
                onHover={(vh) => setHoveredVehicle(vh?.id ?? null)}
                onSelect={(vh) => {
                  if (vh.available) {
                    selectVehicle(vh)
                  }
                }}
              />
            )
          })}

          {/* Optional: slight ambient for vehicles */}
          <ambientLight intensity={0.4} color={0x888899} />
          <directionalLight position={[5, 10, 5]} intensity={0.6} color={0xfff5e0} />

          <Preload all />
        </Suspense>

        {/* ── Orbit controls — panorama style (no zoom, full 360°) ── */}
        <OrbitControls
          ref={orbitRef}
          enableZoom={!editor.isActive}
          enablePan={false}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={-0.4}      // negative = natural drag direction
          minDistance={0.1}
          maxDistance={10}
          target={[0, 0, 0]}
          makeDefault
        />

        {/* Post-processing */}
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.2} luminanceThreshold={0.85} radius={0.5} mipmapBlur />
          <Vignette darkness={0.35} offset={0.4} blendFunction={BlendFunction.NORMAL} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      </Canvas>

      {/* ── Editor overlay UI (outside canvas) ── */}
      {(editorMode || editor.isActive) && (
        <PanoramaEditor
          {...editor}
          panoramaUrl={showroom.panoramaUrl}
          floorY={floorY}
          onFloorYChange={setFloorY}
        />
      )}

      {/* ── Editor toggle button ── */}
      {editorMode && (
        <button
          onClick={editor.toggleEditor}
          className={`panorama-canvas__editor-toggle ${editor.isActive ? 'panorama-canvas__editor-toggle--active' : 'panorama-canvas__editor-toggle--inactive'}`}
          style={{
            position: "absolute", top: "4.5rem", right: "1rem", zIndex: 40,
            background: editor.isActive ? "rgba(245,158,11,0.9)" : "rgba(2,2,10,0.85)",
            color: editor.isActive ? "#000" : "var(--gold)",
            border: `1px solid ${editor.isActive ? "transparent" : "rgba(245,158,11,0.4)"}`,
            borderRadius: 8, padding: "0.55rem 1rem",
            fontFamily: "var(--font-bebas)", fontSize: "0.9rem", letterSpacing: "0.1em",
            cursor: "pointer", backdropFilter: "blur(10px)",
            transition: "all 0.2s",
            boxShadow: editor.isActive ? "0 4px 16px rgba(245,158,11,0.4)" : "none",
          }}
        >
          {editor.isActive ? "✕ SALIR DEL EDITOR" : "✥ MODO EDITOR"}
        </button>
      )}

      {/* ── Crosshair hint when placing ── */}
      {editor.isActive && editor.selectedId && (
        <div className="panorama-canvas__placement-hint" style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          pointerEvents: "none", zIndex: 35,
          textAlign: "center",
        }}>
          <div className="panorama-canvas__placement-crosshair" style={{
            width: 24, height: 24, margin: "0 auto 0.5rem",
            border: "2px solid rgba(245,158,11,0.8)",
            borderRadius: "50%",
            boxShadow: "0 0 0 1px rgba(245,158,11,0.3)",
          }} />
          <div className="panorama-canvas__placement-text" style={{
            background: "rgba(245,158,11,0.9)", color: "#000",
            fontSize: "0.72rem", fontFamily: "var(--font-bebas)",
            letterSpacing: "0.1em", padding: "0.25rem 0.75rem", borderRadius: 100,
          }}>
            CLIC EN EL PISO PARA POSICIONAR
          </div>
        </div>
      )}

      {/* ── Panorama controls hint ── */}
      {!editor.isActive && (
        <div className="panorama-canvas__controls-hint" style={{
          position: "absolute", bottom: "4.5rem", left: "50%",
          transform: "translateX(-50%)", zIndex: 30,
          display: "flex", alignItems: "center", gap: "0.75rem",
          background: "rgba(2,2,10,0.75)", border: "1px solid var(--border)",
          borderRadius: 100, padding: "0.45rem 1.1rem",
          fontSize: "0.72rem", color: "var(--muted)",
          backdropFilter: "blur(10px)", whiteSpace: "nowrap", pointerEvents: "none",
        }}>
          <span className="panorama-canvas__controls-drag">🖱 Arrastra para mirar</span>
          <span className="panorama-canvas__controls-separator" style={{ color: "var(--border)" }}>·</span>
          <span className="panorama-canvas__controls-zoom">Scroll para zoom</span>
          <span className="panorama-canvas__controls-separator" style={{ color: "var(--border)" }}>·</span>
          <span className="panorama-canvas__controls-click">Click en vehículo para detalles</span>
        </div>
      )}
    </div>
  )
}
