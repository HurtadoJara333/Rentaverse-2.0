// src/components/admin/AdminUI.tsx
"use client";
import { ReactNode } from "react";

// ── Stat Card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon?: string;
}
export function StatCard({ label, value, sub, accent = "#F59E0B", icon }: StatCardProps) {
  return (
    <div className="admin-ui__stat-card" style={{
      background: "#0c1117", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, padding: "1.2rem 1.4rem",
      borderTop: `2px solid ${accent}`,
    }}>
      <div className="admin-ui__stat-card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div className="admin-ui__stat-card-label" style={{ fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#4B5563" }}>
          {label}
        </div>
        {icon && <span className="admin-ui__stat-card-icon" style={{ fontSize: "1.1rem", opacity: 0.6 }}>{icon}</span>}
      </div>
      <div className="admin-ui__stat-card-value" style={{
        fontFamily: "var(--font-bebas)", fontSize: "2rem", letterSpacing: "0.04em",
        color: "#E8E8F0", lineHeight: 1, marginTop: "0.5rem",
      }}>
        {value}
      </div>
      {sub && (
        <div className="admin-ui__stat-card-subtitle" style={{ fontSize: "0.72rem", color: "#4B5563", marginTop: "0.3rem" }}>{sub}</div>
      )}
    </div>
  );
}

// ── Page Header ──────────────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="admin-ui__page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "1.8rem" }}>
      <div className="admin-ui__page-header-content">
        <h1 className="admin-ui__page-header-title" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", letterSpacing: "0.06em", color: "#E8E8F0", lineHeight: 1 }}>
          {title}
        </h1>
        {sub && <p className="admin-ui__page-header-subtitle" style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "0.3rem" }}>{sub}</p>}
      </div>
      {action && <div className="admin-ui__page-header-action">{action}</div>}
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
export function SectionCard({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="admin-ui__section-card" style={{
      background: "#0c1117", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10, overflow: "hidden", ...style,
    }}>
      {children}
    </div>
  );
}

// ── Status Badge ─────────────────────────────────────────────────────────────
type BadgeVariant = "confirmed" | "cancelled" | "pending" | "available" | "unavailable";
const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string; label: string }> = {
  confirmed:   { bg: "rgba(34,197,94,0.1)",   color: "#22C55E", border: "rgba(34,197,94,0.25)",   label: "Confirmada" },
  cancelled:   { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", border: "rgba(239,68,68,0.25)",   label: "Cancelada" },
  pending:     { bg: "rgba(245,158,11,0.1)",  color: "#F59E0B", border: "rgba(245,158,11,0.25)",  label: "Pendiente" },
  available:   { bg: "rgba(34,197,94,0.1)",   color: "#22C55E", border: "rgba(34,197,94,0.25)",   label: "Disponible" },
  unavailable: { bg: "rgba(239,68,68,0.1)",   color: "#EF4444", border: "rgba(239,68,68,0.25)",   label: "No disponible" },
};
export function Badge({ variant }: { variant: BadgeVariant }) {
  const s = BADGE_STYLES[variant];
  return (
    <span className={`admin-ui__badge admin-ui__badge--${variant}`} style={{
      display: "inline-flex", alignItems: "center", gap: "0.3rem",
      fontSize: "0.68rem", letterSpacing: "0.08em", textTransform: "uppercase",
      padding: "0.2rem 0.6rem", borderRadius: "100px",
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span className="admin-ui__badge-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
      {s.label}
    </span>
  );
}

// ── Table ────────────────────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <div className="admin-ui__table-container" style={{ overflowX: "auto" }}>
      <table className="admin-ui__table" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.83rem" }}>
        <thead className="admin-ui__table-head">
          <tr className="admin-ui__table-header-row" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {headers.map((h) => (
              <th key={h} className="admin-ui__table-header" style={{
                padding: "0.7rem 1rem", textAlign: "left",
                fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#4B5563", fontWeight: 500, whiteSpace: "nowrap",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="admin-ui__table-body">{children}</tbody>
      </table>
    </div>
  );
}

export function TR({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <tr className="admin-ui__table-row" style={{
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      transition: "background 0.12s", ...style,
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </tr>
  );
}

export function TD({ children, muted, style, colSpan }: { children: ReactNode; muted?: boolean; style?: React.CSSProperties; colSpan?: number }) {
  return (
    <td className={`admin-ui__table-cell ${muted ? 'admin-ui__table-cell--muted' : ''}`} colSpan={colSpan} style={{ padding: "0.75rem 1rem", color: muted ? "#6B7280" : "#E8E8F0", verticalAlign: "middle", ...style }}>
      {children}
    </td>
  );
}

// ── Filter Select ────────────────────────────────────────────────────────────
export function FilterSelect({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="admin-ui__filter-select"
      style={{
        background: "#0c1117", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 6, color: "#9CA3AF", fontSize: "0.8rem",
        padding: "0.45rem 0.75rem", cursor: "pointer", outline: "none",
        fontFamily: "var(--font-dm-sans)",
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Search input ─────────────────────────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder ?? "Buscar…"}
      className="admin-ui__search-input"
      style={{
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 6, color: "#E8E8F0", fontSize: "0.82rem",
        padding: "0.45rem 0.75rem", outline: "none", fontFamily: "var(--font-dm-sans)",
        width: 220, transition: "border-color 0.18s",
      }}
      onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.4)")}
      onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
    />
  );
}

// ── Action Button ────────────────────────────────────────────────────────────
export function ActionBtn({ onClick, children, variant = "ghost", disabled }: {
  onClick: () => void; children: ReactNode; variant?: "gold" | "ghost" | "danger"; disabled?: boolean;
}) {
  const styles = {
    gold:   { bg: "#F59E0B", color: "#000" },
    ghost:  { bg: "rgba(255,255,255,0.05)", color: "#9CA3AF" },
    danger: { bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`admin-ui__action-btn admin-ui__action-btn--${variant} ${disabled ? 'admin-ui__action-btn--disabled' : ''}`}
      style={{
        background: styles.bg, color: styles.color,
        border: "1px solid " + (variant === "gold" ? "transparent" : variant === "danger" ? "rgba(239,68,68,0.25)" : "rgba(255,255,255,0.08)"),
        borderRadius: 6, padding: "0.38rem 0.75rem", fontSize: "0.78rem",
        cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
        transition: "all 0.15s", fontFamily: "var(--font-dm-sans)", whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => { if (!disabled && variant === "ghost") e.currentTarget.style.color = "#E8E8F0"; }}
      onMouseLeave={(e) => { if (!disabled && variant === "ghost") e.currentTarget.style.color = "#9CA3AF"; }}
    >
      {children}
    </button>
  );
}
