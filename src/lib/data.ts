// src/lib/data.ts
import type { Business, Vehicle } from "@/types/vehicle";

export const APEX_VEHICLES: Vehicle[] = [
  {
    id: "v1",
    slot: "L-19",
    name: "Mazda CX-5 Grand Touring",
    brand: "Mazda",
    model: "CX-5",
    year: 2020,
    category: "SUV",
    pricePerDay: 110,
    available: true,
    accentColor: "#EF4444",
    modelPath: "/models/mazda_cx-5_2020/scene.gltf",
    paintColor: 0x1a0a0a,
    paintMetalness: 0.92,
    paintRoughness: 0.08,
    features: ["187 HP", "AWD i-ACTIV", "5 pasajeros", "Bose Audio", "Heads-Up Display"],
    description: "El SUV más premiado de Mazda. Diseño KODO, tecnología Skyactiv y experiencia de conducción sin igual.",
    parkingSlot: { position: [-16, 0, -7], rotation: Math.PI / 2, label: "L-19" },
  },
  {
    id: "v2",
    slot: "L-21",
    name: "Mazda 3 Hatchback Sport",
    brand: "Mazda",
    model: "Mazda 3 Hatchback",
    year: 2020,
    category: "Sport",
    pricePerDay: 85,
    available: true,
    accentColor: "#F59E0B",
    modelPath: "/models/2020_mazda_3_hatchback (1)/scene.gltf",
    paintColor: 0x0a0a1a,
    paintMetalness: 0.95,
    paintRoughness: 0.06,
    features: ["155 HP", "FWD", "5 pasajeros", "Mi-Drive", "360° View"],
    description: "El hatchback más deportivo del segmento. Diseño artístico premiado y experiencia de conducción excepcional.",
    parkingSlot: { position: [-10, 0, -7], rotation: Math.PI / 2, label: "L-21" },
  },
  {
    id: "v3",
    slot: "L-23",
    name: "Kia Sportage GT-Line",
    brand: "Kia",
    model: "Sportage",
    year: 2024,
    category: "SUV",
    pricePerDay: 95,
    available: false,
    accentColor: "#3B82F6",
    modelPath: "/models/kia_sportage/scene.gltf",
    paintColor: 0x0a1428,
    paintMetalness: 0.90,
    paintRoughness: 0.10,
    features: ["187 HP", "AWD", "5 pasajeros", "GT-Line Package", "Wireless Charging"],
    description: "SUV premium con diseño deportivo GT-Line. Potente motor turbo y equipamiento de alta gama.",
    parkingSlot: { position: [-4, 0, -7], rotation: Math.PI / 2, label: "L-23" },
  },
  {
    id: "v4",
    slot: "L-25",
    name: "Chevrolet Spark LS",
    brand: "Chevrolet",
    model: "Spark",
    year: 2024,
    category: "Sport",
    pricePerDay: 65,
    available: true,
    accentColor: "#EF4444",
    modelPath: "/models/chevrolet_spark/scene.gltf",
    paintColor: 0x080808,
    paintMetalness: 0.96,
    paintRoughness: 0.05,
    features: ["98 HP", "5-Speed MT", "5 pasajeros", "LS Package", "MyLink"],
    description: "El hatchback urbano más eficiente. Diseño moderno, excelente economía de combustible y equipamiento completo.",
    parkingSlot: { position: [2, 0, -7], rotation: Math.PI / 2, label: "L-25" },
  },
  {
    id: "v5",
    slot: "L-27",
    name: "Toyota Prado TX-L",
    brand: "Toyota",
    model: "Prado",
    year: 2025,
    category: "SUV",
    pricePerDay: 98,
    available: true,
    accentColor: "#22C55E",
    modelPath: "/models/toyota_prado_2025/scene.gltf",
    paintColor: 0x0d1a0a,
    paintMetalness: 0.88,
    paintRoughness: 0.12,
    features: ["275 HP", "4x4 Full-Time", "7 pasajeros", "TX-L Package", "Multi-Terrain Select"],
    description: "La leyenda SUV de Toyota. Tracción 4x4 permanente y capacidad todoterreno excepcional.",
    parkingSlot: { position: [8, 0, -7], rotation: Math.PI / 2, label: "L-27" },
  },
];

export const APEX_BUSINESS: Business = {
  id: "apex",
  slug: "apex",
  name: "APEX RENTALS",
  tagline: "Drive the Extraordinary",
  brandColor: "#F59E0B",
  accentColor: "#EF4444",
  vehicles: APEX_VEHICLES,
};

// ── Dynamic availability helper ───────────────────────────────────────────────
// Fetches real-time availability from the API (merges admin overrides)
export async function fetchFleetStatus(): Promise<Record<string, boolean>> {
  try {
    const res  = await fetch("/api/admin/fleet-status", { cache: "no-store" });
    const data = await res.json();
    const map: Record<string, boolean> = {};
    for (const v of data.fleet ?? []) map[v.id] = v.available;
    return map;
  } catch {
    // Fallback to static data
    return Object.fromEntries(APEX_VEHICLES.map((v) => [v.id, v.available]));
  }
}
