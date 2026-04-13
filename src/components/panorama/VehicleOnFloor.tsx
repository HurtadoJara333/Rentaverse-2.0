// src/components/panorama/VehicleOnFloor.tsx
"use client"
import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { useGLTF, Html, Float } from "@react-three/drei"
import * as THREE from "three"
import type { Vehicle } from "@/types/vehicle"

interface Props {
  vehicle:   Vehicle
  position:  [number, number, number]
  rotation:  number   // Y-axis rotation in degrees
  scale:     number   // Additional scale multiplier
  isHovered: boolean
  isSelected:boolean
  isEditorMode: boolean
  isDragging:   boolean
  onHover:   (v: Vehicle | null) => void
  onSelect:  (v: Vehicle) => void
  onDragStart?: () => void
}

const TARGET_LENGTH = 3.8  // car length in world units (meters)

export default function VehicleOnFloor({
  vehicle, position, rotation, scale,
  isHovered, isSelected,
  isEditorMode, isDragging,
  onHover, onSelect, onDragStart,
}: Props) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF(vehicle.modelPath)

  // Clone + normalize once
  const normalized = useMemo(() => {
    const cloned = scene.clone(true)
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow    = true
        child.receiveShadow = true
        const mats = Array.isArray(child.material) ? child.material : [child.material]
        mats.forEach((m) => {
          ;(m as THREE.MeshStandardMaterial).envMapIntensity = 1.6
          m.needsUpdate = true
        })
      }
    })
    // Auto-scale to TARGET_LENGTH
    const box    = new THREE.Box3().setFromObject(cloned)
    const size   = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    const baseScale = TARGET_LENGTH / Math.max(size.x, size.z)
    cloned.position.set(-center.x, -box.min.y, -center.z)

    const wrapper = new THREE.Group()
    wrapper.add(cloned)
    wrapper.scale.setScalar(baseScale * scale)
    return wrapper
  }, [scene, scale])

  // Subtle hover lift animation
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const targetY = isHovered || isSelected ? position[1] + 0.12 : position[1]
    groupRef.current.position.y = THREE.MathUtils.lerp(
      groupRef.current.position.y,
      targetY,
      delta * 5
    )
  })

  const accentColor = new THREE.Color(vehicle.accentColor)
  const rotRad = (rotation * Math.PI) / 180

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotRad, 0]}
      onClick={(e) => {
        e.stopPropagation()
        if (!isEditorMode) onSelect(vehicle)
      }}
      onPointerDown={(e) => {
        e.stopPropagation()
        if (isEditorMode && onDragStart) onDragStart()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(vehicle)
        document.body.style.cursor = isEditorMode ? "grab" : "pointer"
      }}
      onPointerOut={() => {
        onHover(null)
        document.body.style.cursor = "auto"
      }}
    >
      <primitive object={normalized} />

      {/* Glow ring on floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2.0, 2.5, 48]} />
        <meshBasicMaterial
          color={accentColor}
          transparent
          opacity={isHovered || isSelected ? (isEditorMode ? 0.9 : 0.65) : 0}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Slot label on floor */}
      <SlotLabel slot={vehicle.slot} available={vehicle.available} color={vehicle.accentColor} />

      {/* Hover tooltip — not in editor mode (use editor UI instead) */}
      {isHovered && !isEditorMode && (
        <Float speed={1.5} rotationIntensity={0} floatIntensity={0.2}>
          <Html position={[0, 2.8, 0]} center distanceFactor={10}>
            <div className="vehicle-on-floor__tooltip" style={{
              background: "rgba(2,2,10,0.92)",
              border: `1px solid ${vehicle.accentColor}55`,
              borderRadius: 8, padding: "0.4rem 0.9rem",
              whiteSpace: "nowrap", pointerEvents: "none",
              fontFamily: "var(--font-bebas)", fontSize: "0.95rem",
              letterSpacing: "0.08em", color: "var(--text)",
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 20px ${vehicle.accentColor}33`,
            }}>
              <span className="vehicle-on-floor__tooltip-slot" style={{ color: vehicle.accentColor }}>{vehicle.slot}</span>
              {" · "}
              <span className="vehicle-on-floor__tooltip-name">{vehicle.name}</span>
              {" · "}
              <span className="vehicle-on-floor__tooltip-price" style={{ color: "var(--gold)" }}>${vehicle.pricePerDay}/día</span>
            </div>
          </Html>
        </Float>
      )}

      {/* Editor mode — show drag handle + yaw indicator */}
      {isEditorMode && (
        <Html position={[0, 2.4, 0]} center distanceFactor={10}>
          <div className="vehicle-on-floor__editor-label" style={{
            background: "rgba(245,158,11,0.9)",
            borderRadius: 6, padding: "0.25rem 0.65rem",
            fontFamily: "var(--font-bebas)", fontSize: "0.8rem",
            letterSpacing: "0.08em", color: "#000",
            pointerEvents: "none", whiteSpace: "nowrap",
          }}>
            ✥ <span className="vehicle-on-floor__editor-label-slot">{vehicle.slot}</span>
          </div>
        </Html>
      )}
    </group>
  )
}

// Floor slot label
function SlotLabel({ slot, available, color }: { slot: string; available: boolean; color: string }) {
  const tex = useMemo(() => {
    const c = document.createElement("canvas")
    c.width = 256; c.height = 80
    const ctx = c.getContext("2d")!
    ctx.fillStyle = available ? color + "cc" : "#ef4444cc"
    ctx.roundRect?.(8, 8, 240, 64, 8) ?? ctx.fillRect(8, 8, 240, 64)
    ctx.fill()
    ctx.fillStyle = "#000"
    ctx.font = "bold 40px 'Bebas Neue', sans-serif"
    ctx.textAlign = "center"; ctx.textBaseline = "middle"
    ctx.fillText(slot, 128, 40)
    return new THREE.CanvasTexture(c)
  }, [slot, available, color])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <planeGeometry args={[2.2, 0.7]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}

// Preload hook
VehicleOnFloor.preload = (path: string) => useGLTF.preload(path)
