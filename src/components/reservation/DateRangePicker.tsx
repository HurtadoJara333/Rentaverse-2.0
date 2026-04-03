// src/components/reservation/DateRangePicker.tsx
"use client";
import { useState, useEffect } from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { format, isBefore, startOfDay, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { useReservation } from "@/hooks/useReservation";

// Inline styles for react-day-picker (no CSS import needed)
const pickerCSS = `
  .rdp { --rdp-cell-size:40px; --rdp-accent-color:#F59E0B; --rdp-background-color:rgba(245,158,11,0.1); margin:0; }
  .rdp-months { display:flex; gap:1rem; }
  .rdp-month { width:100%; }
  .rdp-caption { display:flex; align-items:center; justify-content:space-between; padding:0 0.5rem; margin-bottom:0.75rem; }
  .rdp-caption_label { font-family:var(--font-bebas); font-size:1rem; letter-spacing:0.08em; color:var(--text); }
  .rdp-nav_button { background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.1); border-radius:4px; width:28px; height:28px; display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--muted2); transition:all 0.15s; }
  .rdp-nav_button:hover { background:rgba(255,255,255,0.12); color:var(--text); }
  .rdp-head_cell { font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted); font-weight:500; padding-bottom:0.5rem; }
  .rdp-cell { padding:2px; }
  .rdp-button { width:var(--rdp-cell-size); height:var(--rdp-cell-size); border-radius:6px; font-size:0.82rem; cursor:pointer; border:none; background:transparent; color:var(--text); transition:all 0.15s; }
  .rdp-button:hover:not([disabled]) { background:rgba(255,255,255,0.08); }
  .rdp-button[disabled] { opacity:0.25; cursor:not-allowed; }
  .rdp-day_selected:not(.rdp-day_range_middle) { background:var(--gold)!important; color:#000!important; font-weight:700; }
  .rdp-day_range_middle { background:rgba(245,158,11,0.15)!important; color:var(--text)!important; border-radius:0!important; }
  .rdp-day_range_start { border-radius:6px 0 0 6px!important; }
  .rdp-day_range_end { border-radius:0 6px 6px 0!important; }
  .rdp-day_today:not(.rdp-day_selected) { color:var(--gold); font-weight:700; }
  .rdp-day_outside { opacity:0.3; }
  .booked-day button { background:rgba(239,68,68,0.12)!important; color:#EF4444!important; text-decoration:line-through; cursor:not-allowed!important; }
`;

export default function DateRangePicker() {
  const { vehicle, dates, totalDays, totalPrice, isAvailable, bookedRanges, checkAvailability } = useReservation();
  const [range, setRange] = useState<DateRange | undefined>(
    dates.startDate && dates.endDate
      ? { from: dates.startDate, to: dates.endDate }
      : undefined
  );

  const today = startOfDay(new Date());
  const minDate = addDays(today, 1); // can't book today

  // Disabled days: past + already booked
  const disabledDays = [
    { before: minDate },
    ...bookedRanges.map((r) => ({ from: r.startDate, to: r.endDate })),
  ];

  useEffect(() => {
    if (range?.from && range?.to) {
      checkAvailability({ startDate: range.from, endDate: range.to });
    }
  }, [range]);

  const handleSelect = (r: DateRange | undefined) => {
    setRange(r);
    if (!r?.from || !r?.to) {
      checkAvailability({ startDate: null, endDate: null });
    }
  };

  const nightsText = totalDays === 1 ? "1 día" : `${totalDays} días`;

  return (
    <div className="date-range-picker">
      <style>{pickerCSS}</style>

      {/* Legend */}
      <div className="date-range-picker__legend" style={{ display: "flex", gap: "1.2rem", marginBottom: "1rem", fontSize: "0.72rem", color: "var(--muted)" }}>
        <span className="date-range-picker__legend-item" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span className="date-range-picker__legend-color date-range-picker__legend-color--selected" style={{ width: 10, height: 10, borderRadius: 2, background: "var(--gold)", display: "inline-block" }} />
          Seleccionado
        </span>
        <span className="date-range-picker__legend-item" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span className="date-range-picker__legend-color date-range-picker__legend-color--unavailable" style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(239,68,68,0.3)", display: "inline-block" }} />
          No disponible
        </span>
        <span className="date-range-picker__legend-item" style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <span className="date-range-picker__legend-color date-range-picker__legend-color--available" style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(255,255,255,0.06)", display: "inline-block" }} />
          Disponible
        </span>
      </div>

      {/* Calendar */}
      <div className="date-range-picker__calendar" style={{ background: "rgba(255,255,255,0.02)", borderRadius: 8, padding: "1rem", border: "1px solid var(--border)" }}>
        <DayPicker
          mode="range"
          selected={range}
          onSelect={handleSelect}
          disabled={disabledDays}
          locale={es}
          numberOfMonths={1}
          fromDate={minDate}
          modifiersClassNames={{ booked: "booked-day" }}
        />
      </div>

      {/* Summary */}
      {range?.from && range?.to && (
        <div className="date-range-picker__summary" style={{
          marginTop: "1rem", padding: "0.9rem 1rem",
          background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
          borderRadius: 8, display: "flex", flexDirection: "column", gap: "0.5rem",
        }}>
          <div className="date-range-picker__summary-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <span className="date-range-picker__summary-label" style={{ color: "var(--muted)" }}>Desde</span>
            <span className="date-range-picker__summary-value" style={{ fontWeight: 500 }}>{format(range.from, "dd MMM yyyy", { locale: es })}</span>
          </div>
          <div className="date-range-picker__summary-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <span className="date-range-picker__summary-label" style={{ color: "var(--muted)" }}>Hasta</span>
            <span className="date-range-picker__summary-value" style={{ fontWeight: 500 }}>{format(range.to, "dd MMM yyyy", { locale: es })}</span>
          </div>
          <div className="date-range-picker__summary-divider" style={{ height: 1, background: "var(--border)" }} />
          <div className="date-range-picker__summary-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <span className="date-range-picker__summary-label" style={{ color: "var(--muted)" }}>Duración</span>
            <span className="date-range-picker__summary-value">{nightsText} × ${vehicle?.pricePerDay}/día</span>
          </div>
          <div className="date-range-picker__summary-row date-range-picker__summary-row--total" style={{ display: "flex", justifyContent: "space-between" }}>
            <span className="date-range-picker__summary-label date-range-picker__summary-label--total" style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.05em", color: "var(--muted)" }}>TOTAL</span>
            <span className="date-range-picker__summary-value date-range-picker__summary-value--total" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", color: "var(--gold)" }}>${totalPrice}</span>
          </div>

          {/* Availability badge */}
          {isAvailable === true && (
            <div className="date-range-picker__availability date-range-picker__availability--available" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#22C55E" }}>
              <span className="date-range-picker__availability-dot">●</span> Disponible para las fechas seleccionadas
            </div>
          )}
          {isAvailable === false && (
            <div className="date-range-picker__availability date-range-picker__availability--unavailable" style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", color: "#EF4444" }}>
              <span className="date-range-picker__availability-dot">●</span> No disponible en esas fechas — elige otras
            </div>
          )}
        </div>
      )}
    </div>
  );
}
