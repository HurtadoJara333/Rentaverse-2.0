// src/lib/panoramaData.ts
// Configuración del showroom panorámico

export interface CarPlacement {
  vehicleId: string
  /** Ángulo horizontal en el panorama — 0 = frente, 90 = derecha, 180 = atrás, 270 = izquierda */
  yaw: number
  /** Distancia virtual desde el centro de la escena (metros) */
  distance: number
  /** Rotación del carro sobre su eje Y (0–360°) */
  rotation: number
  /** Ajuste fino de elevación — 0 = piso */
  elevation: number
}

export interface PanoramaShowroom {
  id: string
  name: string
  /** Path relativo a /public */
  panoramaUrl: string
  /** Altura del piso virtual (ajuste si los carros flotan o se hunden) */
  floorY: number
  placements: CarPlacement[]
}

// Convierte yaw + distance → posición XYZ en el espacio 3D
export function placementToPosition(
  yaw: number,
  distance: number,
  elevation: number = 0,
  floorY: number = 0
): [number, number, number] {
  const rad = (yaw * Math.PI) / 180
  const x = Math.sin(rad) * distance
  const z = Math.cos(rad) * distance
  const y = floorY + elevation
  return [x, y, z]
}

// Configuración por defecto del showroom
// Estos placements se guardan en MongoDB en producción
// y se cargan vía /api/showroom/placements
export const DEFAULT_SHOWROOM: PanoramaShowroom = {
  id: "apex-main",
  name: "APEX RENTALS — Planta Principal",
  panoramaUrl: "/panoramas/parking_garage_4k.exr",
  floorY: -1.2,
  placements: [
    { vehicleId: "v1", yaw: 30,  distance: 5, rotation: -30,  elevation: 0 },
    { vehicleId: "v2", yaw: 100, distance: 6, rotation: 90,   elevation: 0 },
    { vehicleId: "v3", yaw: 180, distance: 5, rotation: 180,  elevation: 0 },
    { vehicleId: "v4", yaw: 250, distance: 6, rotation: 270,  elevation: 0 },
    { vehicleId: "v5", yaw: 320, distance: 5, rotation: -60,  elevation: 0 },
  ],
}
