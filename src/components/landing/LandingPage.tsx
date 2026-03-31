// src/components/landing/LandingPage.tsx
"use client";
import { motion } from "framer-motion";
import { useShowroomStore } from "@/stores/showroomStore";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const FEATURES = [
  { icon: "🏛️", title: "Showroom 3D Navegable", desc: "Tu parqueadero modelado en 3D. Los clientes entran, caminan y exploran como si estuvieran físicamente ahí." },
  { icon: "🚗", title: "Flota Interactiva", desc: "Cada vehículo es un objeto 3D real con PBR materials. Click para ver precios, specs y reservar." },
  { icon: "📱", title: "100% Web · Sin App", desc: "Corre en cualquier browser moderno, desktop o móvil. Comparte con un link." },
  { icon: "⚡", title: "Setup en 48H", desc: "Nuestro equipo configura tu showroom en menos de 2 días. Solo necesitamos fotos de tu flota." },
  { icon: "📊", title: "Analytics de Showroom", desc: "Sabe qué vehículos más exploran tus clientes y optimiza tu flota según demanda real." },
  { icon: "🎨", title: "100% Branded", desc: "Colores, logo, nombre de tu negocio. Cada showroom es único e inconfundible." },
];

export default function LandingPage() {
  const setView = useShowroomStore((s) => s.setView);

  return (
    <div className="landing" style={{
      minHeight: "100vh",
      overflowY: "auto",
      overflowX: "hidden",
      background: "var(--bg)",
    }}>
      {/* NAV */}
      <nav className="landing__nav" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1.25rem 2.5rem",
        background: "linear-gradient(to bottom, rgba(2,2,10,0.97), transparent)",
        backdropFilter: "blur(8px)",
      }}>
        <span className="landing__nav-brand" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", letterSpacing: "0.12em", color: "var(--gold)" }}>
          RENTAVERSE
        </span>
        <div className="landing__nav-menu" style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
          {["Producto", "Negocios", "Precios", "Demo"].map((l) => (
            <a key={l} className="landing__nav-link" style={{ color: "var(--muted)", textDecoration: "none", fontSize: "0.83rem", letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
            >{l}</a>
          ))}
          <button
            onClick={() => setView("showroom")}
            className="landing__nav-cta"
            style={{
              background: "var(--gold)", color: "#000", border: "none", borderRadius: "4px",
              padding: "0.55rem 1.4rem", fontFamily: "var(--font-bebas)", fontSize: "1rem",
              letterSpacing: "0.08em", cursor: "pointer", transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            DEMO EN VIVO
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="landing__hero" style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "0 2.5rem", paddingTop: "5rem",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background effects */}
        <div className="landing__hero-bg" style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 55% at 70% 40%, rgba(245,158,11,0.055) 0%, transparent 65%), radial-gradient(ellipse 50% 35% at 15% 75%, rgba(239,68,68,0.04) 0%, transparent 55%), var(--bg)" }} />
        <div className="landing__hero-pattern" style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />

        <div className="landing__hero-content" style={{ position: "relative", zIndex: 2, maxWidth: 740 }}>
          <motion.div {...fade(0.1)} className="landing__hero-badge" style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.28)",
            borderRadius: "100px", padding: "0.35rem 1rem", marginBottom: "1.5rem",
            fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)",
          }}>
            <span className="landing__hero-badge-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)", animation: "pulse 2s infinite", display: "inline-block" }} />
            Nuevo · Showroom 3D para Rent-a-Car
          </motion.div>

          <motion.h1 {...fade(0.2)} className="landing__hero-title" style={{
            fontFamily: "var(--font-bebas)", fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
            lineHeight: 0.93, letterSpacing: "0.02em", marginBottom: "1.5rem",
          }}>
            TU FLOTA.<br />
            <span className="landing__hero-title-highlight" style={{ color: "var(--gold)" }}>EN 3D.</span><br />
            EN VIVO.
          </motion.h1>

          <motion.p {...fade(0.3)} className="landing__hero-description" style={{ color: "var(--muted)", fontSize: "1.05rem", lineHeight: 1.75, maxWidth: 480, marginBottom: "2.5rem" }}>
            La primera plataforma que lleva tu parqueadero al mundo digital. Tus clientes caminan, exploran los vehículos en 3D y reservan — sin salir de casa.
          </motion.p>

          <motion.div {...fade(0.4)} className="landing__hero-actions" style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button
              onClick={() => setView("showroom")}
              className="landing__hero-cta-primary"
              style={{
                background: "var(--gold)", color: "#000", border: "none", borderRadius: "4px",
                padding: "0.95rem 2.2rem", fontFamily: "var(--font-bebas)", fontSize: "1.15rem",
                letterSpacing: "0.08em", cursor: "pointer", boxShadow: "0 0 36px rgba(245,158,11,0.32)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 44px rgba(245,158,11,0.44)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 0 36px rgba(245,158,11,0.32)"; }}
            >
              ENTRAR AL SHOWROOM DEMO
            </button>
            <button className="landing__hero-cta-secondary" style={{
              background: "transparent", color: "var(--text)", border: "1px solid var(--border)",
              borderRadius: "4px", padding: "0.95rem 2rem", fontFamily: "var(--font-dm-sans)",
              fontSize: "0.9rem", cursor: "pointer", letterSpacing: "0.04em", transition: "border-color 0.2s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              Ver cómo funciona →
            </button>
          </motion.div>

          <motion.div {...fade(0.55)} className="landing__hero-stats" style={{ display: "flex", gap: "3.5rem", marginTop: "4.5rem" }}>
            {[["3X", "Más conversiones"], ["48H", "Setup de showroom"], ["100%", "Sin descargas"]].map(([n, l]) => (
              <div key={l} className="landing__hero-stat">
                <div className="landing__hero-stat-number" style={{ fontFamily: "var(--font-bebas)", fontSize: "2.1rem", color: "var(--gold)" }}>{n}</div>
                <div className="landing__hero-stat-label" style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="landing__features" style={{ padding: "5rem 2.5rem" }}>
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="landing__features-header">
          <div className="landing__features-badge" style={{ fontSize: "0.72rem", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.8rem" }}>Por qué RentaVerse</div>
          <h2 className="landing__features-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2rem, 5vw, 3.8rem)", lineHeight: 1, marginBottom: "0.8rem" }}>
            El showroom que tu negocio merece
          </h2>
          <p className="landing__features-description" style={{ color: "var(--muted)", maxWidth: 460, lineHeight: 1.72 }}>
            Tecnología de videojuego al servicio de tu negocio de alquiler. Sin complicaciones técnicas.
          </p>
        </motion.div>

        <div className="landing__features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1px", marginTop: "3rem", background: "var(--border)", border: "1px solid var(--border)" }}>
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="landing__feature-card"
              style={{ background: "var(--bg2)", padding: "2rem", transition: "background 0.25s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg3)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--bg2)")}
            >
              <div className="landing__feature-icon" style={{ fontSize: "1.8rem", marginBottom: "1.2rem" }}>{f.icon}</div>
              <div className="landing__feature-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.2rem", letterSpacing: "0.05em", marginBottom: "0.55rem" }}>{f.title}</div>
              <div className="landing__feature-description" style={{ color: "var(--muted)", fontSize: "0.87rem", lineHeight: 1.65 }}>{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA DEMO */}
      <section className="landing__cta" style={{ padding: "2rem 2.5rem 5rem" }}>
        <div className="landing__cta-card" style={{
          padding: "4rem", borderRadius: "8px",
          background: "linear-gradient(135deg, rgba(245,158,11,0.07) 0%, rgba(239,68,68,0.04) 100%)",
          border: "1px solid rgba(245,158,11,0.14)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem",
        }}>
          <div className="landing__cta-content">
            <h2 className="landing__cta-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1 }}>
              ¿Listo para llevar tu negocio<br />al <span className="landing__cta-title-highlight" style={{ color: "var(--gold)" }}>siguiente nivel?</span>
            </h2>
            <p className="landing__cta-description" style={{ color: "var(--muted)", marginTop: "0.6rem" }}>Agenda una demo personalizada. Sin compromisos.</p>
          </div>
          <div className="landing__cta-actions" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <button
              onClick={() => setView("showroom")}
              className="landing__cta-button-primary"
              style={{ background: "var(--gold)", color: "#000", border: "none", borderRadius: "4px", padding: "0.9rem 2rem", fontFamily: "var(--font-bebas)", fontSize: "1.1rem", letterSpacing: "0.08em", cursor: "pointer" }}
            >
              ENTRAR AL SHOWROOM 3D
            </button>
            <button className="landing__cta-button-secondary" style={{ background: "transparent", color: "var(--muted2)", border: "1px solid var(--border)", borderRadius: "4px", padding: "0.75rem 2rem", fontSize: "0.85rem", cursor: "pointer" }}>
              Ver planes y precios
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing__footer" style={{ borderTop: "1px solid var(--border)", padding: "2rem 2.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <span className="landing__footer-brand" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.2rem", color: "var(--gold)" }}>RENTAVERSE</span>
        <span className="landing__footer-copyright" style={{ color: "var(--muted)", fontSize: "0.8rem" }}>© 2025 RentaVerse · Todos los derechos reservados</span>
      </footer>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
      `}</style>
    </div>
  );
}
