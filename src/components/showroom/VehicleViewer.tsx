// src/components/showroom/VehicleViewer.tsx
// Full-screen 3D vehicle viewer — opens when clicking a vehicle in the showroom
"use client";
import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode, BlendFunction } from "postprocessing";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { useShowroomStore } from "@/stores/showroomStore";
import { useReservationStore } from "@/stores/reservationStore";
import type { Vehicle } from "@/types/vehicle";

// ── Rotating vehicle model ────────────────────────────────────────────────────
function ViewerModel({ vehicle, paused }: { vehicle: Vehicle; paused: boolean }) {
  const groupRef  = useRef<THREE.Group>(null);
  const { scene } = useGLTF(vehicle.modelPath);

  // Clone + enhance materials
  const cloned = useRef<THREE.Group | null>(null);
  if (!cloned.current) {
    cloned.current = scene.clone(true);
    cloned.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
        const mats = Array.isArray(child.material)
          ? child.material
          : [child.material];
        mats.forEach((m) => {
          (m as THREE.MeshStandardMaterial).envMapIntensity = 2.2;
          m.needsUpdate = true;
        });
      }
    });

    // Auto-normalize scale to 4.4m length
    const box = new THREE.Box3().setFromObject(cloned.current);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);
    const scale = 4.4 / Math.max(size.x, size.z);
    cloned.current.position.set(-center.x, -box.min.y, -center.z);

    const wrapper = new THREE.Group();
    wrapper.add(cloned.current);
    wrapper.scale.setScalar(scale);
    cloned.current = wrapper;
  }

  // Auto-rotate slowly — stops when user is dragging
  useFrame((_, delta) => {
    if (!groupRef.current || paused) return;
    groupRef.current.rotation.y += delta * 0.22;
  });

  return (
    <group ref={groupRef}>
      <primitive object={cloned.current} />
    </group>
  );
}

// ── Loading spinner inside canvas ─────────────────────────────────────────────
function CanvasLoader() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) meshRef.current.rotation.z -= delta * 2;
  });
  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <torusGeometry args={[0.4, 0.06, 8, 32, Math.PI * 1.5]} />
      <meshBasicMaterial color={0xF59E0B} />
    </mesh>
  );
}

// ── Color swatch ──────────────────────────────────────────────────────────────
const PAINT_OPTIONS = [
  { label: "Obsidian",  hex: "#080808" },
  { label: "Glacier",   hex: "#e8eef4" },
  { label: "Crimson",   hex: "#8b1a1a" },
  { label: "Midnight",  hex: "#0a1628" },
  { label: "Forest",    hex: "#1a2e1a" },
  { label: "Sand",      hex: "#c8b49a" },
];

// ── Main viewer ───────────────────────────────────────────────────────────────
export default function VehicleViewer() {
  const vehicle      = useShowroomStore((s) => s.selectedVehicle);
  const selectVehicle = useShowroomStore((s) => s.selectVehicle);
  const openModal    = useReservationStore((s) => s.openModal);

  const [isDragging, setIsDragging] = useState(false);
  const [activePaint, setActivePaint] = useState(0);
  const [tab, setTab] = useState<"specs" | "features">("specs");

  // Reset tab when vehicle changes
  useEffect(() => { setTab("specs"); setActivePaint(0); }, [vehicle?.id]);

  if (!vehicle) return null;

  const specs = [
    { label: "Motor",       val: vehicle.features[0] ?? "—" },
    { label: "Tracción",    val: vehicle.features[1] ?? "—" },
    { label: "Capacidad",   val: vehicle.features[2] ?? "—" },
    { label: "Extra",       val: vehicle.features[3] ?? "—" },
    { label: "Precio/día",  val: `$${vehicle.pricePerDay}` },
    { label: "Slot",        val: vehicle.slot },
  ];

  return (
    <AnimatePresence>
      <motion.div
        key={vehicle.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="vehicle-viewer"
        style={{
          position: "fixed", inset: 0, zIndex: 50,
          background: "#02020a",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Top bar ── */}
        <div className="vehicle-viewer__top-bar" style={{
          position: "absolute", top: 0, left: 0, right: 0, zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", height: 54,
          background: "linear-gradient(to bottom, rgba(2,2,10,0.98), transparent)",
          pointerEvents: "none",
        }}>
          <div className="vehicle-viewer__breadcrumb">
            <span className="vehicle-viewer__brand" style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem", letterSpacing: "0.15em", color: "var(--gold)" }}>
              APEX RENTALS
            </span>
            <span className="vehicle-viewer__separator" style={{ color: "rgba(255,255,255,0.2)", margin: "0 0.5rem" }}>›</span>
            <span className="vehicle-viewer__section" style={{ fontFamily: "var(--font-bebas)", fontSize: "0.85rem", letterSpacing: "0.1em", color: "var(--muted2)" }}>
              Visor 3D
            </span>
          </div>
          <button
            onClick={() => selectVehicle(null)}
            className="vehicle-viewer__close-button"
            style={{
              pointerEvents: "all",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--muted2)", borderRadius: 6,
              width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: "1rem", transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "var(--muted2)"; }}
          >
            ✕
          </button>
        </div>

        {/* ── Layout: canvas left, panel right on desktop ── */}
        <div className="vehicle-viewer__layout" style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
        }}>

          {/* ── 3D Canvas ── */}
          <div
            className="vehicle-viewer__canvas-container"
            style={{ flex: 1, position: "relative" }}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            onPointerLeave={() => setIsDragging(false)}
          >
            <Canvas
              shadows
              dpr={[1, 2]}
              gl={{
                antialias: true,
                stencilBuffer: false,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1,
                outputColorSpace: THREE.SRGBColorSpace,
              }}
              style={{ width: "100%", height: "100%", cursor: isDragging ? "grabbing" : "grab" }}
            >
              <PerspectiveCamera makeDefault fov={40} position={[0, 1.8, 7]} />

              {/* Lighting rig */}
              <ambientLight intensity={0.3} color={0x0a0a1e} />
              <directionalLight
                position={[-6, 12, 8]} intensity={3.0} color={0xfff2d0}
                castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0003}
              />
              <directionalLight position={[10, 6, -4]} intensity={0.8} color={0x8ab4f8} />
              <directionalLight position={[0, 2, -12]} intensity={0.9} color={0x9b59b6} />
              <pointLight position={[-14, 2, 0]} intensity={1.2} distance={22} color={0xF59E0B} />
              <pointLight position={[0, -0.3, 0]} intensity={1.5} distance={18} color={0x2a1a08} />

              {/* Environment for reflections */}
              <Environment
                files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/empty_warehouse_01_1k.hdr"
                background={false}
                environmentIntensity={0.8}
              />

              <Suspense fallback={<CanvasLoader />}>
                <ViewerModel vehicle={vehicle} paused={isDragging} />

                <ContactShadows
                  position={[0, 0, 0]}
                  opacity={0.8}
                  scale={14}
                  blur={3}
                  far={4}
                  resolution={512}
                  color="#000000"
                />
              </Suspense>

              {/* Orbital controls — horizontal only, slight vertical */}
              <OrbitControls
                enableDamping
                dampingFactor={0.07}
                enablePan={false}
                minDistance={3.5}
                maxDistance={12}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.1}
                target={[0, 0.8, 0]}
                makeDefault
              />

              <EffectComposer multisampling={0}>
                <Bloom intensity={0.4} luminanceThreshold={0.75} radius={0.6} mipmapBlur />
                <Vignette darkness={0.5} offset={0.35} blendFunction={BlendFunction.NORMAL} />
                <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
              </EffectComposer>
            </Canvas>

            {/* Rotation hint */}
            <div className="vehicle-viewer__rotation-hint" style={{
              position: "absolute", bottom: "1.5rem", left: "50%",
              transform: "translateX(-50%)",
              display: "flex", alignItems: "center", gap: "0.5rem",
              background: "rgba(2,2,10,0.75)", border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 100, padding: "0.4rem 1rem",
              fontSize: "0.72rem", color: "var(--muted)",
              backdropFilter: "blur(8px)", pointerEvents: "none",
              whiteSpace: "nowrap",
            }}>
              <span className="vehicle-viewer__rotation-icon">🖱</span> Arrastra para rotar · Scroll para zoom
            </div>

            {/* Paint selector */}
            <div className="vehicle-viewer__paint-selector" style={{
              position: "absolute", top: "4.5rem", left: "1.2rem",
              display: "flex", flexDirection: "column", gap: "0.5rem",
              alignItems: "flex-start",
            }}>
              <div className="vehicle-viewer__paint-label" style={{ fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)" }}>
                Color
              </div>
              {PAINT_OPTIONS.map((p, i) => (
                <button
                  key={p.hex}
                  title={p.label}
                  onClick={() => setActivePaint(i)}
                  className={`vehicle-viewer__paint-option ${activePaint === i ? 'vehicle-viewer__paint-option--active' : ''}`}
                  style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: p.hex,
                    border: activePaint === i
                      ? "2px solid var(--gold)"
                      : "2px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    boxShadow: activePaint === i ? "0 0 10px rgba(245,158,11,0.6)" : "none",
                    transition: "all 0.15s",
                  }}
                />
              ))}
            </div>
          </div>

          {/* ── Info panel ── */}
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="vehicle-viewer__info-panel"
            style={{
              width: 300,
              background: "rgba(4,4,14,0.97)",
              borderLeft: "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              flexDirection: "column",
              padding: "5rem 1.4rem 1.4rem",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            {/* Vehicle name */}
            <div className="vehicle-viewer__vehicle-header" style={{ marginBottom: "1.2rem" }}>
              <div className="vehicle-viewer__vehicle-category" style={{ fontSize: "0.62rem", letterSpacing: "0.15em", textTransform: "uppercase", color: vehicle.accentColor, marginBottom: "0.25rem" }}>
                {vehicle.category}
              </div>
              <div className="vehicle-viewer__vehicle-name" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.9rem", lineHeight: 1, letterSpacing: "0.02em" }}>
                {vehicle.name}
              </div>
              <div className="vehicle-viewer__vehicle-meta" style={{ color: "var(--muted)", fontSize: "0.8rem", marginTop: "0.3rem" }}>
                {vehicle.brand} · {vehicle.year}
              </div>
            </div>

            {/* Price */}
            <div className="vehicle-viewer__price-section" style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.9rem 1rem",
              background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.15)",
              borderRadius: 8, marginBottom: "1.2rem",
            }}>
              <div className="vehicle-viewer__price-info">
                <div className="vehicle-viewer__price-amount" style={{ fontFamily: "var(--font-bebas)", fontSize: "2rem", color: "var(--gold)", lineHeight: 1 }}>
                  ${vehicle.pricePerDay}
                </div>
                <div className="vehicle-viewer__price-unit" style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 2 }}>por día</div>
              </div>
              <span className={`vehicle-viewer__availability ${vehicle.available ? 'vehicle-viewer__availability--available' : 'vehicle-viewer__availability--unavailable'}`} style={{
                display: "inline-flex", alignItems: "center", gap: "0.3rem",
                fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
                padding: "0.22rem 0.65rem", borderRadius: "100px",
                background: vehicle.available ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                color: vehicle.available ? "#22C55E" : "#EF4444",
                border: `1px solid ${vehicle.available ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
              }}>
                <span className="vehicle-viewer__availability-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                {vehicle.available ? "Disponible" : "Ocupado"}
              </span>
            </div>

            {/* Tabs */}
            <div className="vehicle-viewer__tabs" style={{ display: "flex", gap: "0.35rem", marginBottom: "1rem" }}>
              {(["specs", "features"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`vehicle-viewer__tab ${tab === t ? 'vehicle-viewer__tab--active' : ''}`}
                  style={{
                    flex: 1, padding: "0.5rem",
                    background: tab === t ? "rgba(255,255,255,0.08)" : "transparent",
                    border: `1px solid ${tab === t ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.06)"}`,
                    borderRadius: 6, cursor: "pointer",
                    fontFamily: "var(--font-dm-sans)", fontSize: "0.75rem",
                    color: tab === t ? "var(--text)" : "var(--muted)",
                    transition: "all 0.15s", letterSpacing: "0.04em",
                  }}
                >
                  {t === "specs" ? "Especificaciones" : "Equipamiento"}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "specs" && (
              <div className="vehicle-viewer__specs" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                {specs.map(({ label, val }) => (
                  <div key={label} className="vehicle-viewer__spec-item" style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "0.6rem 0.75rem",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 6, fontSize: "0.82rem",
                  }}>
                    <span className="vehicle-viewer__spec-label" style={{ color: "var(--muted)" }}>{label}</span>
                    <span className={`vehicle-viewer__spec-value ${label === "Precio/día" ? 'vehicle-viewer__spec-value--price' : ''}`} style={{ fontWeight: 500, color: label === "Precio/día" ? "var(--gold)" : "var(--text)" }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {tab === "features" && (
              <div className="vehicle-viewer__features" style={{ display: "flex", flexDirection: "column", gap: "0.4rem", flex: 1 }}>
                {vehicle.features.map((f) => (
                  <div key={f} className="vehicle-viewer__feature-item" style={{
                    display: "flex", alignItems: "center", gap: "0.65rem",
                    padding: "0.6rem 0.75rem",
                    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                    borderRadius: 6, fontSize: "0.83rem", color: "var(--muted2)",
                  }}>
                    <span className="vehicle-viewer__feature-icon" style={{ color: "var(--gold)", fontSize: "0.6rem" }}>◆</span>
                    <span className="vehicle-viewer__feature-text">{f}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            <p className="vehicle-viewer__description" style={{
              color: "var(--muted)", fontSize: "0.78rem", lineHeight: 1.65,
              margin: "1rem 0",
              paddingTop: "1rem", borderTop: "1px solid var(--border)",
            }}>
              {vehicle.description}
            </p>

            {/* CTAs */}
            <div className="vehicle-viewer__actions" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
              <button
                disabled={!vehicle.available}
                onClick={() => { if (vehicle.available) openModal(vehicle); }}
                className={`vehicle-viewer__reserve-button ${vehicle.available ? 'vehicle-viewer__reserve-button--enabled' : 'vehicle-viewer__reserve-button--disabled'}`}
                style={{
                  width: "100%", padding: "0.9rem",
                  background: vehicle.available ? "var(--gold)" : "#181820",
                  color: vehicle.available ? "#000" : "#333",
                  border: "none", borderRadius: 6,
                  fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.08em",
                  cursor: vehicle.available ? "pointer" : "not-allowed",
                  boxShadow: vehicle.available ? "0 4px 24px rgba(245,158,11,0.3)" : "none",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { if (vehicle.available) { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none"; }}
              >
                {vehicle.available ? "RESERVAR AHORA" : "NO DISPONIBLE"}
              </button>
              <button
                onClick={() => selectVehicle(null)}
                className="vehicle-viewer__back-button"
                style={{
                  width: "100%", padding: "0.72rem",
                  background: "transparent", color: "var(--muted)",
                  border: "1px solid var(--border)", borderRadius: 6,
                  fontFamily: "var(--font-dm-sans)", fontSize: "0.82rem",
                  cursor: "pointer", transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted)"; }}
              >
                ← Volver al showroom
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
