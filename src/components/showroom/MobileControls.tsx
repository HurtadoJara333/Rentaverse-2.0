// src/components/showroom/MobileControls.tsx
"use client";
import { useEffect, useState, useRef, useCallback } from "react";

interface Props {
  // Called continuously while joystick is active
  // dx/dy in [-1, 1] — rotation deltas
  onDrag: (dx: number, dy: number) => void;
}

export default function MobileControls({ onDrag }: Props) {
  const [visible, setVisible]   = useState(false);
  const [active, setActive]     = useState(false);
  const [pos, setPos]           = useState({ x: 0, y: 0 });    // joystick center
  const [knob, setKnob]         = useState({ x: 0, y: 0 });    // knob offset
  const stickRef                = useRef<{ x: number; y: number } | null>(null);
  const rafRef                  = useRef<number | null>(null);
  const MAX_R = 40;

  // Show only on touch devices
  useEffect(() => {
    const check = () => setVisible("ontouchstart" in window || navigator.maxTouchPoints > 0);
    check();
  }, []);

  const startDrag = useCallback((clientX: number, clientY: number) => {
    setActive(true);
    setPos({ x: clientX, y: clientY });
    setKnob({ x: 0, y: 0 });
    stickRef.current = { x: clientX, y: clientY };
  }, []);

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!stickRef.current) return;
    const dx = clientX - stickRef.current.x;
    const dy = clientY - stickRef.current.y;
    const dist = Math.hypot(dx, dy);
    const clamped = Math.min(dist, MAX_R);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clamped;
    const ky = Math.sin(angle) * clamped;
    setKnob({ x: kx, y: ky });

    // Emit normalized delta
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      onDrag(kx / MAX_R * 0.012, ky / MAX_R * 0.01);
    });
  }, [onDrag]);

  const endDrag = useCallback(() => {
    setActive(false);
    setKnob({ x: 0, y: 0 });
    stickRef.current = null;
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  if (!visible) return null;

  return (
    <>
      {/* Joystick — bottom left */}
      <div
        className="mobile-controls__joystick"
        style={{
          position: "fixed", bottom: "5.5rem", left: "1.5rem", zIndex: 25,
          touchAction: "none", userSelect: "none",
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          startDrag(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          moveDrag(t.clientX, t.clientY);
        }}
        onTouchEnd={(e) => { e.preventDefault(); endDrag(); }}
      >
        {/* Base ring */}
        <div className="mobile-controls__joystick-base" style={{
          width: 90, height: 90, borderRadius: "50%",
          background: "rgba(2,2,10,0.75)",
          border: `2px solid ${active ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(8px)",
          transition: "border-color 0.2s",
          position: "relative",
        }}>
          {/* Cross guides */}
          {[0, 90].map((r) => (
            <div key={r} className="mobile-controls__joystick-guide" style={{
              position: "absolute", background: "rgba(255,255,255,0.06)",
              width: r === 0 ? "100%" : 1, height: r === 0 ? 1 : "100%",
              left: r === 0 ? 0 : "50%", top: r === 0 ? "50%" : 0,
            }} />
          ))}

          {/* Knob */}
          <div className="mobile-controls__joystick-knob" style={{
            width: 36, height: 36, borderRadius: "50%",
            background: active
              ? "rgba(245,158,11,0.85)"
              : "rgba(255,255,255,0.15)",
            border: "2px solid " + (active ? "rgba(245,158,11,1)" : "rgba(255,255,255,0.25)"),
            transform: `translate(${knob.x}px, ${knob.y}px)`,
            transition: active ? "none" : "transform 0.2s ease, background 0.2s, border-color 0.2s",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: active ? "0 0 16px rgba(245,158,11,0.4)" : "none",
            backdropFilter: "blur(4px)",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2L7 12M2 7L12 7" stroke={active ? "#000" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Label */}
        <div className="mobile-controls__joystick-label" style={{
          textAlign: "center", marginTop: "0.4rem",
          fontSize: "0.58rem", color: "rgba(255,255,255,0.25)",
          letterSpacing: "0.1em", textTransform: "uppercase",
        }}>
          Rotar
        </div>
      </div>

      {/* Hint bubble — only shown first time */}
      <MobileHint />
    </>
  );
}

// ── One-time hint ─────────────────────────────────────────────────────────────
function MobileHint() {
  const [show, setShow] = useState(true);
  useEffect(() => { const t = setTimeout(() => setShow(false), 4000); return () => clearTimeout(t); }, []);
  if (!show) return null;
  return (
    <div className="mobile-controls__hint" style={{
      position: "fixed", bottom: "10rem", left: "50%", transform: "translateX(-50%)",
      zIndex: 25, pointerEvents: "none",
      background: "rgba(2,2,10,0.88)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 100, padding: "0.45rem 1.1rem",
      fontSize: "0.72rem", color: "rgba(255,255,255,0.5)",
      backdropFilter: "blur(12px)", whiteSpace: "nowrap",
      animation: "fadeOut 1s 3s ease forwards",
    }}>
      👆 Arrastra · 🤏 Pellizca para zoom
      <style>{`@keyframes fadeOut { to { opacity:0; } }`}</style>
    </div>
  );
}
