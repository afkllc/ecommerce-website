"use client"

import { Canvas } from "@react-three/fiber"
import * as React from "react"

import { HeroFallback } from "@/components/storefront/hero/hero-fallback"
import { PencilModel } from "@/components/storefront/hero/pencil-model"

type PencilSceneProps = {
  pointerFine: boolean
}

export function PencilScene({ pointerFine }: PencilSceneProps) {
  const [ready, setReady] = React.useState(false)

  return (
    <div
      aria-label="Animated luxury pencil product preview"
      className="absolute inset-0"
      role="img"
    >
      <HeroFallback />
      <Canvas
        camera={{ position: [0, 0.2, 5.4], fov: 38 }}
        className={
          ready ? "opacity-100 transition-opacity duration-700" : "opacity-0"
        }
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
        onCreated={() => setReady(true)}
        shadows
      >
        <ambientLight intensity={0.82} />
        <directionalLight
          castShadow
          intensity={2.15}
          position={[3.2, 3.6, 4.4]}
        />
        <pointLight color="#f5c778" intensity={5.4} position={[-2.4, 1.4, 2.5]} />
        <PencilModel pointerFine={pointerFine} />
        <mesh
          receiveShadow
          position={[0, -0.8, -0.35]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[7.5, 3.5]} />
          <shadowMaterial args={[{ opacity: 0.22 }]} />
        </mesh>
      </Canvas>
    </div>
  )
}
