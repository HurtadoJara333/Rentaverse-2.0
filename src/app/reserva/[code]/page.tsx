// src/app/reserva/[code]/page.tsx
"use client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ReservationData {
  _id:              string;
  confirmationCode: string;
  vehicleName:      string;
  vehicleBrand:     string;
  vehicleSlot:      string;
  customerName:     string;
  customerEmail:    string;
  startDate:        string;
  endDate:          string;
  totalDays:        number;
  totalPrice:       number;
  pricePerDay:      number;
  status:           "confirmed" | "cancelled" | "pending";
  createdAt:        string;
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string; border: string }> = {
  confirmed: { label: "Confirmada",  color: "#22C55E", bg: "rgba(34,197,94,0.1)",  border: "rgba(34,197,94,0.25)" },
  cancelled: { label: "Cancelada",   color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
  pending:   { label: "Pendiente",   color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
};

export default function ReservationPage({ params }: { params: { code: string } }) {
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");

  useEffect(() => {
    fetch(`/api/reservations/${params.code}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setReservation(d.reservation);
        setLoading(false);
      })
      .catch(() => { setError("Error de conexión"); setLoading(false); });
  }, [params.code]);

  return (
    <div style={{
      minHeight: "100vh", background: "#080c10",
      fontFamily: "var(--font-dm-sans)", color: "#E8E8F0",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "3rem 1rem",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <a href="/" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "var(--font-bebas)", fontSize: "1.5rem", color: "#F59E0B", letterSpacing: "0.15em" }}>
            APEX RENTALS
          </div>
        </a>
        <div style={{ fontSize: "0.7rem", color: "#4B5563", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 4 }}>
          Confirmación de reserva
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 520 }}>

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", color: "#4B5563", fontSize: "0.85rem", letterSpacing: "0.1em" }}>
            Buscando reserva…
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{
            background: "#0c1117", border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12, padding: "2.5rem", textAlign: "center",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🔍</div>
            <div style={{ fontFamily: "var(--font-bebas)", fontSize: "1.4rem", color: "#EF4444", marginBottom: "0.5rem" }}>
              Reserva no encontrada
            </div>
            <p style={{ color: "#6B7280", fontSize: "0.85rem", lineHeight: 1.65 }}>
              El código <strong style={{ color: "#E8E8F0", fontFamily: "monospace" }}>{params.code}</strong> no existe o es incorrecto.
            </p>
            <a href="/" style={{
              display: "inline-block", marginTop: "1.5rem",
              background: "#F59E0B", color: "#000", textDecoration: "none",
              fontFamily: "var(--font-bebas)", fontSize: "0.95rem", letterSpacing: "0.07em",
              padding: "0.7rem 1.6rem", borderRadius: 6,
            }}>
              VOLVER AL SHOWROOM
            </a>
          </div>
        )}

        {/* Reservation found */}
        {!loading && reservation && (() => {
          const s     = STATUS_LABEL[reservation.status] ?? STATUS_LABEL.pending;
          const start = new Date(reservation.startDate);
          const end   = new Date(reservation.endDate);
          const isCancelled = reservation.status === "cancelled";

          return (
            <div style={{ background: "#0c1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>

              {/* Top status bar */}
              <div style={{ height: 4, background: s.color }} />

              {/* Code block */}
              <div style={{ padding: "2rem 2rem 1.5rem", textAlign: "center", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: "0.35rem",
                  fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase",
                  padding: "0.25rem 0.75rem", borderRadius: "100px",
                  background: s.bg, color: s.color, border: `1px solid ${s.border}`,
                  marginBottom: "1rem",
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor" }} />
                  {s.label}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "1.8rem", fontWeight: 900, letterSpacing: "0.15em", color: "#F59E0B" }}>
                  {reservation.confirmationCode}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#4B5563", marginTop: "0.5rem" }}>
                  Código de confirmación · Creada el {format(new Date(reservation.createdAt), "dd MMM yyyy", { locale: es })}
                </div>
              </div>

              {/* Vehicle */}
              <div style={{ padding: "1.4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "0.4rem" }}>
                  Vehículo
                </div>
                <div style={{ fontSize: "1.2rem", fontWeight: 600 }}>{reservation.vehicleName}</div>
                <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "0.2rem" }}>
                  {reservation.vehicleBrand} · Slot {reservation.vehicleSlot}
                </div>
              </div>

              {/* Dates + price */}
              <div style={{ padding: "1.4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "0.3rem" }}>Desde</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>{format(start, "dd 'de' MMMM yyyy", { locale: es })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "0.3rem" }}>Hasta</div>
                    <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>{format(end, "dd 'de' MMMM yyyy", { locale: es })}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.85rem", color: "#6B7280" }}>
                    {reservation.totalDays} {reservation.totalDays === 1 ? "día" : "días"} × ${reservation.pricePerDay}/día
                  </div>
                  <div style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", color: "#F59E0B", letterSpacing: "0.05em" }}>
                    ${reservation.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Customer */}
              <div style={{ padding: "1.4rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "0.65rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B7280", marginBottom: "0.6rem" }}>
                  Titular de la reserva
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>{reservation.customerName}</div>
                <div style={{ fontSize: "0.8rem", color: "#6B7280", marginTop: "0.2rem" }}>{reservation.customerEmail}</div>
              </div>

              {/* Instructions / CTA */}
              <div style={{ padding: "1.5rem 2rem" }}>
                {!isCancelled ? (
                  <div style={{
                    background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.18)",
                    borderRadius: 8, padding: "1rem", fontSize: "0.82rem", color: "#9CA3AF", lineHeight: 1.7,
                    marginBottom: "1.2rem",
                  }}>
                    <strong style={{ color: "#F59E0B" }}>📋 Instrucciones:</strong><br />
                    Presenta tu código <strong style={{ color: "#E8E8F0", fontFamily: "monospace" }}>{reservation.confirmationCode}</strong> y
                    tu documento de identidad al recoger el vehículo en el slot <strong style={{ color: "#E8E8F0" }}>{reservation.vehicleSlot}</strong>.
                  </div>
                ) : (
                  <div style={{
                    background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)",
                    borderRadius: 8, padding: "1rem", fontSize: "0.82rem", color: "#9CA3AF", lineHeight: 1.7,
                    marginBottom: "1.2rem",
                  }}>
                    <strong style={{ color: "#EF4444" }}>⚠️ Reserva cancelada.</strong><br />
                    Esta reserva fue cancelada. Contacta con nosotros si tienes preguntas.
                  </div>
                )}

                <a href="/" style={{
                  display: "block", textAlign: "center",
                  background: "#F59E0B", color: "#000", textDecoration: "none",
                  fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.07em",
                  padding: "0.85rem", borderRadius: 6,
                }}>
                  VOLVER AL SHOWROOM
                </a>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
