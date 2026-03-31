// src/lib/validations.ts
import { z } from "zod";

export const reservationSchema = z.object({
  vehicleId:    z.string().min(1, "vehicleId requerido"),
  businessId:   z.string().min(1).default("apex"),

  // Accept ISO strings in any format — we coerce to Date on the server
  startDate: z.string().min(1, "startDate requerido"),
  endDate:   z.string().min(1, "endDate requerido"),

  customerName:  z.string().min(2, "Nombre muy corto").max(80),
  customerEmail: z.string().email("Email inválido"),
  customerPhone: z.string().min(7, "Teléfono inválido").max(20),
  customerIdDoc: z.string().min(5, "Documento inválido").max(20),
}).refine(
  (d) => new Date(d.endDate) > new Date(d.startDate),
  { message: "La fecha de fin debe ser posterior a la de inicio", path: ["endDate"] }
);

export type ReservationInput = z.infer<typeof reservationSchema>;

export const availabilitySchema = z.object({
  vehicleId: z.string().min(1),
  startDate: z.string().min(1),
  endDate:   z.string().min(1),
});
