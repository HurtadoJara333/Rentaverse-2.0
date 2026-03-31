// src/lib/email.ts
import { Resend } from "resend";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

interface ConfirmationEmailData {
  to:               string;
  customerName:     string;
  confirmationCode: string;
  vehicleName:      string;
  vehicleBrand:     string;
  vehicleSlot:      string;
  startDate:        Date;
  endDate:          Date;
  totalDays:        number;
  totalPrice:       number;
  pricePerDay:      number;
}

function buildEmailHTML(d: ConfirmationEmailData): string {
  const start   = format(d.startDate, "dd 'de' MMMM yyyy", { locale: es });
  const end     = format(d.endDate,   "dd 'de' MMMM yyyy", { locale: es });
  const viewUrl = `${APP_URL}/reserva/${d.confirmationCode}`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Reserva Confirmada · APEX Rentals</title>
</head>
<body style="margin:0;padding:0;background:#080c10;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#E8E8F0;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#080c10;padding:40px 20px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

  <!-- Header -->
  <tr>
    <td style="background:#0c1117;border-radius:12px 12px 0 0;border:1px solid rgba(255,255,255,0.07);border-bottom:none;padding:32px 36px 28px;">
      <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6B7280;margin-bottom:8px;">APEX RENTALS</div>
      <div style="font-size:28px;font-weight:900;letter-spacing:1px;color:#F59E0B;line-height:1;">
        ¡Reserva Confirmada!
      </div>
      <div style="font-size:14px;color:#6B7280;margin-top:6px;">Hola ${d.customerName}, tu vehículo está apartado.</div>
    </td>
  </tr>

  <!-- Confirmation code -->
  <tr>
    <td style="background:linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.06));border-left:1px solid rgba(255,255,255,0.07);border-right:1px solid rgba(255,255,255,0.07);padding:28px 36px;">
      <div style="text-align:center;">
        <div style="font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#6B7280;margin-bottom:10px;">Código de confirmación</div>
        <div style="font-size:32px;font-weight:900;letter-spacing:8px;color:#F59E0B;font-family:monospace;">${d.confirmationCode}</div>
        <div style="font-size:12px;color:#4B5563;margin-top:8px;">Presenta este código al recoger el vehículo</div>
      </div>
    </td>
  </tr>

  <!-- Vehicle info -->
  <tr>
    <td style="background:#0c1117;border-left:1px solid rgba(255,255,255,0.07);border-right:1px solid rgba(255,255,255,0.07);padding:24px 36px;">
      <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B7280;margin-bottom:12px;">Vehículo reservado</div>
      <div style="font-size:20px;font-weight:700;color:#E8E8F0;">${d.vehicleName}</div>
      <div style="font-size:13px;color:#6B7280;margin-top:3px;">${d.vehicleBrand} · Slot ${d.vehicleSlot}</div>
    </td>
  </tr>

  <!-- Divider -->
  <tr>
    <td style="background:#0c1117;border-left:1px solid rgba(255,255,255,0.07);border-right:1px solid rgba(255,255,255,0.07);padding:0 36px;">
      <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
    </td>
  </tr>

  <!-- Dates & price -->
  <tr>
    <td style="background:#0c1117;border-left:1px solid rgba(255,255,255,0.07);border-right:1px solid rgba(255,255,255,0.07);padding:24px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px;">
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B7280;margin-bottom:4px;">Desde</div>
            <div style="font-size:15px;color:#E8E8F0;font-weight:500;">${start}</div>
          </td>
          <td style="padding-bottom:12px;">
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B7280;margin-bottom:4px;">Hasta</div>
            <div style="font-size:15px;color:#E8E8F0;font-weight:500;">${end}</div>
          </td>
        </tr>
        <tr>
          <td>
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B7280;margin-bottom:4px;">Duración</div>
            <div style="font-size:15px;color:#E8E8F0;">${d.totalDays} ${d.totalDays === 1 ? "día" : "días"} × $${d.pricePerDay}/día</div>
          </td>
          <td>
            <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#6B7280;margin-bottom:4px;">Total</div>
            <div style="font-size:22px;font-weight:900;color:#F59E0B;">$${d.totalPrice.toLocaleString()}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- CTA -->
  <tr>
    <td style="background:#0c1117;border-left:1px solid rgba(255,255,255,0.07);border-right:1px solid rgba(255,255,255,0.07);padding:24px 36px;">
      <div style="height:1px;background:rgba(255,255,255,0.06);margin-bottom:24px;"></div>
      <div style="text-align:center;">
        <a href="${viewUrl}" style="display:inline-block;background:#F59E0B;color:#000;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:2px;text-transform:uppercase;padding:14px 32px;border-radius:6px;">
          VER MI RESERVA
        </a>
        <div style="font-size:12px;color:#4B5563;margin-top:10px;">O copia este link: ${viewUrl}</div>
      </div>
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#080c10;border:1px solid rgba(255,255,255,0.07);border-top:none;border-radius:0 0 12px 12px;padding:20px 36px;text-align:center;">
      <div style="font-size:12px;color:#374151;line-height:1.7;">
        APEX Rentals · Tu showroom de alquiler de vehículos<br>
        Este email fue enviado porque realizaste una reserva en nuestro sistema.
      </div>
    </td>
  </tr>

</table>
</td></tr>
</table>

</body>
</html>`;
}

export async function sendConfirmationEmail(data: ConfirmationEmailData): Promise<{ ok: boolean; error?: string }> {
  // If no API key configured, skip silently in dev
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx") {
    console.warn("[email] RESEND_API_KEY not set — skipping email send");
    return { ok: true };
  }

  try {
    const { error } = await resend.emails.send({
      from:    FROM,
      to:      [data.to],
      subject: `✅ Reserva confirmada · ${data.confirmationCode} · ${data.vehicleName}`,
      html:    buildEmailHTML(data),
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Send failed:", msg);
    return { ok: false, error: msg };
  }
}
