# Phase 4 Luxury Three.js Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current plain storefront hero with a luxury atelier landing hero using a procedural Three.js pencil while preserving ecommerce flows.

**Architecture:** The homepage stays a server-rendered route that fetches product data through `apps/storefront/src/lib/medusa`. The 3D hero is isolated behind a client-only dynamic import and receives no product/service data. A CSS fallback renders first and is used for reduced motion or WebGL failure.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui, `three`, `@react-three/fiber`.

---

## File Structure

Create:

- `apps/storefront/src/components/storefront/hero/hero-fallback.tsx` - static CSS pencil scene, visible before canvas and as fallback.
- `apps/storefront/src/components/storefront/hero/pencil-scene-loader.tsx` - client-only dynamic import boundary, reduced-motion guard, error boundary.
- `apps/storefront/src/components/storefront/hero/pencil-scene.tsx` - React Three Fiber canvas and lighting.
- `apps/storefront/src/components/storefront/hero/pencil-model.tsx` - procedural pencil geometry and animation.
- `apps/storefront/src/components/storefront/hero/luxury-hero.tsx` - server component hero layout and CTAs.

Modify:

- `apps/storefront/package.json` and `pnpm-lock.yaml` - add approved dependencies only: `three`, `@react-three/fiber`.
- `apps/storefront/src/app/globals.css` - add atelier tokens and pencil fallback utility shapes.
- `apps/storefront/src/data/homepage.ts` - update hero copy to sell the template and keep use-case data.
- `apps/storefront/src/app/page.tsx` - replace `HeroSection` with `LuxuryHero`, keep Medusa service layer usage.
- `apps/storefront/src/components/site-header.tsx` - reduce generic button look and align header with atelier theme.
- `apps/storefront/src/components/storefront/sections/use-case-grid.tsx` - align below-fold cards with new visual system.
- `apps/storefront/src/components/storefront/sections/featured-product-rail.tsx` - align featured products with new visual system.
- `apps/storefront/src/components/storefront/recommendations/recommendation-card.tsx` - remove generic card feel from recommendation cards.

Do not modify:

- `apps/storefront/src/lib/medusa/*`
- `apps/storefront/src/lib/recommendations.ts`
- `apps/storefront/src/app/cart/*`
- `apps/storefront/src/app/checkout/*`
- `apps/backend/*`

---

### Task 1: Install Approved 3D Dependencies

**Files:**
- Modify: `apps/storefront/package.json`
- Modify: `pnpm-lock.yaml`

- [ ] **Step 1: Confirm current git state**

Run:

```powershell
git status --short --branch
```

Expected: any dirty user files are noted and not reverted.

- [ ] **Step 2: Install only approved dependencies**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront add three @react-three/fiber
```

Expected: `apps/storefront/package.json` and `pnpm-lock.yaml` change. `@react-three/drei` must not appear.

- [ ] **Step 3: Verify dependency list**

Run:

```powershell
rg "@react-three/drei|@react-three/fiber|\"three\"" apps/storefront/package.json pnpm-lock.yaml
```

Expected:

- matches for `three`
- matches for `@react-three/fiber`
- no matches for `@react-three/drei`

- [ ] **Step 4: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

- [ ] **Step 5: Commit dependency checkpoint**

Run:

```powershell
git add apps/storefront/package.json pnpm-lock.yaml
git commit -m "Add Three.js hero dependencies"
```

Expected: commit includes dependency files only.

---

### Task 2: Add Atelier CSS Utilities and Hero Copy

**Files:**
- Modify: `apps/storefront/src/app/globals.css`
- Modify: `apps/storefront/src/data/homepage.ts`

- [ ] **Step 1: Add atelier utilities**

Append this block below the existing `.text-balance` utility in `apps/storefront/src/app/globals.css`:

```css
  .clip-pencil-tip {
    clip-path: polygon(0 14%, 82% 50%, 0 86%);
  }

  .clip-pencil-point {
    clip-path: polygon(0 0, 100% 50%, 0 100%);
  }

  .clip-chamfer {
    clip-path: polygon(0 0, calc(100% - 0.55rem) 0, 100% 0.55rem, 100% 100%, 0.55rem 100%, 0 calc(100% - 0.55rem));
  }

  .atelier-surface {
    background:
      radial-gradient(circle at 76% 32%, oklch(0.78 0.12 72 / 0.32), transparent 28%),
      linear-gradient(122deg, oklch(0.17 0.02 65) 0%, oklch(0.24 0.04 58) 46%, oklch(0.58 0.09 70) 145%);
  }

  .atelier-grain {
    background-image:
      linear-gradient(115deg, oklch(1 0 0 / 0.04) 0 1px, transparent 1px 12px),
      radial-gradient(circle at 20% 20%, oklch(1 0 0 / 0.04), transparent 26%);
  }
```

Expected: no inline styles are needed for fallback geometry.

- [ ] **Step 2: Update hero data**

In `apps/storefront/src/data/homepage.ts`, replace only `homepageHero` with:

```ts
export const homepageHero = {
  eyebrow: "Premium storefront template",
  title: "A cinematic product shop built to feel bespoke.",
  description:
    "AllPencils pairs a luxury product hero with guided commerce, so buyers see the craft before they reach the catalogue.",
  primaryCta: {
    label: "Shop the collection",
    href: "/products",
  },
  secondaryCta: {
    label: "Explore guided picks",
    href: "#assistant",
  },
  highlights: ["3D product theatre", "Guided buying paths", "No-card checkout demo"],
}
```

Expected: copy sells the template without pretending checkout or AI are real production features.

- [ ] **Step 3: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

- [ ] **Step 4: Commit CSS/data checkpoint**

Run:

```powershell
git add apps/storefront/src/app/globals.css apps/storefront/src/data/homepage.ts
git commit -m "Add atelier visual tokens"
```

Expected: commit includes CSS utilities and homepage data only.

---

### Task 3: Add Static Hero Fallback

**Files:**
- Create: `apps/storefront/src/components/storefront/hero/hero-fallback.tsx`

- [ ] **Step 1: Create fallback component**

Create `apps/storefront/src/components/storefront/hero/hero-fallback.tsx`:

```tsx
"use client"

export function HeroFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 atelier-grain opacity-70" />
      <div className="absolute -right-28 top-24 h-40 w-[34rem] -rotate-12 drop-shadow-[0_38px_34px_rgba(0,0,0,0.42)] sm:right-0 sm:top-20 lg:right-10 lg:top-24">
        <div className="absolute left-0 top-14 h-16 w-[26rem] rounded-[0.35rem] bg-[linear-gradient(90deg,oklch(0.16_0.02_60),oklch(0.54_0.09_62)_20%,oklch(0.84_0.13_79)_50%,oklch(0.48_0.08_55)_78%,oklch(0.14_0.02_60))] shadow-[inset_0_8px_12px_rgba(255,255,255,0.18),inset_0_-12px_16px_rgba(0,0,0,0.35)]" />
        <div className="clip-pencil-tip absolute left-[25rem] top-7 h-28 w-32 bg-[linear-gradient(90deg,oklch(0.68_0.08_76),oklch(0.94_0.08_86)_45%,oklch(0.38_0.06_54))]" />
        <div className="clip-pencil-point absolute left-[31.5rem] top-[3.75rem] h-12 w-16 bg-[oklch(0.13_0.02_55)]" />
        <div className="absolute left-8 top-[4.35rem] h-1.5 w-72 rounded-full bg-white/25" />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

- [ ] **Step 3: Commit fallback checkpoint**

Run:

```powershell
git add apps/storefront/src/components/storefront/hero/hero-fallback.tsx
git commit -m "Add luxury hero fallback"
```

Expected: commit includes fallback file only.

---

### Task 4: Add Client-Only Three.js Scene

**Files:**
- Create: `apps/storefront/src/components/storefront/hero/pencil-scene-loader.tsx`
- Create: `apps/storefront/src/components/storefront/hero/pencil-scene.tsx`
- Create: `apps/storefront/src/components/storefront/hero/pencil-model.tsx`

- [ ] **Step 1: Create scene loader**

Create `apps/storefront/src/components/storefront/hero/pencil-scene-loader.tsx`:

```tsx
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
```

- [ ] **Step 2: Create pencil model**

Create `apps/storefront/src/components/storefront/hero/pencil-model.tsx`:

```tsx
"use client"

import { useFrame } from "@react-three/fiber"
import * as React from "react"
import * as THREE from "three"

type PencilModelProps = {
  pointerFine: boolean
}

export function PencilModel({ pointerFine }: PencilModelProps) {
  const groupRef = React.useRef<THREE.Group>(null)

  const materials = React.useMemo(
    () => ({
      body: new THREE.MeshStandardMaterial({
        color: "#a6622d",
        metalness: 0.08,
        roughness: 0.42,
      }),
      wood: new THREE.MeshStandardMaterial({
        color: "#d8b27a",
        metalness: 0.02,
        roughness: 0.58,
      }),
      graphite: new THREE.MeshStandardMaterial({
        color: "#17130f",
        metalness: 0.22,
        roughness: 0.5,
      }),
      ferrule: new THREE.MeshStandardMaterial({
        color: "#c79b53",
        metalness: 0.7,
        roughness: 0.28,
      }),
      eraser: new THREE.MeshStandardMaterial({
        color: "#5b3329",
        metalness: 0.02,
        roughness: 0.72,
      }),
    }),
    []
  )

  useFrame((state, delta) => {
    const group = groupRef.current

    if (!group) {
      return
    }

    const pointerX = pointerFine ? state.pointer.x * 0.16 : 0
    const pointerY = pointerFine ? state.pointer.y * 0.08 : 0
    const idle = state.clock.elapsedTime * 0.18

    group.rotation.x = THREE.MathUtils.damp(
      group.rotation.x,
      0.18 + pointerY,
      4,
      delta
    )
    group.rotation.y = THREE.MathUtils.damp(
      group.rotation.y,
      -0.45 + pointerX + Math.sin(idle) * 0.08,
      4,
      delta
    )
    group.rotation.z = THREE.MathUtils.damp(group.rotation.z, -0.22, 4, delta)
  })

  return (
    <group ref={groupRef} scale={1.16} position={[0.1, -0.08, 0]}>
      <mesh castShadow receiveShadow material={materials.body} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.34, 0.34, 4.25, 6]} />
      </mesh>
      <mesh castShadow material={materials.ferrule} position={[-2.28, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.36, 0.36, 0.34, 24]} />
      </mesh>
      <mesh castShadow material={materials.eraser} position={[-2.62, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.32, 0.32, 0.36, 24]} />
      </mesh>
      <mesh castShadow material={materials.wood} position={[2.44, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.36, 0.78, 6]} />
      </mesh>
      <mesh castShadow material={materials.graphite} position={[2.93, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.15, 0.34, 6]} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 3: Create canvas scene**

Create `apps/storefront/src/components/storefront/hero/pencil-scene.tsx`:

```tsx
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
        className={ready ? "opacity-100 transition-opacity duration-700" : "opacity-0"}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        onCreated={() => setReady(true)}
        shadows
      >
        <ambientLight intensity={0.82} />
        <directionalLight castShadow intensity={2.15} position={[3.2, 3.6, 4.4]} />
        <pointLight color="#f5c778" intensity={5.4} position={[-2.4, 1.4, 2.5]} />
        <PencilModel pointerFine={pointerFine} />
        <mesh receiveShadow position={[0, -0.8, -0.35]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7.5, 3.5]} />
          <shadowMaterial opacity={0.22} />
        </mesh>
      </Canvas>
    </div>
  )
}
```

- [ ] **Step 4: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

- [ ] **Step 5: Run grep boundary check**

Run:

```powershell
rg "\"three\"|@react-three/fiber" apps/storefront/src -n
```

Expected: imports only in:

- `apps/storefront/src/components/storefront/hero/pencil-scene.tsx`
- `apps/storefront/src/components/storefront/hero/pencil-model.tsx`

- [ ] **Step 6: Commit scene checkpoint**

Run:

```powershell
git add apps/storefront/src/components/storefront/hero/pencil-scene-loader.tsx apps/storefront/src/components/storefront/hero/pencil-scene.tsx apps/storefront/src/components/storefront/hero/pencil-model.tsx
git commit -m "Add procedural Three.js pencil scene"
```

Expected: commit includes client scene files only.

---

### Task 5: Add Luxury Hero Layout

**Files:**
- Create: `apps/storefront/src/components/storefront/hero/luxury-hero.tsx`

- [ ] **Step 1: Create hero layout**

Create `apps/storefront/src/components/storefront/hero/luxury-hero.tsx`:

```tsx
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"

import { PencilSceneLoader } from "@/components/storefront/hero/pencil-scene-loader"

type LuxuryHeroProps = {
  hero: {
    eyebrow: string
    title: string
    description: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    highlights: string[]
  }
}

export function LuxuryHero({ hero }: LuxuryHeroProps) {
  return (
    <section className="relative isolate -mx-6 overflow-hidden atelier-surface px-6 text-[#f8ecd8] sm:-mx-10 sm:px-10">
      <PencilSceneLoader />
      <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,oklch(0.16_0.02_65/0.98),oklch(0.16_0.02_65/0.74)_46%,oklch(0.16_0.02_65/0.16))]" />
      <div className="relative z-20 mx-auto grid min-h-[540px] max-w-6xl items-center gap-8 py-12 sm:min-h-[620px] lg:min-h-[660px] lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
        <div className="max-w-2xl space-y-7">
          <p className="w-fit border border-[#f1d69a]/35 bg-white/5 px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.24em] text-[#f1d69a]">
            {hero.eyebrow}
          </p>
          <div className="space-y-5">
            <h1 className="font-heading text-5xl font-semibold leading-[0.95] text-balance text-[#fff4df] sm:text-6xl lg:text-7xl">
              {hero.title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-[#dfc9aa] sm:text-lg">
              {hero.description}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href={hero.primaryCta.href}
              className="clip-chamfer group inline-flex w-fit items-center gap-3 bg-[#f1c86f] px-5 py-3 text-sm font-semibold text-[#1a120c] shadow-[5px_5px_0_#6f421c] transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#f8ecd8]"
            >
              {hero.primaryCta.label}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="group inline-flex w-fit items-center gap-2 border-b border-[#f1c86f] py-2 text-sm font-medium text-[#f8deb0] transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[#f8ecd8]"
            >
              {hero.secondaryCta.label}
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid max-w-lg grid-cols-1 gap-2 pt-8 text-xs text-[#ead7b6] sm:grid-cols-3">
            {hero.highlights.map((highlight) => (
              <div
                key={highlight}
                className="border-l-2 border-[#f1c86f] bg-white/[0.06] px-3 py-3"
              >
                {highlight}
              </div>
            ))}
          </div>
        </div>
        <div className="min-h-[260px]" />
      </div>
      <a
        href="#storefront-sections"
        className="absolute bottom-5 left-1/2 z-20 inline-flex -translate-x-1/2 items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d9bd89] transition-colors hover:text-[#fff4df] focus-visible:ring-2 focus-visible:ring-[#f8ecd8]"
      >
        Shop below
        <ChevronDown className="size-4" />
      </a>
    </section>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

- [ ] **Step 3: Commit hero layout checkpoint**

Run:

```powershell
git add apps/storefront/src/components/storefront/hero/luxury-hero.tsx
git commit -m "Add luxury storefront hero"
```

Expected: commit includes hero layout only.

---

### Task 6: Assemble Homepage Hero and Preserve Data Flow

**Files:**
- Modify: `apps/storefront/src/app/page.tsx`

- [ ] **Step 1: Replace hero import**

In `apps/storefront/src/app/page.tsx`, remove:

```ts
import { HeroSection } from "@/components/storefront/sections/hero-section"
```

Add:

```ts
import { LuxuryHero } from "@/components/storefront/hero/luxury-hero"
```

- [ ] **Step 2: Replace fallback homepage main**

Replace the not-ready return with:

```tsx
    return (
      <main className="overflow-hidden">
        <LuxuryHero hero={homepageHero} />
        <div
          id="storefront-sections"
          className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10"
        >
          <UseCaseGrid items={useCases} />
          <CraftStrip items={craftPoints} />
          <AssistantTeaser />
        </div>
      </main>
    )
```

- [ ] **Step 3: Replace ready homepage main**

Replace the ready return with:

```tsx
  return (
    <main className="overflow-hidden">
      <LuxuryHero hero={homepageHero} />
      <div
        id="storefront-sections"
        className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-12 sm:px-10"
      >
        <UseCaseGrid items={useCases} />
        <FeaturedProductRail
          products={featuredProducts}
          currencyCode={catalogue.region.currency_code}
        />
        <CraftStrip items={craftPoints} />
        <RecommendationRail
          eyebrow="Recommended starting points"
          title="A few useful picks if you are choosing quickly."
          description="Selected from available product signals for sketching, school, and focused work."
          products={recommendedProducts}
          currencyCode={catalogue.region.currency_code}
        />
        <AssistantTeaser />
      </div>
    </main>
  )
```

- [ ] **Step 4: Run service boundary check**

Run:

```powershell
rg "fetch\(|/store/|MEDUSA|process\.env" apps/storefront/src/components/storefront/hero apps/storefront/src/app/page.tsx -n
```

Expected:

- no matches in `apps/storefront/src/components/storefront/hero`
- only `MEDUSA_STORE_REVALIDATE_SECONDS` import usage in `page.tsx`

- [ ] **Step 5: Run lint and typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit assembly checkpoint**

Run:

```powershell
git add apps/storefront/src/app/page.tsx
git commit -m "Assemble luxury homepage hero"
```

Expected: commit includes page assembly only.

---

### Task 7: Align Header and Key Cards With Atelier Direction

**Files:**
- Modify: `apps/storefront/src/components/site-header.tsx`
- Modify: `apps/storefront/src/components/storefront/sections/use-case-grid.tsx`
- Modify: `apps/storefront/src/components/storefront/sections/featured-product-rail.tsx`
- Modify: `apps/storefront/src/components/storefront/recommendations/recommendation-card.tsx`

- [ ] **Step 1: Update site header classes**

In `apps/storefront/src/components/site-header.tsx`, replace the `<header>` className with:

```tsx
className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75"
```

Replace the logo icon span className with:

```tsx
className="clip-chamfer flex size-10 items-center justify-center border border-border/70 bg-card"
```

Replace the cart count span className with:

```tsx
className="absolute -top-2 -right-2 inline-flex min-w-4 items-center justify-center bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
```

- [ ] **Step 2: Update use-case section title and card shape**

In `apps/storefront/src/components/storefront/sections/use-case-grid.tsx`:

Replace the eyebrow `<p>` className with:

```tsx
className="text-xs font-medium uppercase tracking-[0.22em] text-primary"
```

Replace the `<h2>` text with:

```tsx
Shop by the work your pencil needs to do.
```

Replace each `Card` className with:

```tsx
className="clip-chamfer border-border/70 bg-card/90 transition-transform hover:-translate-y-1"
```

- [ ] **Step 3: Update featured rail language**

In `apps/storefront/src/components/storefront/sections/featured-product-rail.tsx`, replace the `<h2>` text with:

```tsx
Selected products that show the template in motion.
```

Replace the `Button` with this link:

```tsx
<Link
  href="/products"
  className="w-fit border-b border-primary py-2 text-sm font-medium text-primary transition-colors hover:text-foreground"
>
  View catalogue
</Link>
```

Remove the unused `Button` import from this file.

- [ ] **Step 4: Update recommendation card shape**

In `apps/storefront/src/components/storefront/recommendations/recommendation-card.tsx`, replace the outer `Card` className with:

```tsx
className="clip-chamfer h-full overflow-hidden border-border/70 bg-card/90 transition-transform hover:-translate-y-0.5"
```

Replace the image wrapper className with:

```tsx
className="relative aspect-[4/3] overflow-hidden bg-muted"
```

- [ ] **Step 5: Run lint and typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: both pass.

- [ ] **Step 6: Commit polish checkpoint**

Run:

```powershell
git add apps/storefront/src/components/site-header.tsx apps/storefront/src/components/storefront/sections/use-case-grid.tsx apps/storefront/src/components/storefront/sections/featured-product-rail.tsx apps/storefront/src/components/storefront/recommendations/recommendation-card.tsx
git commit -m "Align storefront sections with atelier style"
```

Expected: commit includes only visual polish files.

---

### Task 8: Production Build and Browser Verification

**Files:**
- No planned source edits unless verification finds a bug.

- [ ] **Step 1: Run final status**

Run:

```powershell
git status --short
```

Expected: only known unrelated dirty files, or clean.

- [ ] **Step 2: Run required checks**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
corepack pnpm --filter @allpencils/storefront build
```

Expected:

- lint passes
- typecheck passes
- build passes
- build output is reviewed for obvious route/chunk growth

- [ ] **Step 3: Start dev server**

Run:

```powershell
cd apps/storefront
corepack pnpm dev --hostname 127.0.0.1 --port 3100
```

Expected: server ready at `http://127.0.0.1:3100`.

- [ ] **Step 4: Browser-check homepage desktop**

Open:

```text
http://127.0.0.1:3100/
```

Expected:

- hero loads with fallback immediately
- 3D pencil canvas appears on normal-motion desktop
- hero does not use pill-shaped buttons
- next ecommerce section is visible or clearly hinted
- no console errors

- [ ] **Step 5: Browser-check homepage mobile**

Use a mobile viewport around `375x667`.

Expected:

- hero text remains readable
- pencil/fallback is framed and nonblank
- hero does not consume so much height that ecommerce feels hidden
- CTAs fit without overlap
- no console errors

- [ ] **Step 6: Browser-check reduced motion**

Emulate `prefers-reduced-motion: reduce`.

Expected:

- fallback renders
- Three.js canvas does not load visually
- layout remains complete

- [ ] **Step 7: Browser-check ecommerce routes**

Open:

```text
http://127.0.0.1:3100/products
http://127.0.0.1:3100/cart
http://127.0.0.1:3100/checkout
```

Expected:

- routes still load
- cart/checkout behavior unchanged
- no card number, expiry, or CVC fields appear

- [ ] **Step 8: Stop dev server**

Stop the process started in Step 3.

- [ ] **Step 9: Commit any verification fixes**

If verification required fixes, run:

```powershell
git status --short
```

Then stage only the source files changed by the verification fix and commit:

```powershell
git commit -m "Fix luxury hero verification issues"
```

Expected: only files changed to fix verified issues are committed. Do not stage unrelated dirty files.

---

## Self-Review Checklist

- Spec requirement: Three.js hero -> Tasks 1, 4, 5, 6.
- Spec requirement: no Drei -> Task 1 verification.
- Spec requirement: fallback first -> Tasks 3 and 4.
- Spec requirement: reduced motion skips canvas -> Task 4.
- Spec requirement: pointer parallax only pointer/fine -> Task 4.
- Spec requirement: Medusa service boundary -> Task 6.
- Spec requirement: ecommerce clarity below fold -> Tasks 5, 6, 8.
- Spec requirement: no cart/checkout behavior changes -> File exclusions and Task 8.
- Spec requirement: browser desktop/mobile/reduced-motion checks -> Task 8.
