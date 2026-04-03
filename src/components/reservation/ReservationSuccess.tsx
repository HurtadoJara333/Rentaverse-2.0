// src/components/reservation/ReservationSuccess.tsx
"use client";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useReservation } from "@/hooks/useReservation";
import { useShowroomStore } from "@/stores/showroomStore";

export default function ReservationSuccess() {
  const { confirmed, closeModal, reset } = useReservation();
  const selectVehicle = useShowroomStore((s) => s.selectVehicle);
  if (!confirmed) return null;

  const start = new Date(confirmed.startDate);
  const end   = new Date(confirmed.endDate);

  const handleReturn = () => {
    reset();
    closeModal();
    selectVehicle(null); // also close the vehicle viewer
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="reservation-success"
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", textAlign: "center" }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 300, damping: 20 }}
        className="reservation-success__icon"
        style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(34,197,94,0.12)", border: "2px solid rgba(34,197,94,0.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem",
        }}
      >
        ✓
      </motion.div>

      <div className="reservation-success__header">
        <div className="reservation-success__title" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.8rem", letterSpacing: "0.05em", color: "#22C55E" }}>
          ¡RESERVA CONFIRMADA!
        </div>
        <div className="reservation-success__subtitle" style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "0.3rem" }}>
          {confirmed.customerName}, tu vehículo está apartado.
        </div>
      </div>

      {/* Confirmation code */}
      <div className="reservation-success__confirmation" style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)",
        borderRadius: 10, padding: "1.2rem 2rem", width: "100%",
      }}>
        <div className="reservation-success__confirmation-label" style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.4rem" }}>
          Código de confirmación
        </div>
        <div className="reservation-success__confirmation-code" style={{
          fontFamily: "var(--font-bebas)", fontSize: "2rem", letterSpacing: "0.2em",
          color: "var(--gold)", userSelect: "all",
        }}>
          {confirmed.confirmationCode}
        </div>
        <div className="reservation-success__confirmation-note" style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: "0.4rem" }}>
          Guarda este código — lo necesitarás al recoger el vehículo
        </div>
      </div>

      {/* Detail rows */}
      <div className="reservation-success__details" style={{
        width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
        borderRadius: 8, padding: "0.9rem 1rem", display: "flex", flexDirection: "column", gap: "0.55rem",
      }}>
        {[
          ["Vehículo", confirmed.vehicleName],
          ["Slot", confirmed.vehicleSlot],
          ["Desde", format(start, "dd 'de' MMMM yyyy", { locale: es })],
          ["Hasta",  format(end,   "dd 'de' MMMM yyyy", { locale: es })],
          ["Duración", `${confirmed.totalDays} ${confirmed.totalDays === 1 ? "día" : "días"}`],
          ["Total", `$${confirmed.totalPrice}`],
        ].map(([label, value]) => (
          <div key={label} className="reservation-success__detail-row" style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
            <span className="reservation-success__detail-label" style={{ color: "var(--muted)" }}>{label}</span>
            <span className={`reservation-success__detail-value ${label === "Total" ? 'reservation-success__detail-value--total' : ''}`} style={{ fontWeight: label === "Total" ? 700 : 400, color: label === "Total" ? "var(--gold)" : "var(--text)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="reservation-success__email-notice" style={{ fontSize: "0.75rem", color: "var(--muted)", lineHeight: 1.65 }}>
        Se ha enviado una confirmación a <strong className="reservation-success__email" style={{ color: "var(--text)" }}>{confirmed.customerEmail}</strong>
      </div>

      {/* Actions */}
      <div className="reservation-success__actions" style={{ display: "flex", gap: "0.6rem", width: "100%" }}>
        <button
          onClick={handleReturn}
          className="reservation-success__return-button"
          style={{
            flex: 1, padding: "0.85rem",
            background: "var(--gold)", color: "#000", border: "none", borderRadius: 6,
            fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.07em",
            cursor: "pointer", transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          VOLVER AL SHOWROOM
        </button>
      </div>
    </motion.div>
  );
}
