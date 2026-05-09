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
          <h1 className="max-w-4xl text-5xl font-semibold text-balance sm:text-6xl lg:text-7xl">
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
