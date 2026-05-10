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
    <section className="relative isolate overflow-hidden atelier-surface px-6 text-[#f8ecd8] sm:px-10">
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
