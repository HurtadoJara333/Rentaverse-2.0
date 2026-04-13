// src/components/panorama/usePanoramaEditor.ts
"use client"
import { useState, useCallback, useEffect } from "react"
import * as THREE from "three"
import type { CarPlacement } from "@/lib/panoramaData"
import { APEX_VEHICLES } from "@/lib/data"

export type EditorStep = "select" | "place" | "fine"

export interface EditorState {
  isActive:   boolean
  placements: CarPlacement[]
  selectedId: string | null
  activeStep: EditorStep
  isDirty:    boolean
  isSaving:   boolean
}

export function usePanoramaEditor(initialPlacements: CarPlacement[]) {
  const [state, setState] = useState<EditorState>({
    isActive:   false,
    placements: initialPlacements,
    selectedId: null,
    activeStep: "select",
    isDirty:    false,
    isSaving:   false,
  })

  // KEY FIX: if initialPlacements changes (API loaded after mount), sync them in
  // but only when editor is not active (don't overwrite mid-edit)
  useEffect(() => {
    setState((s) => {
      if (s.isActive || s.isDirty) return s   // don't overwrite mid-edit
      return { ...s, placements: initialPlacements }
    })
  }, [initialPlacements])

  const toggleEditor = useCallback(() => {
    setState((s) => ({
      ...s,
      isActive:   !s.isActive,
      selectedId: null,
      activeStep: "select",
    }))
  }, [])

  const selectVehicle = useCallback((id: string | null) => {
    setState((s) => {
      if (!id) return { ...s, selectedId: null, activeStep: "select" }
      const alreadyPlaced = s.placements.some((p) => p.vehicleId === id)
      return { ...s, selectedId: id, activeStep: alreadyPlaced ? "fine" : "place" }
    })
  }, [])

  const handleFloorClick = useCallback((point: THREE.Vector3, floorY: number) => {
    setState((s) => {
      if (!s.isActive || !s.selectedId) return s
      const dx       = point.x
      const dz       = point.z
      const distance = Math.min(Math.max(Math.sqrt(dx * dx + dz * dz), 1), 15)
      const yaw      = ((Math.atan2(dx, dz) * 180) / Math.PI + 360) % 360
      const existing = s.placements.findIndex((p) => p.vehicleId === s.selectedId)
      const prev     = existing >= 0 ? s.placements[existing] : null
      const newP: CarPlacement = {
        vehicleId: s.selectedId!,
        yaw,
        distance,
        rotation:  prev?.rotation  ?? 0,
        elevation: prev?.elevation ?? 0,
        scale:     prev?.scale     ?? 1,
      }
      const placements =
        existing >= 0
          ? s.placements.map((p, i) => (i === existing ? newP : p))
          : [...s.placements, newP]
      return { ...s, placements, isDirty: true, activeStep: "fine" }
    })
  }, [])

  const moveVehicle = useCallback((vehicleId: string, dir: "left" | "right" | "forward" | "backward") => {
    setState((s) => ({
      ...s,
      isDirty: true,
      placements: s.placements.map((p) => {
        if (p.vehicleId !== vehicleId) return p
        switch (dir) {
          case "left":     return { ...p, yaw:      (p.yaw - 5 + 360) % 360 }
          case "right":    return { ...p, yaw:      (p.yaw + 5 + 360) % 360 }
          case "forward":  return { ...p, distance: Math.max(0.5, p.distance - 0.25) }
          case "backward": return { ...p, distance: Math.min(15,  p.distance + 0.25) }
        }
      }),
    }))
  }, [])

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


  const adjustScale = useCallback((vehicleId: string, delta: number) => {
    setState((s) => ({
      ...s,
      isDirty: true,
      placements: s.placements.map((p) =>
        p.vehicleId === vehicleId
          ? { ...p, scale: Math.round(Math.max(0.1, Math.min(5, (p.scale ?? 1) + delta)) * 100) / 100 }
          : p
      ),
    }))
  }, [])

  const removePlacement = useCallback((vehicleId: string) => {
    setState((s) => ({
      ...s,
      isDirty:    true,
      selectedId: s.selectedId === vehicleId ? null : s.selectedId,
      activeStep: s.selectedId === vehicleId ? "select" : s.activeStep,
      placements: s.placements.filter((p) => p.vehicleId !== vehicleId),
    }))
  }, [])

  // KEY FIX: use setState functional form to read CURRENT placements — avoids stale closure
  const save = useCallback((panoramaUrl: string, floorY: number) => {
    setState((s) => {
      if (s.isSaving) return s
      const currentPlacements = s.placements  // captured from current state, not closure
      ;(async () => {
        try {
          const res = await fetch("/api/showroom/placements", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ placements: currentPlacements, panoramaUrl, floorY }),
          })
          if (!res.ok) throw new Error(`Save failed: ${res.status}`)
          setState((prev) => ({ ...prev, isDirty: false, isSaving: false }))
          console.log("✅ Placements saved:", currentPlacements.length, "vehicles")
        } catch (err) {
          console.error("❌ Save error:", err)
          setState((prev) => ({ ...prev, isSaving: false }))
          alert("Error al guardar. Revisa la conexión a la base de datos.")
        }
      })()
      return { ...s, isSaving: true }
    })
  }, [])

  const placedVehicles = state.placements
    .map((p) => ({ placement: p, vehicle: APEX_VEHICLES.find((v) => v.id === p.vehicleId) }))
    .filter((x): x is { placement: CarPlacement; vehicle: typeof APEX_VEHICLES[0] } => x.vehicle != null)

  const unplacedVehicles = APEX_VEHICLES.filter(
    (v) => !state.placements.some((p) => p.vehicleId === v.id)
  )

  return {
    ...state,
    placedVehicles,
    unplacedVehicles,
    toggleEditor,
    selectVehicle,
    handleFloorClick,
    moveVehicle,
    rotateVehicle,
    adjustElevation,
    removePlacement,
    adjustScale,
    save,
  }
}