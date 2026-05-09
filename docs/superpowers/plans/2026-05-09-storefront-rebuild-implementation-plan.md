# Storefront Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Phase 3 storefront rebuild: reusable Tailwind/shadcn homepage sections, deterministic recommendations, scripted assistant, and product-detail recommendation rail.

**Architecture:** Keep Medusa data access inside `apps/storefront/src/lib/medusa`, add local static config under `src/data`, and assemble reusable storefront components from server-rendered pages. Client state is limited to the scripted assistant widget.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, shadcn/ui primitives, lucide-react, Medusa Store API service layer, optional `next/font/google` only.

---

## File Structure

Create:

- `apps/storefront/src/data/homepage.ts` - Homepage copy/config for hero, use cases, craft points, and assistant teaser.
- `apps/storefront/src/data/assistant-script.ts` - Scripted assistant options/responses.
- `apps/storefront/src/lib/recommendations.ts` - Deterministic product recommendation helpers.
- `apps/storefront/src/components/storefront/sections/hero-section.tsx` - Premium homepage hero.
- `apps/storefront/src/components/storefront/sections/use-case-grid.tsx` - Artist/School/Work cards.
- `apps/storefront/src/components/storefront/sections/featured-product-rail.tsx` - Live product rail section.
- `apps/storefront/src/components/storefront/sections/craft-strip.tsx` - Product-craft credibility strip.
- `apps/storefront/src/components/storefront/sections/assistant-teaser.tsx` - Assistant intro section.
- `apps/storefront/src/components/storefront/recommendations/recommendation-rail.tsx` - Generic recommendation rail.
- `apps/storefront/src/components/storefront/assistant/shopping-assistant.tsx` - Client-side scripted assistant sheet.

Modify:

- `apps/storefront/src/app/page.tsx` - Replace bootstrap export with real homepage assembly.
- `apps/storefront/src/app/products/[handle]/page.tsx` - Add product detail recommendation rail.
- `apps/storefront/src/app/layout.tsx` - Optionally switch typography to `next/font/google`.
- `docs/build-plan.md` - Mark Phase 3 implementation notes after build is verified.
- `docs/prompt.md` - Update next prompt after implementation if needed.

Do not modify:

- `apps/storefront/src/lib/medusa/*` except import-only needs. Medusa API boundary already works.
- Cart/checkout pages or provider unless a regression is discovered.
- Backend files. Existing `apps/backend/integration-tests/http/health.spec.ts` status is line-ending noise; ignore it.

---

### Task 1: Add Homepage And Assistant Data

**Files:**
- Create: `apps/storefront/src/data/homepage.ts`
- Create: `apps/storefront/src/data/assistant-script.ts`

- [ ] **Step 1: Create homepage config**

Create `apps/storefront/src/data/homepage.ts`:

```ts
import { BookOpen, BriefcaseBusiness, Brush, Gauge, Layers3, Sparkles } from "lucide-react"

export const homepageHero = {
  eyebrow: "Specialist pencil store",
  title: "Pencils for sketching, study, and focused work.",
  description:
    "Choose precise graphite, color, and everyday pencils by the way you use them: studio work, school notes, or clear daily thinking.",
  primaryCta: {
    label: "Shop pencils",
    href: "/products",
  },
  secondaryCta: {
    label: "Find your fit",
    href: "#assistant",
  },
  highlights: ["Artist-ready grades", "School-safe staples", "Workday essentials"],
}

export const useCases = [
  {
    id: "artist",
    title: "Artist",
    description:
      "Sketching pencils, rich color, and controlled marks for studies, drafts, and finished pieces.",
    href: "/products",
    icon: Brush,
    tags: ["Sketch", "Shade", "Blend"],
  },
  {
    id: "school",
    title: "School",
    description:
      "Reliable pencils for notes, diagrams, exams, and daily classroom work.",
    href: "/products",
    icon: BookOpen,
    tags: ["Notes", "Diagrams", "Practice"],
  },
  {
    id: "work",
    title: "Work",
    description:
      "Focused writing tools for planning, marking, editing, and keeping ideas moving.",
    href: "/products",
    icon: BriefcaseBusiness,
    tags: ["Planning", "Editing", "Focus"],
  },
] as const

export const craftPoints = [
  {
    title: "Grade matters",
    description: "Pick harder graphite for clean lines or softer grades for tonal sketching.",
    icon: Gauge,
  },
  {
    title: "Built for repetition",
    description: "Comfortable shapes and dependable cores help long sessions feel easier.",
    icon: Layers3,
  },
  {
    title: "Guided picks",
    description: "Use-case recommendations help shoppers choose without guessing.",
    icon: Sparkles,
  },
] as const

export const assistantTeaser = {
  eyebrow: "Guided shopping",
  title: "Not sure where to start?",
  description:
    "Answer one quick prompt and get a scripted starting point for art, school, or work.",
  cta: "Open pencil guide",
}
```

- [ ] **Step 2: Create assistant script**

Create `apps/storefront/src/data/assistant-script.ts`:

```ts
export type AssistantChoice = {
  id: "artist" | "school" | "work" | "fallback"
  label: string
  prompt: string
  response: string
  href: string
}

export const assistantIntro =
  "Tell me what you need the pencil for and I will suggest a useful starting point."

export const assistantChoices: AssistantChoice[] = [
  {
    id: "artist",
    label: "Art or sketching",
    prompt: "I am drawing or sketching.",
    response:
      "Start with pencils that offer tonal range and control. Softer graphite and color options are usually best for expressive marks.",
    href: "/products",
  },
  {
    id: "school",
    label: "School or study",
    prompt: "I need pencils for school.",
    response:
      "Choose durable everyday pencils that write cleanly, erase well, and handle diagrams, notes, and practice work.",
    href: "/products",
  },
  {
    id: "work",
    label: "Work or planning",
    prompt: "I need pencils for work.",
    response:
      "Look for comfortable pencils with consistent lines for planning, marking, editing, and focused desk work.",
    href: "/products",
  },
  {
    id: "fallback",
    label: "I am not sure",
    prompt: "I am not sure yet.",
    response:
      "Begin with a balanced everyday pencil, then add specialist options once you know whether you need darker marks, color, or long-session comfort.",
    href: "/products",
  },
]
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass. These files are not imported yet, but TypeScript syntax must be valid.

---

### Task 2: Add Deterministic Recommendation Helpers

**Files:**
- Create: `apps/storefront/src/lib/recommendations.ts`

- [ ] **Step 1: Create helper module**

Create `apps/storefront/src/lib/recommendations.ts`:

```ts
import type { StoreProduct } from "@/lib/medusa"

export type RecommendationUseCase = "artist" | "school" | "work"

const USE_CASE_KEYWORDS: Record<RecommendationUseCase, string[]> = {
  artist: ["artist", "art", "sketch", "draw", "shade", "blend", "color", "colour"],
  school: ["school", "student", "study", "class", "exam", "note"],
  work: ["work", "office", "desk", "planning", "editing", "focus"],
}

function normalize(value: string) {
  return value.trim().toLowerCase()
}

function getProductSignals(product: StoreProduct) {
  return [
    product.title,
    product.description ?? "",
    product.metadata?.audience ?? "",
    product.metadata?.story ?? "",
    ...(product.metadata?.recommendation_tags ?? []),
    ...(product.categories?.map((category) => category.name) ?? []),
  ]
    .map(normalize)
    .join(" ")
}

export function inferProductUseCases(product: StoreProduct): RecommendationUseCase[] {
  const signals = getProductSignals(product)

  return (Object.entries(USE_CASE_KEYWORDS) as Array<
    [RecommendationUseCase, string[]]
  >)
    .filter(([, keywords]) => keywords.some((keyword) => signals.includes(keyword)))
    .map(([useCase]) => useCase)
}

export function getProductsForUseCase(
  products: StoreProduct[],
  useCase: RecommendationUseCase,
  limit = 3
) {
  const matches = products.filter((product) =>
    inferProductUseCases(product).includes(useCase)
  )
  const fallback = products.filter((product) => !matches.includes(product))

  return [...matches, ...fallback].slice(0, limit)
}

export function getRelatedProducts(
  product: StoreProduct,
  products: StoreProduct[],
  limit = 3
) {
  const candidates = products.filter((candidate) => candidate.id !== product.id)
  const productUseCases = inferProductUseCases(product)
  const productCategoryIds = new Set(product.categories?.map((category) => category.id))
  const productTags = new Set(product.metadata?.recommendation_tags ?? [])

  const ranked = candidates
    .map((candidate, index) => {
      const candidateUseCases = inferProductUseCases(candidate)
      const candidateCategoryIds = candidate.categories?.map((category) => category.id) ?? []
      const candidateTags = candidate.metadata?.recommendation_tags ?? []

      const score =
        candidateUseCases.filter((useCase) => productUseCases.includes(useCase)).length * 4 +
        candidateCategoryIds.filter((id) => productCategoryIds.has(id)).length * 3 +
        candidateTags.filter((tag) => productTags.has(tag)).length * 2

      return { candidate, index, score }
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)

  return ranked.map((entry) => entry.candidate).slice(0, limit)
}

export function getFeaturedProducts(products: StoreProduct[], limit = 4) {
  return products.slice(0, limit)
}
```

- [ ] **Step 2: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

---

### Task 3: Add Recommendation Rail Components

**Files:**
- Create: `apps/storefront/src/components/storefront/recommendations/recommendation-card.tsx`
- Create: `apps/storefront/src/components/storefront/recommendations/recommendation-rail.tsx`

- [ ] **Step 1: Create recommendation card**

Create `apps/storefront/src/components/storefront/recommendations/recommendation-card.tsx`:

```tsx
import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  formatCurrency,
  getProductPrice,
  getProductPrimaryImage,
  type StoreProduct,
} from "@/lib/medusa"

type RecommendationCardProps = {
  product: StoreProduct
  currencyCode: string
}

export function RecommendationCard({
  product,
  currencyCode,
}: RecommendationCardProps) {
  const image = getProductPrimaryImage(product)
  const audience = product.metadata?.audience ?? product.categories?.[0]?.name ?? "Pencil"

  return (
    <Card className="h-full overflow-hidden rounded-lg border-border/70 bg-card/90 transition-transform hover:-translate-y-0.5">
      <Link href={`/products/${product.handle}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
          ) : null}
        </div>
      </Link>
      <CardHeader className="gap-2">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          {audience}
        </p>
        <CardTitle className="text-base">
          <Link href={`/products/${product.handle}`}>{product.title}</Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 pt-0 text-sm">
        <span className="font-medium text-primary">
          {formatCurrency(getProductPrice(product), currencyCode)}
        </span>
        <Link
          href={`/products/${product.handle}`}
          className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
        >
          View
          <ArrowRight className="size-3" />
        </Link>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create recommendation rail**

Create `apps/storefront/src/components/storefront/recommendations/recommendation-rail.tsx`:

```tsx
import { RecommendationCard } from "@/components/storefront/recommendations/recommendation-card"
import type { StoreProduct } from "@/lib/medusa"

type RecommendationRailProps = {
  eyebrow?: string
  title: string
  description?: string
  products: StoreProduct[]
  currencyCode: string
}

export function RecommendationRail({
  eyebrow,
  title,
  description,
  products,
  currencyCode,
}: RecommendationRailProps) {
  if (!products.length) {
    return null
  }

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <RecommendationCard
            key={product.id}
            product={product}
            currencyCode={currencyCode}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

---

### Task 4: Add Homepage Section Components

**Files:**
- Create: `apps/storefront/src/components/storefront/sections/hero-section.tsx`
- Create: `apps/storefront/src/components/storefront/sections/use-case-grid.tsx`
- Create: `apps/storefront/src/components/storefront/sections/featured-product-rail.tsx`
- Create: `apps/storefront/src/components/storefront/sections/craft-strip.tsx`
- Create: `apps/storefront/src/components/storefront/sections/assistant-teaser.tsx`

- [ ] **Step 1: Create hero section**

Create `apps/storefront/src/components/storefront/sections/hero-section.tsx`:

```tsx
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type HeroSectionProps = {
  hero: {
    eyebrow: string
    title: string
    description: string
    primaryCta: { label: string; href: string }
    secondaryCta: { label: string; href: string }
    highlights: string[]
  }
}

export function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="grid min-h-[68vh] items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="space-y-7">
        <div className="flex flex-wrap gap-2">
          <Badge>{hero.eyebrow}</Badge>
          {hero.highlights.slice(0, 2).map((highlight) => (
            <Badge key={highlight} variant="secondary">
              {highlight}
            </Badge>
          ))}
        </div>
        <div className="space-y-5">
          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            {hero.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href={hero.primaryCta.href}>
              {hero.primaryCta.label}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={hero.secondaryCta.href}>
              {hero.secondaryCta.label}
              <Sparkles className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-lg border border-border/70 bg-card/90 p-5">
        <div className="grid gap-3">
          {hero.highlights.map((highlight, index) => (
            <div
              key={highlight}
              className="flex items-center justify-between rounded-lg border border-border/60 bg-background/70 p-4"
            >
              <span className="text-sm text-muted-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="font-medium">{highlight}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create use-case grid**

Create `apps/storefront/src/components/storefront/sections/use-case-grid.tsx`:

```tsx
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { useCases } from "@/data/homepage"

type UseCaseGridProps = {
  items: typeof useCases
}

export function UseCaseGrid({ items }: UseCaseGridProps) {
  return (
    <section className="space-y-5">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
          Shop by use
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Start with how you use your pencil.
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {items.map(({ id, title, description, href, icon: Icon, tags }) => (
          <Card key={id} className="rounded-lg border-border/70 bg-card/90">
            <CardHeader className="gap-4">
              <div className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background">
                <Icon className="size-4 text-primary" />
              </div>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <p className="text-sm leading-6 text-muted-foreground">{description}</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border/60 px-2 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <Link
                href={href}
                className="inline-flex items-center gap-1 text-sm font-medium text-primary"
              >
                Explore {title.toLowerCase()} picks
                <ArrowRight className="size-3" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create featured product rail wrapper**

Create `apps/storefront/src/components/storefront/sections/featured-product-rail.tsx`:

```tsx
import Link from "next/link"

import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import type { StoreProduct } from "@/lib/medusa"

type FeaturedProductRailProps = {
  products: StoreProduct[]
  currencyCode: string
}

export function FeaturedProductRail({
  products,
  currencyCode,
}: FeaturedProductRailProps) {
  if (!products.length) {
    return null
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            Featured pencils
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Reliable starting points from the catalogue.
          </h2>
        </div>
        <Button asChild variant="outline">
          <Link href="/products">View catalogue</Link>
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            currencyCode={currencyCode}
          />
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Create craft strip**

Create `apps/storefront/src/components/storefront/sections/craft-strip.tsx`:

```tsx
import type { craftPoints } from "@/data/homepage"

type CraftStripProps = {
  items: typeof craftPoints
}

export function CraftStrip({ items }: CraftStripProps) {
  return (
    <section className="grid gap-4 rounded-lg border border-border/70 bg-card/80 p-4 md:grid-cols-3">
      {items.map(({ title, description, icon: Icon }) => (
        <div key={title} className="space-y-3 rounded-lg bg-background/60 p-4">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border/60">
            <Icon className="size-4 text-primary" />
          </div>
          <div className="space-y-1">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
      ))}
    </section>
  )
}
```

- [ ] **Step 5: Create assistant teaser**

Create `apps/storefront/src/components/storefront/sections/assistant-teaser.tsx`:

```tsx
import { ShoppingAssistant } from "@/components/storefront/assistant/shopping-assistant"
import { assistantTeaser } from "@/data/homepage"

export function AssistantTeaser() {
  return (
    <section id="assistant" className="rounded-lg border border-border/70 bg-card/90 p-6">
      <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">
            {assistantTeaser.eyebrow}
          </p>
          <h2 className="text-3xl font-semibold tracking-tight">
            {assistantTeaser.title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            {assistantTeaser.description}
          </p>
        </div>
        <ShoppingAssistant triggerLabel={assistantTeaser.cta} />
      </div>
    </section>
  )
}
```

- [ ] **Step 6: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: fail because `ShoppingAssistant` does not exist yet. This verifies the task boundary before Task 5.

---

### Task 5: Add Scripted Assistant Component

**Files:**
- Create: `apps/storefront/src/components/storefront/assistant/shopping-assistant.tsx`

- [ ] **Step 1: Create assistant component**

Create `apps/storefront/src/components/storefront/assistant/shopping-assistant.tsx`:

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { assistantChoices, assistantIntro } from "@/data/assistant-script"

type ShoppingAssistantProps = {
  triggerLabel?: string
}

export function ShoppingAssistant({
  triggerLabel = "Open pencil guide",
}: ShoppingAssistantProps) {
  const [selectedId, setSelectedId] = React.useState(assistantChoices[0]?.id)
  const selected =
    assistantChoices.find((choice) => choice.id === selectedId) ?? assistantChoices[0]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="lg">
          {triggerLabel}
          <MessageCircle className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Pencil guide</SheetTitle>
          <SheetDescription>{assistantIntro}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4">
          <div className="grid gap-2">
            {assistantChoices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => setSelectedId(choice.id)}
                className="rounded-lg border border-border/70 bg-background p-3 text-left text-sm transition-colors hover:bg-muted data-[active=true]:border-primary"
                data-active={choice.id === selected?.id}
              >
                <span className="font-medium">{choice.label}</span>
                <span className="mt-1 block text-muted-foreground">
                  {choice.prompt}
                </span>
              </button>
            ))}
          </div>
          {selected ? (
            <div className="space-y-3 rounded-lg border border-border/70 bg-card p-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {selected.response}
              </p>
              <Button asChild variant="outline">
                <Link href={selected.href}>Browse suggested pencils</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
```

- [ ] **Step 2: Run typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: pass.

---

### Task 6: Assemble Homepage

**Files:**
- Modify: `apps/storefront/src/app/page.tsx`

- [ ] **Step 1: Replace bootstrap export**

Replace `apps/storefront/src/app/page.tsx` with:

```tsx
import { AssistantTeaser } from "@/components/storefront/sections/assistant-teaser"
import { CraftStrip } from "@/components/storefront/sections/craft-strip"
import { FeaturedProductRail } from "@/components/storefront/sections/featured-product-rail"
import { HeroSection } from "@/components/storefront/sections/hero-section"
import { UseCaseGrid } from "@/components/storefront/sections/use-case-grid"
import { RecommendationRail } from "@/components/storefront/recommendations/recommendation-rail"
import {
  craftPoints,
  homepageHero,
  useCases,
} from "@/data/homepage"
import {
  MEDUSA_STORE_REVALIDATE_SECONDS,
  listStoreProducts,
} from "@/lib/medusa"
import { getFeaturedProducts, getProductsForUseCase } from "@/lib/recommendations"

export const revalidate = MEDUSA_STORE_REVALIDATE_SECONDS

export default async function HomePage() {
  const catalogue = await listStoreProducts()

  if (catalogue.status !== "ready") {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 sm:px-10">
        <HeroSection hero={homepageHero} />
        <UseCaseGrid items={useCases} />
        <CraftStrip items={craftPoints} />
        <AssistantTeaser />
      </main>
    )
  }

  const featuredProducts = getFeaturedProducts(catalogue.data, 4)
  const recommendedProducts = getProductsForUseCase(catalogue.data, "artist", 3)

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-14 px-6 py-8 sm:px-10">
      <HeroSection hero={homepageHero} />
      <UseCaseGrid items={useCases} />
      <FeaturedProductRail
        products={featuredProducts}
        currencyCode={catalogue.region.currency_code}
      />
      <CraftStrip items={craftPoints} />
      <RecommendationRail
        eyebrow="Recommended starting points"
        title="A few useful picks if you are choosing quickly."
        description="These suggestions are deterministic and based on simple product signals, not external AI."
        products={recommendedProducts}
        currencyCode={catalogue.region.currency_code}
      />
      <AssistantTeaser />
    </main>
  )
}
```

- [ ] **Step 2: Run lint and typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: both pass.

---

### Task 7: Add Product Detail Recommendations

**Files:**
- Modify: `apps/storefront/src/app/products/[handle]/page.tsx`

- [ ] **Step 1: Add imports**

In `apps/storefront/src/app/products/[handle]/page.tsx`, add:

```tsx
import { RecommendationRail } from "@/components/storefront/recommendations/recommendation-rail"
import { getRelatedProducts } from "@/lib/recommendations"
```

Also add `listStoreProducts` to the existing `@/lib/medusa` import:

```tsx
import {
  MEDUSA_STORE_REVALIDATE_SECONDS,
  formatCurrency,
  getStoreProductByHandle,
  getProductPrimaryImage,
  getProductPrice,
  listStoreProducts,
} from "@/lib/medusa"
```

- [ ] **Step 2: Load related products**

After:

```tsx
const { data: product, region } = productResult
```

Add:

```tsx
const catalogue = await listStoreProducts()
const relatedProducts =
  catalogue.status === "ready" ? getRelatedProducts(product, catalogue.data, 3) : []
```

- [ ] **Step 3: Render recommendation rail**

Before the closing `</main>`, after the main product detail section, add:

```tsx
<RecommendationRail
  eyebrow="You might also like"
  title="Related pencils for the same kind of work."
  description="Deterministic suggestions based on available product signals."
  products={relatedProducts}
  currencyCode={region.currency_code}
/>
```

- [ ] **Step 4: Run lint and typecheck**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
```

Expected: both pass.

---

### Task 8: Optional Google Font Pass

**Files:**
- Modify: `apps/storefront/src/app/layout.tsx`
- Modify: `apps/storefront/src/app/globals.css`

Only do this task if the current Geist setup feels too generic during implementation review.

- [ ] **Step 1: Replace local font imports**

In `apps/storefront/src/app/layout.tsx`, replace:

```tsx
import localFont from "next/font/local"
```

with:

```tsx
import { Cormorant_Garamond, Inter } from "next/font/google"
```

Replace `geistSans` and `geistMono` constants with:

```tsx
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700"],
})
```

Change `<html>` className to:

```tsx
className={`${inter.variable} ${cormorant.variable} dark`}
```

- [ ] **Step 2: Update CSS font variables**

In `apps/storefront/src/app/globals.css`, update the font variables:

```css
--font-heading: "Cormorant Garamond", ui-serif, Georgia, serif;
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
--font-mono: "Geist Mono", "Geist Mono Fallback", ui-monospace, monospace;
```

- [ ] **Step 3: Run build**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront build
```

Expected: pass. If network/font fetching blocks local build, revert this task and keep existing local Geist fonts.

---

### Task 9: Browser Verification

**Files:**
- No code edits.

- [ ] **Step 1: Run dev server**

Run:

```powershell
corepack pnpm --filter @allpencils/storefront dev
```

Expected: local server starts, typically at `http://localhost:3000`.

- [ ] **Step 2: Verify homepage**

Open `http://localhost:3000`.

Check:

- Hero visible above fold.
- Artist/School/Work cards visible.
- Featured product rail appears when Medusa env is configured.
- Craft strip appears.
- Recommendation rail appears when product data is ready.
- Assistant teaser button opens the sheet.
- Assistant choices update response text.
- Mobile width stacks without overlap.

- [ ] **Step 3: Verify product detail**

Open one product detail route from `/products`.

Check:

- Product image renders through `next/image`.
- Variant picker still works.
- Add-to-cart still works.
- `You might also like` rail appears.
- No direct cart/checkout behavior changed.

---

### Task 10: Final Verification And Docs

**Files:**
- Modify: `docs/build-plan.md`
- Modify: `docs/prompt.md`

- [ ] **Step 1: Run required checks**

Run:

```powershell
git status --short
corepack pnpm --filter @allpencils/storefront lint
corepack pnpm --filter @allpencils/storefront typecheck
corepack pnpm --filter @allpencils/storefront build
```

Expected:

- Storefront lint passes.
- Storefront typecheck passes.
- Storefront build passes.
- `git status --short` shows only intentional Phase 3 changes plus any known pre-existing backend line-ending noise.

- [ ] **Step 2: Update docs**

In `docs/build-plan.md`, mark Phase 3 implementation as in progress or verified depending on checks.

In `docs/prompt.md`, update current code truth with:

- Homepage uses reusable storefront sections.
- Recommendations are deterministic.
- Assistant is scripted/static.
- Product detail recommendation rail exists.

- [ ] **Step 3: Commit**

Run:

```powershell
git add apps/storefront/src/app apps/storefront/src/components apps/storefront/src/data apps/storefront/src/lib/recommendations.ts docs/build-plan.md docs/prompt.md
git commit -m "Build reusable storefront homepage"
```

Expected: commit succeeds. Do not stage `.env`, `.env.local`, `.env.test`, `.superpowers`, or backend line-ending noise.

---

## Self-Review

Spec coverage:

- Reusable Tailwind/shadcn section system: Tasks 3-6.
- Homepage A+B direction: Tasks 1, 4, 6.
- Product detail recommendations: Task 7.
- Scripted assistant: Tasks 1 and 5.
- Light Phase 3 motion: covered by existing CSS transitions in section/card/sheet components.
- Phase 4 animation/3D preservation: design remains in docs; no new dependencies in this plan.
- Google Fonts: optional Task 8.
- Verification: Tasks 9 and 10.

Placeholder scan:

- No `TBD`, `TODO`, or undefined future functions remain in the planned code.
- Task 8 is explicitly optional and gives a concrete do/revert condition.

Type consistency:

- Recommendation helpers use `StoreProduct` from `@/lib/medusa`.
- `RecommendationRail` props match homepage and product detail usage.
- Assistant types match `assistantChoices` consumer.
