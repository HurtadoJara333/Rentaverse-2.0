// src/app/admin/layout.tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",              label: "Métricas",   icon: "📊" },
  { href: "/admin/reservations", label: "Reservas",   icon: "📋" },
  { href: "/admin/fleet",        label: "Flota",      icon: "🚗" },
  { href: "/admin/editor",       label: "Editor 360°", icon: "🗺️" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Quick auth check via cookie presence (session validated on API routes)
    fetch("/api/admin/stats", { method: "GET" })
      .then((r) => {
        if (r.status === 401 && pathname !== "/admin/login") {
          router.replace("/admin/login");
        }
        setChecking(false);
      })
      .catch(() => setChecking(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  };

  if (pathname === "/admin/login") return <>{children}</>;
  if (checking) return (
    <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#4B5563", fontSize: "0.8rem", letterSpacing: "0.1em" }}>Verificando sesión…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#080c10", display: "flex", fontFamily: "var(--font-dm-sans)" }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: "#0c1117",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column",
        position: "sticky", top: 0, height: "100vh",
      }}>
        {/* Logo */}
        <div style={{ padding: "1.5rem 1.2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: "1.2rem", color: "#F59E0B", letterSpacing: "0.12em" }}>
            APEX RENTALS
          </div>
          <div style={{ fontSize: "0.65rem", color: "#4B5563", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 2 }}>
            Admin Dashboard
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: "0.75rem 0.6rem", flex: 1 }}>
          {NAV.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <a
                key={href}
                href={href}
                style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.6rem 0.75rem", borderRadius: 7, marginBottom: 2,
                  fontSize: "0.85rem", textDecoration: "none", transition: "all 0.15s",
                  background: active ? "rgba(245,158,11,0.1)" : "transparent",
                  color: active ? "#F59E0B" : "#6B7280",
                  fontWeight: active ? 500 : 400,
                  borderLeft: active ? "2px solid #F59E0B" : "2px solid transparent",
                }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#E8E8F0"; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; } }}
              >
                <span style={{ fontSize: "1rem" }}>{icon}</span>
                {label}
              </a>
            );
          })}
        </nav>

        {/* Bottom — back to showroom + logout */}
        <div style={{ padding: "0.75rem 0.6rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          <a href="/" style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.55rem 0.75rem", borderRadius: 7,
            fontSize: "0.8rem", color: "#4B5563", textDecoration: "none", transition: "color 0.15s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#9CA3AF")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
          >
            ← Volver al sitio
          </a>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.55rem 0.75rem", borderRadius: 7, width: "100%",
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: "0.8rem", color: "#4B5563", textAlign: "left", transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
          >
            🔐 Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "2rem" }}>
        {children}
      </main>
    </div>
  );
}
