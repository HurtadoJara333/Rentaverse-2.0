// src/components/reservation/ReservationForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useReservation } from "@/hooks/useReservation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formSchema = z.object({
  customerName:  z.string().min(2, "Mínimo 2 caracteres"),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(7, "Teléfono inválido"),
  customerIdDoc: z.string().min(5, "Documento inválido"),
});
type FormData = z.infer<typeof formSchema>;

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.85rem",
  background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)",
  borderRadius: 6, color: "var(--text)", fontSize: "0.88rem",
  fontFamily: "var(--font-dm-sans)", outline: "none",
  transition: "border-color 0.18s",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.68rem", letterSpacing: "0.1em",
  textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.4rem",
};

const errorStyle: React.CSSProperties = {
  fontSize: "0.72rem", color: "#EF4444", marginTop: "0.3rem",
};

export default function ReservationForm() {
  const { vehicle, dates, totalDays, totalPrice, submitReservation, setStep } = useReservation();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    await submitReservation(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="reservation-form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Summary bar */}
      <div className="reservation-form__summary" style={{
        background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 8, padding: "0.85rem 1rem",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div className="reservation-form__summary-info">
          <div className="reservation-form__summary-vehicle" style={{ fontFamily: "var(--font-bebas)", fontSize: "1rem", letterSpacing: "0.05em" }}>{vehicle?.name}</div>
          <div className="reservation-form__summary-dates" style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
            {dates.startDate && format(dates.startDate, "dd MMM", { locale: es })}
            {" → "}
            {dates.endDate && format(dates.endDate, "dd MMM yyyy", { locale: es })}
            {" · "}
            {totalDays} {totalDays === 1 ? "día" : "días"}
          </div>
        </div>
        <div className="reservation-form__summary-price" style={{ textAlign: "right" }}>
          <div className="reservation-form__summary-price-amount" style={{ fontFamily: "var(--font-bebas)", fontSize: "1.6rem", color: "var(--gold)", lineHeight: 1 }}>${totalPrice}</div>
          <div className="reservation-form__summary-price-label" style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</div>
        </div>
      </div>

      {/* Fields */}
      <div className="reservation-form__fields" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        <div className="reservation-form__field reservation-form__field--full">
          <label className="reservation-form__label" style={labelStyle}>Nombre completo *</label>
          <input
            {...register("customerName")}
            placeholder="Juan Pérez"
            className="reservation-form__input"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {errors.customerName && <p className="reservation-form__error" style={errorStyle}>{errors.customerName.message}</p>}
        </div>

        <div className="reservation-form__field reservation-form__field--full">
          <label className="reservation-form__label" style={labelStyle}>Email *</label>
          <input
            {...register("customerEmail")}
            type="email"
            placeholder="juan@email.com"
            className="reservation-form__input"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {errors.customerEmail && <p className="reservation-form__error" style={errorStyle}>{errors.customerEmail.message}</p>}
        </div>

        <div className="reservation-form__field">
          <label className="reservation-form__label" style={labelStyle}>Teléfono *</label>
          <input
            {...register("customerPhone")}
            type="tel"
            placeholder="+57 300 000 0000"
            className="reservation-form__input"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {errors.customerPhone && <p className="reservation-form__error" style={errorStyle}>{errors.customerPhone.message}</p>}
        </div>

        <div className="reservation-form__field">
          <label className="reservation-form__label" style={labelStyle}>Cédula / Pasaporte *</label>
          <input
            {...register("customerIdDoc")}
            placeholder="1234567890"
            className="reservation-form__input"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "rgba(245,158,11,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
          {errors.customerIdDoc && <p className="reservation-form__error" style={errorStyle}>{errors.customerIdDoc.message}</p>}
        </div>
      </div>

      {/* Terms */}
      <p className="reservation-form__terms" style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.6 }}>
        Al confirmar aceptas nuestros términos de servicio. El vehículo quedará reservado a tu nombre
        y recibirás un código de confirmación.
      </p>

      {/* Actions */}
      <div className="reservation-form__actions" style={{ display: "flex", gap: "0.6rem" }}>
        <button
          type="button"
          onClick={() => setStep("dates")}
          className="reservation-form__button reservation-form__button--secondary"
          style={{
            flex: 1, padding: "0.8rem", background: "transparent",
            border: "1px solid var(--border)", borderRadius: 6,
            color: "var(--muted2)", fontSize: "0.82rem", cursor: "pointer",
            fontFamily: "var(--font-dm-sans)", transition: "all 0.18s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted2)"; }}
        >
          ← Cambiar fechas
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`reservation-form__button reservation-form__button--primary ${isSubmitting ? 'reservation-form__button--disabled' : ''}`}
          style={{
            flex: 2, padding: "0.85rem",
            background: isSubmitting ? "#333" : "var(--gold)",
            color: isSubmitting ? "#666" : "#000",
            border: "none", borderRadius: 6,
            fontFamily: "var(--font-bebas)", fontSize: "1.05rem", letterSpacing: "0.07em",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            boxShadow: isSubmitting ? "none" : "0 4px 20px rgba(245,158,11,0.28)",
          }}
        >
          {isSubmitting ? "Confirmando…" : "CONFIRMAR RESERVA"}
        </button>
      </div>
    </form>
  );
}
