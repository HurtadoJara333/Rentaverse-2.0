// src/types/vehicle.ts

export type VehicleCategory =
  | "Sedán"
  | "SUV"
  | "Sport"
  | "Lujo"
  | "Eléctrico"
  | "SUV Lujo"
  | "Gran Turismo"
  | "Pickup 4x4";

export interface ParkingSlot {
  /** World-space position [x, y, z] */
  position: [number, number, number];
  /** Y-axis rotation in radians */
  rotation: number;
  /** Label shown on the floor, e.g. "L-19" */
  label: string;
}

export interface Vehicle {
  id: string;
  slot: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  category: VehicleCategory;
  pricePerDay: number;
  available: boolean;
  /** Hex accent color for UI & glow ring */
  accentColor: string;
  /** Path to the GLB model relative to /public */
  modelPath: string;
  /** Paint color as hex number for fallback procedural car */
  paintColor: number;
  paintMetalness: number;
  paintRoughness: number;
  features: string[];
  description: string;
  parkingSlot: ParkingSlot;
}

export interface Business {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  brandColor: string;
  accentColor: string;
  vehicles: Vehicle[];
}
