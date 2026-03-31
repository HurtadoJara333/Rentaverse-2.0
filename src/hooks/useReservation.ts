// src/hooks/useReservation.ts
"use client";
import { useCallback } from "react";
import { useReservationStore } from "@/stores/reservationStore";
import type { ReservationDates } from "@/stores/reservationStore";

export function useReservation() {
  const store = useReservationStore();

  // Check availability when dates change
  const checkAvailability = useCallback(async (dates: ReservationDates) => {
    const { vehicle } = store;
    if (!vehicle || !dates.startDate || !dates.endDate) return;

    store.setDates(dates);

    try {
      const params = new URLSearchParams({
        vehicleId: vehicle.id,
        startDate: dates.startDate.toISOString(),
        endDate:   dates.endDate.toISOString(),
      });
      const res  = await fetch(`/api/reservations/availability?${params}`);
      const data = await res.json();
      store.setAvailable(data.available);
      if (data.bookedRanges) {
        store.setBookedRanges(
          data.bookedRanges.map((r: { startDate: string; endDate: string }) => ({
            startDate: new Date(r.startDate),
            endDate:   new Date(r.endDate),
          }))
        );
      }
    } catch {
      store.setAvailable(false);
    }
  }, [store]);

  // Submit the full reservation
  const submitReservation = useCallback(async (formData: {
    customerName:  string;
    customerEmail: string;
    customerPhone: string;
    customerIdDoc: string;
  }) => {
    const { vehicle, dates } = store;
    if (!vehicle || !dates.startDate || !dates.endDate) return;

    store.setStep("confirming");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId:  vehicle.id,
          businessId: "apex",
          startDate:  dates.startDate.toISOString(),
          endDate:    dates.endDate.toISOString(),
          ...formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        store.setError(data.error ?? "Error al crear la reserva");
        return;
      }

      store.setConfirmed(data.reservation);
    } catch {
      store.setError("Error de conexión. Por favor intenta de nuevo.");
    }
  }, [store]);

  return { ...store, checkAvailability, submitReservation };
}
