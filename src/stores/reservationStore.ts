// src/stores/reservationStore.ts
import { create } from "zustand";
import type { Vehicle } from "@/types/vehicle";

export type ReservationStep = "dates" | "form" | "confirming" | "success" | "error";

export interface ReservationDates {
  startDate: Date | null;
  endDate:   Date | null;
}

export interface ConfirmedReservation {
  id:               string;
  confirmationCode: string;
  vehicleName:      string;
  vehicleSlot:      string;
  startDate:        string;
  endDate:          string;
  totalDays:        number;
  totalPrice:       number;
  customerName:     string;
  customerEmail:    string;
  status:           string;
}

interface ReservationState {
  // Modal
  isOpen:  boolean;
  vehicle: Vehicle | null;
  step:    ReservationStep;

  // Date selection
  dates:       ReservationDates;
  totalDays:   number;
  totalPrice:  number;
  isAvailable: boolean | null;  // null = not checked yet

  // Booked ranges for calendar (from API)
  bookedRanges: { startDate: Date; endDate: Date }[];

  // Result
  confirmed: ConfirmedReservation | null;
  errorMsg:  string | null;

  // Actions
  openModal:        (vehicle: Vehicle) => void;
  closeModal:       () => void;
  setDates:         (dates: ReservationDates) => void;
  setAvailable:     (val: boolean) => void;
  setBookedRanges:  (ranges: { startDate: Date; endDate: Date }[]) => void;
  setStep:          (step: ReservationStep) => void;
  setConfirmed:     (r: ConfirmedReservation) => void;
  setError:         (msg: string) => void;
  reset:            () => void;
}

const initialState = {
  isOpen:      false,
  vehicle:     null,
  step:        "dates" as ReservationStep,
  dates:       { startDate: null, endDate: null },
  totalDays:   0,
  totalPrice:  0,
  isAvailable: null,
  bookedRanges:[],
  confirmed:   null,
  errorMsg:    null,
};

export const useReservationStore = create<ReservationState>((set, get) => ({
  ...initialState,

  openModal: (vehicle) =>
    set({ ...initialState, isOpen: true, vehicle }),

  closeModal: () => set({ isOpen: false }),

  setDates: ({ startDate, endDate }) => {
    const vehicle = get().vehicle;
    let totalDays = 0;
    let totalPrice = 0;
    if (startDate && endDate && vehicle) {
      const ms = endDate.getTime() - startDate.getTime();
      totalDays  = Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
      totalPrice = totalDays * vehicle.pricePerDay;
    }
    set({ dates: { startDate, endDate }, totalDays, totalPrice, isAvailable: null });
  },

  setAvailable:    (isAvailable) => set({ isAvailable }),
  setBookedRanges: (bookedRanges) => set({ bookedRanges }),
  setStep:         (step) => set({ step }),
  setConfirmed:    (confirmed) => set({ confirmed, step: "success" }),
  setError:        (errorMsg) => set({ errorMsg, step: "error" }),
  reset:           () => set(initialState),
}));
