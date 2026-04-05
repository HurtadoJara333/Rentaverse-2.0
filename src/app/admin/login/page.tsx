// src/app/admin/login/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.replace("/admin");
      } else {
        const d = await res.json();
        setError(d.error ?? "Error desconocido");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login" style={{
      minHeight: "100vh", background: "#080c10",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-dm-sans)",
    }}>
      <div className="admin-login__container" style={{
        width: 360, background: "#0c1117",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12, padding: "2.2rem",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
      }}>
        {/* Header */}
        <div className="admin-login__header" style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div className="admin-login__title" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", color: "#F59E0B", letterSpacing: "0.15em" }}>
            APEX RENTALS
          </div>
          <div className="admin-login__subtitle" style={{ fontSize: "0.75rem", color: "#4B5563", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>
            Panel de Administración
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-login__form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="admin-login__field">
            <label className="admin-login__label" style={{ display: "block", fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#6B7280", marginBottom: "0.45rem" }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              className="admin-login__input"
              style={{
                width: "100%", padding: "0.7rem 0.9rem",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 7, color: "#E8E8F0", fontSize: "0.9rem",
                fontFamily: "var(--font-dm-sans)", outline: "none", transition: "border-color 0.18s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.45)")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {error && (
            <div className="admin-login__error" style={{
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.22)",
              borderRadius: 6, padding: "0.6rem 0.8rem", fontSize: "0.8rem", color: "#EF4444",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className={`admin-login__button ${loading || !password ? 'admin-login__button--disabled' : 'admin-login__button--enabled'}`}
            style={{
              width: "100%", padding: "0.8rem",
              background: loading || !password ? "#1a1f27" : "#F59E0B",
              color: loading || !password ? "#374151" : "#000",
              border: "none", borderRadius: 7,
              fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.07em",
              cursor: loading || !password ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading ? "Verificando…" : "ENTRAR AL DASHBOARD"}
          </button>
        </form>

        <p className="admin-login__footer" style={{ textAlign: "center", marginTop: "1.2rem", fontSize: "0.72rem", color: "#374151" }}>
          Acceso restringido · Solo personal autorizado
        </p>
      </div>
    </div>
  );
}
