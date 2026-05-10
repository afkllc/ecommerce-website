"use client"

import { useFrame } from "@react-three/fiber"
import * as React from "react"

type PencilModelProps = {
  pointerFine: boolean
}

function damp(current: number, target: number, lambda: number, delta: number) {
  return target + (current - target) * Math.exp(-lambda * delta)
}

export function PencilModel({ pointerFine }: PencilModelProps) {
  const groupRef = React.useRef<React.ElementRef<"group">>(null)

  useFrame((state, delta) => {
    const group = groupRef.current

    if (!group) {
      return
    }

    const pointerX = pointerFine ? state.pointer.x * 0.16 : 0
    const pointerY = pointerFine ? state.pointer.y * 0.08 : 0
    const idle = state.clock.elapsedTime * 0.18

    group.rotation.x = damp(
      group.rotation.x,
      0.18 + pointerY,
      4,
      delta
    )
    group.rotation.y = damp(
      group.rotation.y,
      -0.45 + pointerX + Math.sin(idle) * 0.08,
      4,
      delta
    )
    group.rotation.z = damp(group.rotation.z, -0.22, 4, delta)
  })

  return (
    <group ref={groupRef} scale={1.16} position={[0.1, -0.08, 0]}>
      <mesh
        castShadow
        receiveShadow
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.34, 0.34, 4.25, 6]} />
        <meshStandardMaterial
          args={[{ color: "#a6622d", metalness: 0.08, roughness: 0.42 }]}
        />
      </mesh>
      <mesh
        castShadow
        position={[-2.28, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.36, 0.36, 0.34, 24]} />
        <meshStandardMaterial
          args={[{ color: "#c79b53", metalness: 0.7, roughness: 0.28 }]}
        />
      </mesh>
      <mesh
        castShadow
        position={[-2.62, 0, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.32, 0.32, 0.36, 24]} />
        <meshStandardMaterial
          args={[{ color: "#5b3329", metalness: 0.02, roughness: 0.72 }]}
        />
      </mesh>
      <mesh
        castShadow
        position={[2.44, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[0.36, 0.78, 6]} />
        <meshStandardMaterial
          args={[{ color: "#d8b27a", metalness: 0.02, roughness: 0.58 }]}
        />
      </mesh>
      <mesh
        castShadow
        position={[2.93, 0, 0]}
        rotation={[0, 0, -Math.PI / 2]}
      >
        <coneGeometry args={[0.15, 0.34, 6]} />
        <meshStandardMaterial
          args={[{ color: "#17130f", metalness: 0.22, roughness: 0.5 }]}
        />
      </mesh>
    </group>
  )
}
