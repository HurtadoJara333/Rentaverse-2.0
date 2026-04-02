// src/components/panorama/PanoramaSphere.tsx
"use client"
import { useEffect } from "react"
import { useLoader, useThree } from "@react-three/fiber"
import * as THREE from "three"
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js"

interface Props {
  url: string
  radius?: number
}

export default function PanoramaSphere({ url, radius = 100 }: Props) {
  const isExr = url.toLowerCase().endsWith(".exr")
  const texture = useLoader(isExr ? EXRLoader : THREE.TextureLoader, url)
  const { scene } = useThree()

  useEffect(() => {
    scene.background = texture
    scene.environment = texture
    return () => {
      scene.background = null
      scene.environment = null
    }
  }, [scene, texture])

  if (!isExr) {
    texture.colorSpace = THREE.SRGBColorSpace
  }
  texture.mapping = THREE.EquirectangularReflectionMapping

  return (
    <mesh className="panorama-sphere" scale={[-1, 1, 1]}>
      {/* High segment count for smooth panorama */}
      <sphereGeometry args={[radius, 128, 64]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.BackSide}
        // No lighting — panorama is self-lit
        toneMapped={false}
      />
    </mesh>
  )
}
