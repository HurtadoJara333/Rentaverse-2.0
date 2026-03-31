// src/stores/showroomStore.ts
import { create } from "zustand";
import type { Vehicle } from "@/types/vehicle";

type View = "landing" | "showroom";

interface ShowroomState {
  view:            View;
  selectedVehicle: Vehicle | null;
  hoveredVehicle:  Vehicle | null;
  // Real-time fleet availability from API (vehicleId → available)
  fleetStatus:     Record<string, boolean>;

  setView:         (v: View) => void;
  selectVehicle:   (v: Vehicle | null) => void;
  hoverVehicle:    (v: Vehicle | null) => void;
  setFleetStatus:  (status: Record<string, boolean>) => void;
  // Derived — returns real-time availability for a vehicle
  isAvailable:     (vehicleId: string, staticAvailable: boolean) => boolean;
}

export const useShowroomStore = create<ShowroomState>((set, get) => ({
  view:            "landing",
  selectedVehicle: null,
  hoveredVehicle:  null,
  fleetStatus:     {},

  setView:          (view)          => set({ view }),
  selectVehicle:    (selectedVehicle) => set({ selectedVehicle }),
  hoverVehicle:     (hoveredVehicle)  => set({ hoveredVehicle }),
  setFleetStatus:   (fleetStatus)     => set({ fleetStatus }),

  isAvailable: (vehicleId, staticAvailable) => {
    const { fleetStatus } = get();
    return vehicleId in fleetStatus ? fleetStatus[vehicleId] : staticAvailable;
  },
}));
