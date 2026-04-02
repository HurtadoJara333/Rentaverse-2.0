// src/components/panorama/usePanoramaEditor.ts
"use client"
import { useState, useCallback, useRef } from "react"
import * as THREE from "three"
import type { CarPlacement } from "@/lib/panoramaData"
import { APEX_VEHICLES } from "@/lib/data"

export interface EditorState {
  isActive:     boolean
  placements:   CarPlacement[]
  selectedId:   string | null   // vehicle being positioned
  isDirty:      boolean         // unsaved changes
  isSaving:     boolean
}

export function usePanoramaEditor(initialPlacements: CarPlacement[]) {
  const [state, setState] = useState<EditorState>({
    isActive:   false,
    placements: initialPlacements,
    selectedId: null,
    isDirty:    false,
    isSaving:   false,
  })

  const dragRef = useRef<{ id: string; active: boolean }>({ id: "", active: false })

  // Toggle editor mode
  const toggleEditor = useCallback(() => {
    setState((s) => ({ ...s, isActive: !s.isActive, selectedId: null }))
  }, [])

  // Select which vehicle to place next
  const selectVehicle = useCallback((id: string | null) => {
    setState((s) => ({ ...s, selectedId: id }))
  }, [])

  // Handle click on the panorama floor plane → place selected vehicle
  const handleFloorClick = useCallback((
    point: THREE.Vector3,
    floorY: number,
  ) => {
    setState((s) => {
      if (!s.isActive || !s.selectedId) return s

      // Convert XZ position → yaw + distance
      const dx = point.x
      const dz = point.z
      const distance = Math.sqrt(dx * dx + dz * dz)
      const yaw = ((Math.atan2(dx, dz) * 180) / Math.PI + 360) % 360

      const existing = s.placements.findIndex((p) => p.vehicleId === s.selectedId)
      const newPlacement: CarPlacement = {
        vehicleId: s.selectedId,
        yaw,
        distance: Math.min(Math.max(distance, 1), 15),
        rotation: 0,
        elevation: 0,
      }

      let placements: CarPlacement[]
      if (existing >= 0) {
        placements = s.placements.map((p, i) => i === existing ? newPlacement : p)
      } else {
        placements = [...s.placements, newPlacement]
      }

      return { ...s, placements, isDirty: true }
    })
  }, [])

  // Rotate a placed vehicle (called from scroll wheel over vehicle)
  const rotateVehicle = useCallback((vehicleId: string, delta: number) => {
    setState((s) => ({
      ...s,
      isDirty: true,
      placements: s.placements.map((p) =>
        p.vehicleId === vehicleId
          ? { ...p, rotation: (p.rotation + delta + 360) % 360 }
          : p
      ),
    }))
  }, [])

  // Adjust floor Y for a vehicle (elevation tweak)
  const adjustElevation = useCallback((vehicleId: string, delta: number) => {
    setState((s) => ({
      ...s,
      isDirty: true,
      placements: s.placements.map((p) =>
        p.vehicleId === vehicleId
          ? { ...p, elevation: Math.round((p.elevation + delta) * 100) / 100 }
          : p
      ),
    }))
  }, [])

  // Remove a placement
  const removePlacement = useCallback((vehicleId: string) => {
    setState((s) => ({
      ...s,
      isDirty: true,
      placements: s.placements.filter((p) => p.vehicleId !== vehicleId),
    }))
  }, [])

  // Save to API
  const save = useCallback(async (panoramaUrl: string, floorY: number) => {
    setState((s) => ({ ...s, isSaving: true }))
    try {
      const res = await fetch("/api/showroom/placements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placements: state.placements, panoramaUrl, floorY }),
      })
      if (!res.ok) throw new Error("Save failed")
      setState((s) => ({ ...s, isDirty: false, isSaving: false }))
      return true
    } catch {
      setState((s) => ({ ...s, isSaving: false }))
      return false
    }
  }, [state.placements])

  // Get placed vehicles with their vehicle data
  const placedVehicles = state.placements.map((p) => ({
    placement: p,
    vehicle:   APEX_VEHICLES.find((v) => v.id === p.vehicleId),
  })).filter((x) => x.vehicle != null) as Array<{
    placement: CarPlacement
    vehicle:   (typeof APEX_VEHICLES)[0]
  }>

  // Unplaced vehicles
  const unplacedVehicles = APEX_VEHICLES.filter(
    (v) => !state.placements.find((p) => p.vehicleId === v.id)
  )

  return {
    ...state,
    placedVehicles,
    unplacedVehicles,
    toggleEditor,
    selectVehicle,
    handleFloorClick,
    rotateVehicle,
    adjustElevation,
    removePlacement,
    save,
    dragRef,
  }
}
