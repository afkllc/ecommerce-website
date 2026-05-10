"use client"

import dynamic from "next/dynamic"
import * as React from "react"

import { HeroFallback } from "@/components/storefront/hero/hero-fallback"

const DynamicPencilScene = dynamic(
  () =>
    import("@/components/storefront/hero/pencil-scene").then(
      (mod) => mod.PencilScene
    ),
  {
    ssr: false,
    loading: () => <HeroFallback />,
  }
)

type SceneErrorBoundaryProps = {
  children: React.ReactNode
  fallback: React.ReactNode
}

type SceneErrorBoundaryState = {
  hasError: boolean
}

class SceneErrorBoundary extends React.Component<
  SceneErrorBoundaryProps,
  SceneErrorBoundaryState
> {
  state: SceneErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): SceneErrorBoundaryState {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

export function PencilSceneLoader() {
  const [canRenderCanvas, setCanRenderCanvas] = React.useState(false)
  const [pointerFine, setPointerFine] = React.useState(false)

  React.useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    )
    const pointerQuery = window.matchMedia("(pointer: fine)")

    function update() {
      setCanRenderCanvas(!reducedMotionQuery.matches)
      setPointerFine(pointerQuery.matches)
    }

    update()
    reducedMotionQuery.addEventListener("change", update)
    pointerQuery.addEventListener("change", update)

    return () => {
      reducedMotionQuery.removeEventListener("change", update)
      pointerQuery.removeEventListener("change", update)
    }
  }, [])

  if (!canRenderCanvas) {
    return <HeroFallback />
  }

  return (
    <SceneErrorBoundary fallback={<HeroFallback />}>
      <DynamicPencilScene pointerFine={pointerFine} />
    </SceneErrorBoundary>
  )
}
