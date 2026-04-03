// src/components/reservation/ReservationModal.tsx
"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useReservation } from "@/hooks/useReservation";
import DateRangePicker from "./DateRangePicker";
import ReservationForm from "./ReservationForm";
import ReservationSuccess from "./ReservationSuccess";

const STEP_TITLES: Record<string, string> = {
  dates:      "Selecciona las fechas",
  form:       "Datos del cliente",
  confirming: "Procesando…",
  success:    "¡Reserva confirmada!",
  error:      "Error en la reserva",
};

export default function ReservationModal() {
  const {
    isOpen, vehicle, step, dates, totalDays, isAvailable,
    closeModal, setStep, errorMsg, reset,
  } = useReservation();

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !vehicle) return null;

  const canProceed = dates.startDate && dates.endDate && isAvailable === true;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="reservation-modal__backdrop"
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.8)",
              backdropFilter: "blur(6px)",
            }}
          />

          {/* ── Scroll container — full screen, centers the card ── */}
          <div
            className="reservation-modal__container"
            style={{
              position: "fixed", inset: 0, zIndex: 201,
              overflowY: "auto",
              // Padding so the card never glues to the edges
              padding: "1rem",
              // Flex column so the card centers vertically when content is short
              // but scrolls naturally when content is tall
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              // Extra top padding so header doesn't cover the modal
              paddingTop: "clamp(1rem, 5vh, 3rem)",
              paddingBottom: "clamp(1rem, 5vh, 3rem)",
            }}
            // Click on the scroll container (not the card) = close
            onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          >
            {/* ── Modal card ── */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="reservation-modal__card"
              style={{
                // Width — responsive, never wider than 500px, never touches edges
                width: "min(500px, 100%)",
                // Let height grow with content — NO maxHeight here
                // The scroll container handles overflow
                background: "rgba(4,4,14,0.98)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 14,
                boxShadow: "0 32px 80px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                // Prevent card from shrinking
                flexShrink: 0,
              }}
            >
              {/* ── Header ── */}
              <div className="reservation-modal__header" style={{
                padding: "1.2rem 1.4rem 1rem",
                borderBottom: "1px solid var(--border)",
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                gap: "0.75rem",
              }}>
                <div className="reservation-modal__header-content">
                  {/* Step dots */}
                  {step !== "success" && step !== "error" && (
                    <div className="reservation-modal__step-dots" style={{ display: "flex", gap: "0.35rem", marginBottom: "0.5rem" }}>
                      {(["dates", "form"] as const).map((s) => (
                        <div key={s} className={`reservation-modal__step-dot ${step === s || (step === "confirming" && s === "form") ? 'reservation-modal__step-dot--active' : step === "form" && s === "dates" ? 'reservation-modal__step-dot--completed' : 'reservation-modal__step-dot--inactive'}`} style={{
                          height: 3, borderRadius: 2,
                          width: s === "dates" ? 32 : 24,
                          background:
                            step === s || (step === "confirming" && s === "form")
                              ? "var(--gold)"
                              : step === "form" && s === "dates"
                                ? "rgba(245,158,11,0.4)"
                                : "rgba(255,255,255,0.12)",
                          transition: "all 0.3s",
                        }} />
                      ))}
                    </div>
                  )}
                  <div className="reservation-modal__title" style={{
                    fontFamily: "var(--font-bebas)", fontSize: "1.2rem",
                    letterSpacing: "0.06em", color: "var(--text)", lineHeight: 1.2,
                  }}>
                    {STEP_TITLES[step]}
                  </div>
                  {step === "dates" && (
                    <div className="reservation-modal__subtitle" style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                      {vehicle.name} · ${vehicle.pricePerDay}/día
                    </div>
                  )}
                </div>

                {/* Close button */}
                <button
                  onClick={closeModal}
                  aria-label="Cerrar"
                  className="reservation-modal__close-button"
                  style={{
                    flexShrink: 0,
                    background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)",
                    color: "var(--muted)", borderRadius: 6,
                    // Larger tap target on mobile
                    width: 36, height: 36,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", fontSize: "1rem", lineHeight: 1,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)";
                    e.currentTarget.style.color = "var(--text)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "var(--muted)";
                  }}
                >
                  ✕
                </button>
              </div>

              {/* ── Body ── */}
              <div className="reservation-modal__body" style={{ padding: "1.2rem 1.4rem 1.4rem" }}>
                <AnimatePresence mode="wait">

                  {/* Step 1 — Dates */}
                  {step === "dates" && (
                    <motion.div
                      key="dates"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      transition={{ duration: 0.18 }}
                      className="reservation-modal__step reservation-modal__step--dates"
                    >
                      <DateRangePicker />
                      <button
                        onClick={() => setStep("form")}
                        disabled={!canProceed}
                        className={`reservation-modal__continue-button ${canProceed ? 'reservation-modal__continue-button--enabled' : 'reservation-modal__continue-button--disabled'}`}
                        style={{
                          width: "100%", marginTop: "1rem", padding: "0.9rem",
                          background: canProceed ? "var(--gold)" : "#1a1a22",
                          color: canProceed ? "#000" : "#444",
                          border: "none", borderRadius: 6,
                          fontFamily: "var(--font-bebas)", fontSize: "1.05rem",
                          letterSpacing: "0.07em",
                          cursor: canProceed ? "pointer" : "not-allowed",
                          transition: "all 0.2s",
                          boxShadow: canProceed ? "0 4px 20px rgba(245,158,11,0.28)" : "none",
                        }}
                      >
                        {!dates.startDate || !dates.endDate
                          ? "Selecciona las fechas →"
                          : isAvailable === null
                            ? "Verificando disponibilidad…"
                            : isAvailable === false
                              ? "No disponible en esas fechas"
                              : `Continuar · ${totalDays} ${totalDays === 1 ? "día" : "días"} →`}
                      </button>
                    </motion.div>
                  )}

                  {/* Step 2 — Form */}
                  {(step === "form" || step === "confirming") && (
                    <motion.div
                      key="form"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.18 }}
                      className="reservation-modal__step reservation-modal__step--form"
                    >
                      <ReservationForm />
                    </motion.div>
                  )}

                  {/* Step 3 — Success */}
                  {step === "success" && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="reservation-modal__step reservation-modal__step--success"
                    >
                      <ReservationSuccess />
                    </motion.div>
                  )}

                  {/* Error */}
                  {step === "error" && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="reservation-modal__step reservation-modal__step--error"
                      style={{ textAlign: "center", padding: "1.5rem 0" }}
                    >
                      <div className="reservation-modal__error-icon" style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⚠️</div>
                      <div className="reservation-modal__error-title" style={{
                        fontFamily: "var(--font-bebas)", fontSize: "1.4rem",
                        color: "#EF4444", marginBottom: "0.5rem",
                      }}>
                        ERROR EN LA RESERVA
                      </div>
                      <p className="reservation-modal__error-message" style={{
                        color: "var(--muted)", fontSize: "0.88rem",
                        marginBottom: "1.5rem", lineHeight: 1.6,
                      }}>
                        {errorMsg ?? "Ocurrió un error inesperado. Por favor intenta de nuevo."}
                      </p>
                      <div className="reservation-modal__error-actions" style={{ display: "flex", gap: "0.6rem" }}>
                        <button
                          onClick={() => reset()}
                          className="reservation-modal__error-button reservation-modal__error-button--retry"
                          style={{
                            flex: 1, padding: "0.85rem",
                            background: "transparent",
                            border: "1px solid var(--border)", borderRadius: 6,
                            color: "var(--muted2)", fontSize: "0.85rem", cursor: "pointer",
                            fontFamily: "var(--font-dm-sans)",
                          }}
                        >
                          Intentar de nuevo
                        </button>
                        <button
                          onClick={closeModal}
                          className="reservation-modal__error-button reservation-modal__error-button--close"
                          style={{
                            flex: 1, padding: "0.85rem",
                            background: "var(--gold)", color: "#000",
                            border: "none", borderRadius: 6,
                            fontFamily: "var(--font-bebas)", fontSize: "1rem",
                            letterSpacing: "0.07em", cursor: "pointer",
                          }}
                        >
                          CERRAR
                        </button>
                      </div>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
