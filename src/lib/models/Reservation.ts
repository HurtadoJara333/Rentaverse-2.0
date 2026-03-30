// src/lib/models/Reservation.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface IReservation extends Document {
  vehicleId:        string;
  vehicleName:      string;
  vehicleBrand:     string;
  vehicleModel:     string;
  vehicleSlot:      string;
  pricePerDay:      number;
  startDate:        Date;
  endDate:          Date;
  totalDays:        number;
  totalPrice:       number;
  customerName:     string;
  customerEmail:    string;
  customerPhone:    string;
  customerIdDoc:    string;
  status:           ReservationStatus;
  confirmationCode: string;
  businessId:       string;
  createdAt:        Date;
  updatedAt:        Date;
}

// ── Code generator ────────────────────────────────────────────────────────────
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from(
    { length: 8 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
  return `APX-${suffix}`;
}

// ── Schema ────────────────────────────────────────────────────────────────────
const ReservationSchema = new Schema<IReservation>(
  {
    vehicleId:    { type: String, required: true, index: true },
    vehicleName:  { type: String, required: true },
    vehicleBrand: { type: String, required: true },
    vehicleModel: { type: String, required: true },
    vehicleSlot:  { type: String, required: true },
    pricePerDay:  { type: Number, required: true },

    startDate:  { type: Date,   required: true, index: true },
    endDate:    { type: Date,   required: true, index: true },
    totalDays:  { type: Number, required: true, min: 1 },
    totalPrice: { type: Number, required: true },

    customerName:  { type: String, required: true, trim: true },
    customerEmail: { type: String, required: true, trim: true, lowercase: true },
    customerPhone: { type: String, required: true, trim: true },
    customerIdDoc: { type: String, required: true, trim: true },

    status: {
      type:    String,
      enum:    ["pending", "confirmed", "cancelled"],
      default: "confirmed",
    },

    // FIX: use `default` instead of pre("save") hook.
    // Mongoose validates `required` fields BEFORE pre("save") runs,
    // so required: true + pre("save") assignment always caused a validation
    // error on Reservation.create(). Using a schema default bypasses this
    // because defaults are applied before validation.
    confirmationCode: {
      type:    String,
      unique:  true,
      default: generateCode,   // ← called once per document at creation time
    },

    businessId: { type: String, required: true, default: "apex", index: true },
  },
  { timestamps: true }
);

// Compound index for availability checks
ReservationSchema.index(
  { vehicleId: 1, startDate: 1, endDate: 1, status: 1 },
  { name: "availability_check" }
);

// ── Model (singleton-safe for Next.js hot-reload) ─────────────────────────────
const Reservation: Model<IReservation> =
  (mongoose.models.Reservation as Model<IReservation>) ??
  mongoose.model<IReservation>("Reservation", ReservationSchema);

export default Reservation;
